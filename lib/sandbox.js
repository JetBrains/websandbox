import uuid from 'an-uuid';
import Connection from './connection';
import FrameContent from 'html?interpolate!./iframe-src.html';

export const BaseOptions = {
    //This pathes is used only for old browsers without srcdoc support
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js', //TODO: this param isn't used yet

    frameClassName: 'sandboxjs__frame'
};

class Sandbox {
    constructor(localApi, options) {
        this.id = uuid();
        this.options = options;
        this.iframe = this.createIframe();

        this.promise = new Promise((resolve) => {
            this.connection = new Connection(localApi, this.iframe.contentWindow.postMessage, listener => {
                //TODO: free listener on destroy
                window.addEventListener('message', (e) => {
                    if (e.data.type === 'iframe_initialized') {
                        return resolve(this);
                    }

                    return listener(e);
                });
            });
        });
    }

    createIframe() {
        var frame = document.createElement('iframe');
        frame.id = this.id;
        frame.sandbox = 'allow-scripts';
        frame.srcdoc = FrameContent;
        //Fallback for old browsers
        frame.src = `${this.options.baseSandboxPath}/${this.options.frameHtmlFileName}`;

        document.body.appendChild(frame);

        return frame;
    }

    runCode(code) {
        this.iframe.contentWindow.postMessage({
            type: 'run_code',
            code: code
        }, '*');
    }

    runScript(script) {
        this.iframe.contentWindow.postMessage({
            type: 'import_script',
            scriptPath: script
        }, '*');
    }
}

export default Sandbox;