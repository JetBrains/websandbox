import Connection from './connection';

class Frame {
    constructor() {
        this.connection = new Connection({}, window.postMessage, function registerOnMessageListener(listener) {
            window.addEventListener('message', listener);
        });
    }

    runCode(code) {
        var s = document.createElement('script');
        s.innerHTML = code;
        document.body.appendChild(s);
    }

    runScript(scriptUrl) {
        var s = document.createElement('script');
        s.src = scriptUrl;
        document.body.appendChild(s);
    }
}

module.exports = Frame; //eslint-disable-line