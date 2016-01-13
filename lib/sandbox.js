import uuid from 'an-uuid';

class Sandbox {
    constructor(scriptUrl, options) {
        this.options = options;
        this.iframe = this.createIframe();
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