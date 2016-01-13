import Sandbox from './sandbox';

const baseOptions = {
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js',
}

module.exports = {
    create: (scriptUrl, options = {}) => {
        return new Sandbox(scriptUrl, Object.assign(options, baseOptions));
    }
}