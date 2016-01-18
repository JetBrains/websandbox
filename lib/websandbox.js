import uuid from 'an-uuid';
import Connection from './connection';
import FrameContent from 'html?interpolate!./iframe-src.html';

const ID_PREFIX = 'websandbox-';

export const BaseOptions = {
    //This pathes is used only for old browsers without srcdoc support
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js', //TODO: this param isn't used yet

    iframeContainer: 'body',
    frameClassName: 'websandbox__frame'
};

class Websandbox {
    static create(localApi, options = {}) {
        return new Websandbox(localApi, Object.assign(BaseOptions, options));
    }

    constructor(localApi, options) {
        this.id = ID_PREFIX + uuid();
        this.options = options;
        this.iframe = this.createIframe();

        this.promise = new Promise((resolve) => {
            this.connection = new Connection(this.id, this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow), listener => {
                //TODO: free listener on destroy
                window.addEventListener('message', listener);
            });

            this.connection.setServiceMethods({
                iframeInitialized: () => {
                    return this.connection.setLocalApi(localApi)
                        .then(() => resolve(this));
                }
            });
        });
    }

    createIframe() {
        const containerSelector = this.options.iframeContainer;
        const container = containerSelector.replace ? document.querySelector(containerSelector) : containerSelector;

        if (!container) {
            throw new Error('Cannot find container for sandbox ' + container);
        }
        const frame = document.createElement('iframe');
        frame.id = this.id;
        frame.sandbox = 'allow-scripts';
        frame.className = this.options.frameClassName;
        frame.srcdoc = FrameContent.replace('{{SANDBOX_ID}}', this.id);
        //Fallback for old browsers
        frame.src = `${this.options.baseSandboxPath}/${this.options.frameHtmlFileName}?id=${this.id}`;

        container.appendChild(frame);

        return frame;
    }

    runCode(code) {
        return this.connection.callRemoteServiceMethod('runCode', code);
    }

    importScript(script) {
        return this.connection.callRemoteServiceMethod('importScript', script);
    }
}

export default Websandbox;