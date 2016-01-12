const baseOptions = {
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js',
}

class Sandbox {
    constructor(scriptUrl, options) {
        this.options = options;
        this.iframe = this.createIframe();
    }

    createIframe() {
        var frame = document.createElement('iframe');
        frame.src = `${this.options.baseSandboxPath}/${this.options.frameHtml}`;
        frame.sandbox = 'allow-scripts';
        frame.style.display = 'none';
        document.body.appendChild(frame);

        return frame;
    }
}

module.exports = {
    create: function (scriptUrl, options = {}) {
        return new Sandbox(scriptUrl, Object.assign(options, baseOptions));
    }
}