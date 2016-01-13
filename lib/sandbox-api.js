import Sandbox from './sandbox';

const baseOptions = {
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js'
}

export default {
    create: (scriptUrl, options = {}) => {
        return new Sandbox(scriptUrl, Object.assign(options, baseOptions));
    }
}