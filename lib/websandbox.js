import uuid from 'an-uuid';
import Connection from './connection';
import FrameContent from './iframe-src.html';
import CompiledFrameScript from 'compile-code?asString=true!./frame.js';
import {Promise} from 'es6-promise-polyfill';

const ID_PREFIX = 'websandbox-';

export const BaseOptions = {
    //This pathes is used only for old browsers without srcdoc support
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',

    frameContainer: 'body',
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
                window.addEventListener('message', listener);
                this.removeMessageListener = () => window.removeEventListener('message', listener);
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
        const containerSelector = this.options.frameContainer;
        const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;

        let frameContent = FrameContent.replace('{{SANDBOX_ID}}', this.id);
        frameContent = frameContent.replace('{{IFRAME_CODE}}', CompiledFrameScript);

        if (!container) {
            throw new Error('Cannot find container for sandbox ' + container);
        }
        const frame = document.createElement('iframe');
        frame.id = this.id;
        frame.sandbox = 'allow-scripts';
        frame.className = this.options.frameClassName;
        frame.srcdoc = frameContent;
        //Fallback for old browsers
        frame.src = `${this.options.baseSandboxPath}/${this.options.frameHtmlFileName}?id=${this.id}`;

        container.appendChild(frame);

        return frame;
    }

    destroy() {
        this.iframe.remove();
        this.removeMessageListener();
    }

    _runCode(code) {
        return this.connection.callRemoteServiceMethod('runCode', code);
    }

    _runFunction(fn) {
        const name = fn.name;
        let code = fn.toString();
        code += `\r${name}()`;
        return this._runCode(code);
    }

    run(codeOrFunction) {
        if (codeOrFunction.name) {
            return this._runFunction(codeOrFunction);
        }
        return this._runCode(codeOrFunction);
    }

    importScript(path) {
        return this.connection.callRemoteServiceMethod('importScript', path);
    }

    injectStyle(style) {
        return this.connection.callRemoteServiceMethod('injectStyle', style);
    }
}

export default Websandbox;