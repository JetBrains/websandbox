import 'file?name=frame.html!./iframe-src.html';
import Websandbox from './websandbox';
import {BaseOptions as SandboxBaseOptions} from './websandbox';

module.exports = { //eslint-disable-line
    create: (localApi, options = {}) => {
        return new Websandbox(localApi, Object.assign(SandboxBaseOptions, options));
    }
};