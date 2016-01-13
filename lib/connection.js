import uuid from 'an-uuid';
import {Promise} from 'es6-promise-polyfill';
const CONNECTION_ID_PREFIX = 'sandboxjs-connection-';
const TYPE_MESSAGE = 'message';
const TYPE_RESPONSE = 'response';

class Connection {
    constructor(localApi, postMessage, registerOnMessageListener) {
        this.id = CONNECTION_ID_PREFIX + uuid();

        this.postMessage = postMessage;
        this.remote = {};
        this.localApi = localApi;
        this.callbacks = {};

        registerOnMessageListener(this.onMessageListener.bind(this));
    }

    onMessageListener(e) {
        if (e.type === TYPE_RESPONSE) {
            this.popCallback(e.callId, e.success, e.result);
        } else if (e.type === TYPE_MESSAGE) {
            this.callLocalApi(e.methodName, e.arguments)
                .then(res => this.responseOtherSide(e.callId, res))
        }
    }

    setInterface(remote) {
        this.remote = {};

        for (var key in remote) {
            this.remote[key] = this.createMethodWrapper(key);
        }
    }

    createMethodWrapper(methodName) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                const id = this.registerCallback(resolve, reject);
                this.callOtherSide(id, methodName, ...args);
            });
        };
    }

    callOtherSide(id, methodName, ...args) {
        this.postMessage({
            callId: id,
            methodName: methodName,
            type: TYPE_MESSAGE,
            arguments: args
        }, '*');
    }

    callLocalApi(methodName, args) {
        return Promise.resolve(this.localApi[methodName](...args));
    }

    responseOtherSide(id, result) {
        this.postMessage({
            callId: id,
            type: TYPE_RESPONSE,
            success: true,
            result: result
        }, '*');
    }

    registerCallback(successCallback, failureCallback) {
        const id = uuid();
        this.callbacks[id] = {successCallback, failureCallback};
        return id;
    }

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