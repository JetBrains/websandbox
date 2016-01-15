import 'file?name=frame.html!./iframe-src.html';
import Sandbox from './sandbox';
import {BaseOptions as SandboxBaseOptions} from './sandbox';

module.exports = { //eslint-disable-line
    create: (localApi, scriptUrl, options = {}) => {
        return new Sandbox(localApi, scriptUrl, Object.assign(SandboxBaseOptions, options));
    }
}