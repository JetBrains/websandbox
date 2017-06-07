export const TYPE_MESSAGE = 'message';
export const TYPE_RESPONSE = 'response';
export const TYPE_SET_INTERFACE = 'set-interface';
export const TYPE_SERVICE_MESSAGE = 'service-message';

const defaultOptions = {
  allowedSenderOrigin: undefined
};

class Connection {
  constructor(postMessage, registerOnMessageListener, options) {
    this.options = Object.assign({}, defaultOptions, options);
    //Random number between 0 and 100000
    this.incrementalID = Math.floor(Math.random() * 100000);

    this.postMessage = postMessage;
    this.remote = {};
    this.callbacks = {};

    this.remoteMethodsWaitPromise = new Promise(resolve => {
      this._resolveRemoteMethodsPromise = resolve;
    });

    registerOnMessageListener((...args) => this.onMessageListener(...args));
  }

  /**
     * Listens to remote messages. Calls local method if it is called outside or call stored callback if it is response.
     * @param e - onMessage event
     */
  onMessageListener(e) {
    const data = e.data;

    if (this.options.allowedSenderOrigin && e.origin !== this.options.allowedSenderOrigin) {
      return;
    }

    if (data.type === TYPE_RESPONSE) {
      this.popCallback(data.callId, data.success, data.result);
    } else if (data.type === TYPE_MESSAGE) {
      this
        .callLocalApi(data.methodName, data.arguments)
        .then(res => this.responseOtherSide(data.callId, res));
    } else if (data.type === TYPE_SET_INTERFACE) {
      this.setInterface(data.apiMethods);
      this.responseOtherSide(data.callId);
    } else if (data.type === TYPE_SERVICE_MESSAGE) {
      this
        .callLocalServiceMethod(data.methodName, data.arguments)
        .then(res => this.responseOtherSide(data.callId, res));
    }
  }

  postMessageToOtherSide(dataToPost) {
    this.postMessage(dataToPost, '*');
  }

  /**
     * Sets remote interface methods
     * @param remote - hash with keys of remote API methods. Values is ignored
     */
  setInterface(remoteMethods) {
    this.remote = {};

    remoteMethods.forEach(
      key => this.remote[key] = this.createMethodWrapper(key)
    );

    this._resolveRemoteMethodsPromise();
  }

  setLocalApi(api) {
    return new Promise((resolve, reject) => {
      const id = this.registerCallback(resolve, reject);
      this.postMessageToOtherSide({
        callId: id,
        apiMethods: Object.keys(api),
        type: TYPE_SET_INTERFACE
      });
    }).then(() => this.localApi = api);
  }

  setServiceMethods(api) {
    this.serviceMethods = api;
  }

  /**
     * Calls local method
     * @param methodName
     * @param args
     * @returns {Promise.<*>|string}
     */
  callLocalApi(methodName, args) {
    return Promise.resolve(this.localApi[methodName](...args));
  }

  /**
     * Calls local method registered as "service method"
     * @param methodName
     * @param args
     * @returns {Promise.<*>}
     */
  callLocalServiceMethod(methodName, args) {
    if (!this.serviceMethods[methodName]) {
      throw new Error(`Serivce method ${methodName} is not registered`);
    }
    return Promise.resolve(this.serviceMethods[methodName](...args));
  }

  /**
     * Wraps remote method with callback storing code
     * @param methodName - method to wrap
     * @returns {Function} - function to call as remote API interface
     */
  createMethodWrapper(methodName) {
    return (...args) => {
      return this.callRemoteMethod(methodName, ...args);
    };
  }

  /**
     * Calls other side with arguments provided
     * @param id
     * @param methodName
     * @param args
     */
  callRemoteMethod(methodName, ...args) {
    return new Promise((resolve, reject) => {
      const id = this.registerCallback(resolve, reject);
      this.postMessageToOtherSide({
        callId: id,
        methodName: methodName,
        type: TYPE_MESSAGE,
        arguments: args
      });
    });
  }

  /**
     * Calls remote service method
     * @param methodName
     * @param args
     * @returns {*}
     */
  callRemoteServiceMethod(methodName, ...args) {
    return new Promise((resolve, reject) => {
      const id = this.registerCallback(resolve, reject);
      this.postMessageToOtherSide({
        callId: id,
        methodName: methodName,
        type: TYPE_SERVICE_MESSAGE,
        arguments: args
      });
    });
  }

  /**
     * Respond to remote call
     * @param id - remote call ID
     * @param result - result to pass to calling function
     */
  responseOtherSide(id, result) {
    this.postMessage(
      {
        callId: id,
        type: TYPE_RESPONSE,
        success: true,
        result: result
      },
      '*'
    );
  }

  /**
     * Stores callbacks to call later when remote call will be answered
     * @param successCallback
     * @param failureCallback
     */
  registerCallback(successCallback, failureCallback) {
    const id = (++this.incrementalID).toString();
    this.callbacks[id] = {successCallback, failureCallback};
    return id;
  }

  /**
     * Calls and delete stored callback
     * @param id - call id
     * @param success - was call successful
     * @param result - result of remote call
     */
  popCallback(id, success, result) {
    if (success) {
      this.callbacks[id].successCallback(result);
    } else {
      this.callbacks[id].failureCallback(result);
    }
    delete this.callbacks[id];
  }
}

export default Connection;
