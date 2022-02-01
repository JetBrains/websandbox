import Connection from './connection';

class Frame {
  connection: Connection;

  constructor() {
    this.connection = new Connection(
      window.parent.postMessage.bind(window.parent),
      listener => {
        window.addEventListener('message', listener);
      }
    );

    this.connection.setServiceMethods({
      runCode: (code: string) => this.runCode(code),
      importScript: (path: string) => this.importScript(path),
      injectStyle: (style: string) => this.injectStyle(style),
      importStyle: (path: string) => this.importStyle(path)
    });

    this.connection.callRemoteServiceMethod('iframeInitialized');
  }

  /**
     * Creates script tag with passed code and attaches it. Runs synchronous
     * @param code
     */
  runCode(code: string) {
    var scriptTag = document.createElement('script');
    scriptTag.innerHTML = code;
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
  }

  importScript(scriptUrl: string) {
    var scriptTag = document.createElement('script');
    scriptTag.src = scriptUrl;
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
    return new Promise<void>(resolve => scriptTag.onload = () => resolve());
  }

  injectStyle(style: string) {
    var styleTag = document.createElement('style');
    styleTag.innerHTML = style;
    document.getElementsByTagName('head')[0].appendChild(styleTag);
  }

  importStyle(styleUrl: string) {
    var linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = styleUrl;
    document.getElementsByTagName('head')[0].appendChild(linkTag);
  }
}

const Websandbox = new Frame();

// @ts-expect-error
window.Websandbox = window.Websandbox || Websandbox;

module.exports = Websandbox; // eslint-disable-line
