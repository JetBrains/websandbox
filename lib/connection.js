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
            this.popCallback(e.callId, e.success, e.data);
        } else if (e.type === TYPE_MESSAGE) {
            this.callLocalApi(e.methodName, e.data)
                .then(res => this.responseOtherSide(e.callId, res))
        }
    }

    setInterface(remote) {
        this.remote = {};

        for (var key in remote) {
            this.remote[key] = this.createMethodWrapper(remote[key]);
        }
    }

    createMethodWrapper(fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                const id = this.registerCallback(resolve, reject);
                this.callOtherSide(id, ...args);
            });
        };
    }

    callOtherSide(id, ...args) {
        this.postMessage({
            callId: id,
            type: TYPE_MESSAGE,
            data: args
        }, '*');
    }

    callLocalApi(methodName, args) {
        return Promise.resolve(this.localApi[methodName](...args));
    }

    responseOtherSide(...args) {
        this.postMessage({
            callId: id,
            type: TYPE_RESPONSE,
            data: args
        }, '*');
    }

    registerCallback(successCallback, failureCallback) {
        const id = uuid();
        this.callbacks[id] = {successCallback, failureCallback};
        return id;
    }

    popCallback(id, success, args) {
        if (success) {
            this.callback[id].successCallback(...args);
        } else {
            this.callback[id].failureCallback(...args);
        }
        delete this.callbacks[id];
    }
}

export default Connection;