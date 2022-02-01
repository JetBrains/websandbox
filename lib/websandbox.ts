import Connection from './connection';
// @ts-expect-error
import CompiledFrameScript from 'compile-code-loader!./frame.ts';
import { API } from './types';

export interface SandboxOptions {
  // A selector or DOM node where iframe will be appended
  frameContainer: string | Element;
  // A class that <iframe/> element will has
  frameClassName?: string;
  /*
  A url of iframe content. 
  If set, "frameContent", "codeToRunBeforeInit", "initialStyles", "baseUrl" won't take any effect.
  In order to work properly, html file by frameSrc should have ./frame.js code bundled
  */
  frameSrc?: string | null;
  // A content of sandbox iFrame
  frameContent?: string;
  // A js code to run before any other iFrame code (will be injected in <head/>)
  codeToRunBeforeInit?: string | null,
  // A CSS markup to inject into iFrame <head/>
  initialStyles?: string | null,
  // A URL that will be used as base url for all relative pathes in tags like <script/>, <link/>. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
  baseUrl?: string | null,
  // Is sandboxed iFrame allowed to capture pointer. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
  allowPointerLock?: boolean,
  // Is iFrame allowed to go fullscreen. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
  allowFullScreen?: boolean,
  // Additional attributes to add into sandboxed iFrame
  sandboxAdditionalAttributes?: string
}

export const BaseOptions: SandboxOptions = {
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
  allowFullScreen: false,
  sandboxAdditionalAttributes: ''
};

class Websandbox {
  options: SandboxOptions;
  iframe: HTMLIFrameElement;
  promise: Promise<unknown>;
  connection: Connection | null = null;
  removeMessageListener: () => void = () => {};
  
  /**
   * Creates sandbox instancea
   * @param localApi Api of this side. Will be available for sandboxed code as remoteApi
   * @param options Options of created sandbox
   */
  static create(localApi: API, options = {}) {
    return new Websandbox(localApi, Object.assign(BaseOptions, options));
  }

  /**
   * {Constructor}
   * @param localApi
   * @param options
   */
  constructor(localApi: API, options: SandboxOptions) {
    this.options = options;
    this.iframe = this.createIframe();

    this.promise = new Promise(resolve => {
      this.connection = new Connection(
        this.iframe.contentWindow!.postMessage.bind(this.iframe.contentWindow),
        listener => {
          const sourceCheckListener = (event: MessageEvent) => {
            if (event.source !== this.iframe.contentWindow) {
              return;
            }
            return listener(event);
          };
          window.addEventListener('message', sourceCheckListener);
          this.removeMessageListener = () => window.removeEventListener('message', sourceCheckListener);
        },
        {allowedSenderOrigin: 'null'}
      );

      this.connection.setServiceMethods({
        iframeInitialized: () => {
          return this.connection!
            .setLocalApi(localApi)
            .then(() => resolve(this));
        }
      });
    });
  }

  _prepareFrameContent(options: SandboxOptions) {
    let frameContent = options.frameContent
      ?.replace('</head>', `<script>${CompiledFrameScript}</script>\n</head>`) ?? '';

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
    // @ts-expect-error
    frame.sandbox = `allow-scripts ${this.options.sandboxAdditionalAttributes}`;
    frame.className = this.options.frameClassName ?? '';
    if (this.options.allowFullScreen) {
      frame.allowFullscreen = true;
    }

    if (this.options.frameSrc) {
      frame.src = this.options.frameSrc;
      container.appendChild(frame);
      return frame;
    }

    if (this.options.frameContent && this.options.frameContent.indexOf('<head>') < 0) {
      throw new Error('Websandbox: iFrame content must have "<head>" tag.');
    }

    frame.setAttribute('srcdoc', this._prepareFrameContent(this.options));
    container.appendChild(frame);
    return frame;
  }

  destroy() {
    this.iframe.remove();
    this.removeMessageListener();
  }

  _runCode(code: string) {
    return this.connection!.callRemoteServiceMethod('runCode', code);
  }

  _runFunction(fn: Function) {
    return this._runCode(`(${fn.toString()})()`);
  }

  run(codeOrFunction: string | Function) {
    if ((codeOrFunction as Function).name) {
      return this._runFunction(codeOrFunction as Function);
    }
    return this._runCode(codeOrFunction as string);
  }

  importScript(path: string) {
    return this.connection!.callRemoteServiceMethod('importScript', path);
  }

  injectStyle(style: string) {
    return this.connection!.callRemoteServiceMethod('injectStyle', style);
  }
}

export default Websandbox;
