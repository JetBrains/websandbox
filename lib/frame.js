import Connection from './connection';

class Frame {
    constructor() {
        this.connection = new Connection({}, window.postMessage, function registerOnMessageListener(listener) {
            window.addEventListener('message', listener);
        });
    }
}

module.exports = Frame; //eslint-disable-line