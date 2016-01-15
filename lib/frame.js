import Connection from './connection';

class Frame {
    constructor() {
        this.connection = new Connection({}, window.postMessage, function registerOnMessageListener(listener) {
            window.addEventListener('message', listener);
        });

        window.parent.postMessage({type: 'iframe_initialized'}, '*');
    }
}
new Frame();

module.exports = Frame; //eslint-disable-line