import Sandbox from './sandbox';

const baseOptions = {
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js'
}

export default {
    create: (localApi, scriptUrl, options = {}) => {
        return new Sandbox(localApi, scriptUrl, Object.assign(options, baseOptions));
    }
}