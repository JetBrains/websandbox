import uuid from 'an-uuid';
import {Promise} from 'es6-promise-polyfill';
const TYPE_MESSAGE = 'message';
const TYPE_RESPONSE = 'response';
const TYPE_SET_INTERFACE = 'set-interface';

class Connection {
    constructor(id, postMessage, registerOnMessageListener) {
        this.id = id;

        this.postMessage = postMessage;
        this.remote = {};
        this.callbacks = {};

        registerOnMessageListener(this.onMessageListener.bind(this));
    }

    /**
     * Listens to remote messages. Calls local method if it is called outside or call stored callback if it is response.
     * @param e - onMessage event
     */
    onMessageListener(e) {
        const data = e.data;
        if (data.type === TYPE_RESPONSE) {
            this.popCallback(data.callId, data.success, data.result);
        } else if (data.type === TYPE_MESSAGE) {
            this.callLocalApi(data.methodName, data.arguments)
                .then(res => this.responseOtherSide(data.callId, res));
        } else if (data.type === TYPE_SET_INTERFACE) {
            this.setInterface(data.api);
            this.responseOtherSide(data.callId);
        }
    }

    postMessageToOtherSide(dataToPost) {
        this.postMessage(dataToPost, '*');
    }

    /**
     * Sets remote interface methods
     * @param remote - hash with keys of remote API methods. Values is ignored
     */
    setInterface(remote) {
        this.remote = {};

        for (var key in remote) {
            this.remote[key] = this.createMethodWrapper(key);
        }
    }

    setLocalApi(api) {
        const apiMethods = {};
        for (var key in api) {
            apiMethods[key] = '123';
        }

        return new Promise((resolve, reject) => {
            const id = this.registerCallback(resolve, reject);
            this.postMessageToOtherSide({
                callId: id,
                api: apiMethods,
                type: TYPE_SET_INTERFACE
            });
        })
            .then(() => this.localApi = api);
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
     * Wraps remote method with callback storing code
     * @param methodName - method to wrap
     * @returns {Function} - function to call as remote API interface
     */
    createMethodWrapper(methodName) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                const id = this.registerCallback(resolve, reject);
                this.callRemoteMethod(id, methodName, ...args);
            });
        };
    }

    /**
     * Calls other side with arguments provided
     * @param id
     * @param methodName
     * @param args
     */
    callRemoteMethod(id, methodName, ...args) {
        this.postMessageToOtherSide({
            callId: id,
            methodName: methodName,
            type: TYPE_MESSAGE,
            arguments: args
        });
    }

    /**
     * Respond to remote call
     * @param id - remote call ID
     * @param result - result to pass to calling function
     */
    responseOtherSide(id, result) {
        this.postMessage({
            callId: id,
            type: TYPE_RESPONSE,
            success: true,
            result: result
        }, '*');
    }

    /**
     * Stores callbacks to call later when remote call will be answered
     * @param successCallback
     * @param failureCallback
     */
    registerCallback(successCallback, failureCallback) {
        const id = uuid();
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
        if (!this.callbacks[id]) {
            debugger;
        }
        if (success) {
            this.callbacks[id].successCallback(result);
        } else {
            this.callbacks[id].failureCallback(result);
        }
        delete this.callbacks[id];
    }
}

export default Connection;