import uuid from 'an-uuid';
import Connection from './connection';
import CompiledFrameScript from 'compile-code-loader?asString=true!./frame.js';

/**
 * @typedef {Object} SandboxOptions
 * @property {string|DOMNode} frameContainer A selector or DOM node where iframe will be appended
 * @property {string} frameClassName A class that <iframe/> element will has
 * @property {string} frameSrc A url of iframe content. 
 * If set, "frameContent", "codeToRunBeforeInit", "initialStyles", "baseUrl" won't take any effect.
 * In order to work properly, html file by frameSrc should have ./frame.js code bundled
 * @property {?string} frameContent A content of sandbox iFrame
 * @property {?string} codeToRunBeforeInit A js code to run before any other iFrame code (will be injected in <head/>)
 * @property {?string} initialStyles A CSS markup to inject into iFrame <head/>
 * @property {?string} baseUrl A URL that will be used as base url for all relative 
 * pathes in tags like <script/>, <link/>. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
 * @property {?boolean} allowPointerLock Is sandboxed iFrame allowed to capture pointer. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
 * @property {?boolean} allowFullScreen Is iFrame allowed to go fullscreen. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
 */
export const BaseOptions = {
  frameContainer: 'body',
  frameClassName: 'websandbox__frame',
  frameSrc: null,
  frameContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body></body>
</html>
  `,
  codeToRunBeforeInit: null,
  initialStyles: null,
  baseUrl: null,
  allowPointerLock: false,
  allowFullScreen: false
};

const ID_PREFIX = 'websandbox-';

class Websandbox {
  /**
   * Creates sandbox instancea
   * @param {?Object} localApi Api of this side. Will be available for sandboxed code as remoteApi
   * @param {?SandboxOptions} options Options of created sandbox
   */
  static create(localApi, options = {}) {
    return new Websandbox(localApi, Object.assign(BaseOptions, options));
  }

  /**
   * {Constructor}
   * @param {?Object} localApi
   * @param {?SandboxOptions} options
   */
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

  _prepareFrameContent(id, options) {
    const scriptContent = CompiledFrameScript.replace('{{SANDBOX_ID}}', id);
    let frameContent = options.frameContent
      .replace('</head>', `<script>${scriptContent}</script>\n</head>`);

    if (options.initialStyles) {
      frameContent = frameContent
        .replace('</head>', `<style>${options.initialStyles}</style>\n</head>`);
    }

    if (options.baseUrl) {
      frameContent = frameContent
        .replace('<head>', `<head>\n<base href="${options.baseUrl}"/>`);
    }

    if (options.codeToRunBeforeInit) {
      frameContent = frameContent
        .replace('<head>', `<head>\n<script>${options.codeToRunBeforeInit}</script>`);
    }
    return frameContent;
  }

  createIframe() {
    const containerSelector = this.options.frameContainer;
    const container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;

    if (!container) {
      throw new Error('Websandbox: Cannot find container for sandbox ' + container);
    }

    const frame = document.createElement('iframe');
    frame.id = this.id;
    frame.sandbox = `allow-scripts${this.options.allowPointerLock ? ' allow-pointer-lock' : ''}`;
    frame.className = this.options.frameClassName;
    frame.frameborder = '0';
    if (this.options.allowFullScreen) {
      frame.allowfullscreen = "true";
    }

    if (this.options.frameSrc) {
      frame.src = `${this.options.frameSrc}?id=${this.id}`;
      container.appendChild(frame);
      return frame;
    }

    if (this.options.frameContent.indexOf('<head>') < 0) {
      throw new Error('Websandbox: iFrame content must have "<head>" tag.');
    }

    frame.setAttribute('srcdoc', this._prepareFrameContent(this.id, this.options));
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
