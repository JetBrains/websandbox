import uuid from 'an-uuid';
import Connection from './connection';

class Sandbox {
    constructor(localApi, scriptUrl, options) {
        this.options = options;
        this.iframe = this.createIframe();

        this.connection = new Connection(localApi, window.postMessage, function registerOnMessageListener(listener) {
            //TODO: free listener on destroy
            window.addEventListener('message', listener);
        });
    }

    createIframe() {
        var frame = document.createElement('iframe');
        frame.id = uuid();
        frame.src = `${this.options.baseSandboxPath}/${this.options.frameHtml}`;
        frame.sandbox = 'allow-scripts';
        frame.style.display = 'none';
        document.body.appendChild(frame);

        return frame;
    }

    runCode(code) {

    }

    runScript(script) {

    }
}

export default Sandbox;