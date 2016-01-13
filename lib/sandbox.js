import uuid from 'an-uuid';
import Connection from './connection';

export const BaseOptions = {
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js'
}

class Sandbox {
    constructor(localApi, scriptUrl, options) {
        this.id = uuid();
        this.options = options;
        this.iframe = this.createIframe();

        this.connection = new Connection(localApi, this.iframe.contentWindow.postMessage, function registerOnMessageListener(listener) {
            //TODO: free listener on destroy
            window.addEventListener('message', listener);
        });
    }

    createIframe() {
        var frame = document.createElement('iframe');
        frame.id = this.id;
        frame.src = `${this.options.baseSandboxPath}/${this.options.frameHtmlFileName}`;
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