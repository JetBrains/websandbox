import 'file?name=frame.html!./iframe-src.html';
import Sandbox from './sandbox';

const baseOptions = {
    baseSandboxPath: '',
    frameHtmlFileName: 'frame.html',
    frameScriptFileName: 'frame.js'
}

module.exports = { //eslint-disable-line
    create: (localApi, scriptUrl, options = {}) => {
        return new Sandbox(localApi, scriptUrl, Object.assign(options, baseOptions));
    }
}