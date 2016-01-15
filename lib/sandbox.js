import uuid from 'an-uuid';
import Connection from './connection';
import FrameCode from 'raw!uglify!compile!./frame';

export const BaseOptions = {
    frameClassName: 'sandboxjs__frame'
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
        frame.src = 'javascript:' + FrameCode;

        frame.sandbox = 'allow-scripts';
        frame.className = this.options.frameClassName;
        frame.onload = function() {
            console.log('iframe onload'); //eslint-disable-line
        };
        document.body.appendChild(frame);

        return frame;
    }

    runCode(code) {

    }

    runScript(scriptUrl) {

    }
}

export default Sandbox;