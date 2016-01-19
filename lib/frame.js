import Connection from './connection';

class Frame {
    constructor() {
        this.id = window.SANDBOX_ID;
        this.connection = new Connection(this.id, window.parent.postMessage.bind(window.parent), listener => {
            window.addEventListener('message', listener);
        });

        this.connection.setServiceMethods({
            runCode: (code) => {
                return this.runCode(code);
            },
            importScript: (path => {
                return this.importScript(path);
            })
        });

        this.connection.callRemoteServiceMethod('iframeInitialized');
    }

    /**
     * Creates script tag with passed code and attaches it. Runs synchronous
     * @param code
     */
    runCode(code) {
        var scriptTag = document.createElement('script');
        scriptTag.innerHTML = code;
        document.body.appendChild(scriptTag);
    }

    importScript(scriptUrl) {
        var scriptTag = document.createElement('script');
        scriptTag.src = scriptUrl;
        document.body.appendChild(scriptTag);
        return new Promise(resolve => scriptTag.onload = () => resolve());
    }
}

window.Websandbox = new Frame();

module.exports = window.Websandbox; //eslint-disable-line