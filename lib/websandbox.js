import uuid from 'an-uuid';
import Connection from './connection';
import defaultFrameContent from './iframe-src.html';
import CompiledFrameScript from 'compile-code-loader?asString=true!./frame.js';

const ID_PREFIX = 'websandbox-';

export const BaseOptions = {
  frameContainer: 'body',
  frameClassName: 'websandbox__frame',
  frameContent: defaultFrameContent,
  codeToRunBeforeInit: null,
  baseUrl: null // If set, <base/> tag will be added
};

class Websandbox {
  static create(localApi, options = {}) {
    return new Websandbox(localApi, Object.assign(BaseOptions, options));
  }

  constructor(localApi, options) {
    this.id = ID_PREFIX + uuid();
    this.options = options;
    this.iframe = this.createIframe();

    this.promise = new Promise(resolve => {
      this.connection = new Connection(
        this.id,
        this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow),
        listener => {
          window.addEventListener('message', listener);
          this.removeMessageListener = () =>
            window.removeEventListener('message', listener);
        }
      );

      this.connection.setServiceMethods({
        iframeInitialized: () => {
          return this.connection
            .setLocalApi(localApi)
            .then(() => resolve(this));
        }
      });
    });
  }

  createIframe() {
    const containerSelector = this.options.frameContainer;
    const container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;

    if (!container) {
      throw new Error('Websandbox: Cannot find container for sandbox ' + container);
    }
    if (this.options.frameContent.indexOf('<head>') < 0) {
      throw new Error('Websandbox: iFrame content must have "<head>" tag.');
    }

    const scriptContent = CompiledFrameScript.replace('{{SANDBOX_ID}}', this.id);
    let frameContent = this.options.frameContent
      .replace('</head>', `<script>${scriptContent}</script>\n</head>`);

    if (this.options.baseUrl) {
      frameContent = frameContent
        .replace('<head>', `<head>\n<base href="${this.options.baseUrl}"/>`);
    }

    if (this.options.codeToRunBeforeInit) {
      frameContent = frameContent
        .replace('<head>', `<head>\n<script>${this.options.codeToRunBeforeInit}</script>`);
    }

    const frame = document.createElement('iframe');
    frame.id = this.id;
    frame.sandbox = 'allow-scripts';
    frame.className = this.options.frameClassName;
    frame.srcdoc = frameContent;

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
    return this._runCode(`(${fn.toString()})()`);
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
