/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/connection.ts"
/*!***************************!*\
  !*** ./lib/connection.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TYPE_MESSAGE: () => (/* binding */ TYPE_MESSAGE),
/* harmony export */   TYPE_RESPONSE: () => (/* binding */ TYPE_RESPONSE),
/* harmony export */   TYPE_SERVICE_MESSAGE: () => (/* binding */ TYPE_SERVICE_MESSAGE),
/* harmony export */   TYPE_SET_INTERFACE: () => (/* binding */ TYPE_SET_INTERFACE),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _object_path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./object-path */ "./lib/object-path.ts");

const TYPE_MESSAGE = 'message';
const TYPE_RESPONSE = 'response';
const TYPE_SET_INTERFACE = 'set-interface';
const TYPE_SERVICE_MESSAGE = 'service-message';
// @ts-expect-error this is IE11 obsolete check. It is not typed
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
const defaultOptions = {
    allowedSenderOrigin: 'null'
};
class Connection {
    constructor(postMessage, registerOnMessageListener, options = {}) {
        this.remote = {};
        this.serviceMethods = {};
        this.localApi = {};
        this.callbacks = {};
        this._resolveRemoteMethodsPromise = null;
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
        //Random number between 0 and 100000
        this.incrementalID = Math.floor(Math.random() * 100000);
        this.postMessage = postMessage;
        this.remoteMethodsWaitPromise = new Promise(resolve => {
            this._resolveRemoteMethodsPromise = resolve;
        });
        registerOnMessageListener((e) => this.onMessageListener(e));
    }
    /**
       * Listens to remote messages. Calls local method if it is called outside or call stored callback if it is response.
       * @param e - onMessage event
       */
    onMessageListener(e) {
        const data = e.data;
        const { allowedSenderOrigin } = this.options;
        if (allowedSenderOrigin && e.origin !== allowedSenderOrigin && !isIE11) {
            return;
        }
        if (data.type === TYPE_RESPONSE) {
            this.popCallback(data.callId, data.success, data.result);
        }
        else if (data.type === TYPE_MESSAGE) {
            this
                .callLocalApi(data.methodName, data.arguments)
                .then(res => this.responseOtherSide(data.callId, res))
                .catch(err => this.responseOtherSide(data.callId, err, false));
        }
        else if (data.type === TYPE_SET_INTERFACE) {
            this.setInterface(data.apiMethods);
            this.responseOtherSide(data.callId);
        }
        else if (data.type === TYPE_SERVICE_MESSAGE) {
            this
                .callLocalServiceMethod(data.methodName, data.arguments)
                .then(res => this.responseOtherSide(data.callId, res))
                .catch(err => this.responseOtherSide(data.callId, err, false));
        }
    }
    postMessageToOtherSide(dataToPost) {
        this.postMessage(dataToPost, '*');
    }
    /**
       * Sets remote interface methods
       * @param remote - hash with keys of remote API methods. Values is ignored
       */
    setInterface(remoteMethods) {
        var _a;
        this.remote = {};
        remoteMethods.forEach((key) => {
            const parts = (0,_object_path__WEBPACK_IMPORTED_MODULE_0__.splitPath)(key);
            if ((0,_object_path__WEBPACK_IMPORTED_MODULE_0__.hasUnsafeSegments)(parts)) {
                return;
            }
            let current = this.remote;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part];
            }
            current[parts[parts.length - 1]] = this.createMethodWrapper(key);
        });
        (_a = this._resolveRemoteMethodsPromise) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    getMethodsFromInterface(api) {
        return Object.keys(api).reduce((acc, key) => {
            if (typeof api[key] === 'object') {
                acc.push(...this.getMethodsFromInterface(api[key]).map(subKey => `${key}.${subKey}`));
            }
            else {
                acc.push(key);
            }
            return acc;
        }, []);
    }
    setLocalApi(api) {
        return new Promise((resolve, reject) => {
            const id = this.registerCallback(resolve, reject);
            this.postMessageToOtherSide({
                callId: id,
                apiMethods: this.getMethodsFromInterface(api),
                type: TYPE_SET_INTERFACE
            });
        }).then(() => this.localApi = api);
    }
    setServiceMethods(api) {
        this.serviceMethods = api;
    }
    /**
       * Calls local method
       * @param methodName
       * @param args
       * @returns {Promise.<*>|string}
       */
    callLocalApi(methodName, args) {
        const method = (0,_object_path__WEBPACK_IMPORTED_MODULE_0__.propertyByPath)(this.localApi, methodName);
        if (!method) {
            throw new Error(`Local method "${methodName}" is not registered`);
        }
        return Promise.resolve(method.call(this, ...args));
    }
    /**
       * Calls local method registered as "service method"
       * @param methodName
       * @param args
       * @returns {Promise.<*>}
       */
    callLocalServiceMethod(methodName, args) {
        const method = (0,_object_path__WEBPACK_IMPORTED_MODULE_0__.propertyByPath)(this.serviceMethods, methodName);
        if (!method) {
            throw new Error(`Service method ${methodName} is not registered`);
        }
        return Promise.resolve(method.call(this, ...args));
    }
    /**
       * Wraps remote method with callback storing code
       * @param methodName - method to wrap
       * @returns {Function} - function to call as remote API interface
       */
    createMethodWrapper(methodName) {
        return (...args) => {
            return this.callRemoteMethod(methodName, ...args);
        };
    }
    /**
       * Calls other side with arguments provided
       * @param id
       * @param methodName
       * @param args
       */
    callRemoteMethod(methodName, ...args) {
        return new Promise((resolve, reject) => {
            const id = this.registerCallback(resolve, reject);
            this.postMessageToOtherSide({
                callId: id,
                methodName: methodName,
                type: TYPE_MESSAGE,
                arguments: args
            });
        });
    }
    /**
       * Calls remote service method
       * @param methodName
       * @param args
       * @returns {*}
       */
    callRemoteServiceMethod(methodName, ...args) {
        return new Promise((resolve, reject) => {
            const id = this.registerCallback(resolve, reject);
            this.postMessageToOtherSide({
                callId: id,
                methodName: methodName,
                type: TYPE_SERVICE_MESSAGE,
                arguments: args
            });
        });
    }
    /**
       * Respond to remote call
       * @param id - remote call ID
       * @param result - result to pass to calling function
       */
    responseOtherSide(id, result, success = true) {
        if (result instanceof Error) {
            // Error could be non-serializable, so we copy properties manually
            result = [...Object.keys(result), 'message'].reduce((acc, it) => {
                acc[it] = result[it];
                return acc;
            }, {});
        }
        const doPost = () => this.postMessage({
            callId: id,
            type: TYPE_RESPONSE,
            success,
            result
        }, '*');
        try {
            doPost();
        }
        catch (err) {
            console.error('Failed to post response, recovering...', err); // eslint-disable-line no-console
            if (err instanceof DOMException) {
                result = JSON.parse(JSON.stringify(result));
                doPost();
            }
        }
    }
    /*
       * Stores callbacks to call later when remote call will be answered
       */
    registerCallback(successCallback, failureCallback) {
        const id = (++this.incrementalID).toString();
        this.callbacks[id] = { successCallback, failureCallback };
        return id;
    }
    /**
       * Calls and delete stored callback
       * @param id - call id
       * @param success - was call successful
       * @param result - result of remote call
       */
    popCallback(id, success, result) {
        const callback = this.callbacks[id];
        if (!callback) {
            return;
        }
        if (success) {
            callback.successCallback(result);
        }
        else {
            callback.failureCallback(result);
        }
        delete this.callbacks[id];
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Connection);


/***/ },

/***/ "./lib/object-path.ts"
/*!****************************!*\
  !*** ./lib/object-path.ts ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   escapePathPart: () => (/* binding */ escapePathPart),
/* harmony export */   hasUnsafeSegments: () => (/* binding */ hasUnsafeSegments),
/* harmony export */   propertyByPath: () => (/* binding */ propertyByPath),
/* harmony export */   splitPath: () => (/* binding */ splitPath),
/* harmony export */   unescapePathPart: () => (/* binding */ unescapePathPart)
/* harmony export */ });
const PATH_REG = /([.[\]:;'"\s])/;
const UNSAFE_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);
function escapePathPart(pathPart) {
    if (!PATH_REG.test(pathPart)) {
        return pathPart;
    }
    const escaped = pathPart.replace(new RegExp(PATH_REG.source, 'g'), '\\$1');
    return `["${escaped}"]`;
}
function unescapePathPart(pathPart) {
    return pathPart.replace(/^\["/, '').replace(/"]$/, '').replace(/\\/, '');
}
function splitPath(path) {
    const result = [];
    let lastEnd = 0;
    for (let i = 0; i < path.length; i++) {
        const char = path[i];
        if (PATH_REG.test(char) && path[i - 1] !== '\\') {
            result.push(path.substring(lastEnd, i));
            lastEnd = i + 1;
        }
    }
    result.push(path.substring(lastEnd, path.length));
    return result.filter(pathPart => !!pathPart).map(pathPart => pathPart.replace(/\\/g, ''));
}
function hasUnsafeSegments(parts) {
    return parts.some(part => UNSAFE_SEGMENTS.has(part));
}
function propertyByPath(object, path) {
    const parts = splitPath(path);
    if (hasUnsafeSegments(parts)) {
        return null;
    }
    return parts.reduce((acc, pathPart) => {
        if (acc) {
            return acc[pathPart];
        }
        return null;
    }, object);
}


/***/ },

/***/ "./lib/websandbox.ts"
/*!***************************!*\
  !*** ./lib/websandbox.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseOptions: () => (/* binding */ BaseOptions),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _connection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./connection */ "./lib/connection.ts");
/* harmony import */ var val_loader_frame_bundle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! val-loader!./frame-bundle.js */ "./node_modules/val-loader/dist/cjs.js!./lib/frame-bundle.js");
/* harmony import */ var val_loader_frame_bundle_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(val_loader_frame_bundle_js__WEBPACK_IMPORTED_MODULE_1__);

// @ts-expect-error loader-based input

const BaseOptions = {
    frameContainer: 'body',
    frameClassName: 'websandbox__frame',
    frameSrc: null,
    frameContent: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>',
    codeToRunBeforeInit: null,
    initialStyles: null,
    baseUrl: null,
    allowPointerLock: false,
    allowFullScreen: false,
    sandboxAdditionalAttributes: ''
};
class Websandbox {
    /**
     * Creates sandbox instancea
     * @param localApi Api of this side. Will be available for sandboxed code as remoteApi
     * @param options Options of created sandbox
     */
    static create(localApi, options = {}) {
        return new Websandbox(localApi, options);
    }
    /**
     * {Constructor}
     * @param localApi
     * @param options
     */
    constructor(localApi, options) {
        this.connection = null;
        this.removeMessageListener = () => { };
        this.validateOptions(options);
        this.options = Object.assign(Object.assign({}, BaseOptions), options);
        this.iframe = this.createIframe();
        this.promise = new Promise(resolve => {
            this.connection = new _connection__WEBPACK_IMPORTED_MODULE_0__["default"](this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow), listener => {
                const sourceCheckListener = (event) => {
                    if (event.source !== this.iframe.contentWindow) {
                        return;
                    }
                    return listener(event);
                };
                window.addEventListener('message', sourceCheckListener);
                this.removeMessageListener = () => window.removeEventListener('message', sourceCheckListener);
            }, { allowedSenderOrigin: 'null' });
            this.connection.setServiceMethods({
                iframeInitialized: () => {
                    return this.connection
                        .setLocalApi(localApi)
                        .then(() => resolve(this));
                }
            });
        });
    }
    validateOptions(options) {
        var _a;
        if (options.frameSrc && (options.frameContent || options.initialStyles || options.baseUrl || options.codeToRunBeforeInit)) {
            throw new Error('You can not set both "frameSrc" and any of frameContent,initialStyles,baseUrl,codeToRunBeforeInit options');
        }
        if ('frameContent' in options && !((_a = options.frameContent) === null || _a === void 0 ? void 0 : _a.includes('<head>'))) {
            throw new Error('Websandbox: iFrame content must have "<head>" tag.');
        }
    }
    _prepareFrameContent(options) {
        var _a, _b, _c;
        let frameContent = (_a = options.frameContent) !== null && _a !== void 0 ? _a : '';
        if (options.codeToRunBeforeInit) {
            frameContent = (_b = frameContent
                .replace('<head>', `<head><script>${options.codeToRunBeforeInit}</script>`)) !== null && _b !== void 0 ? _b : '';
        }
        frameContent = (_c = frameContent
            .replace('<head>', `<head><script>${(val_loader_frame_bundle_js__WEBPACK_IMPORTED_MODULE_1___default())}</script>`)) !== null && _c !== void 0 ? _c : '';
        if (options.initialStyles) {
            frameContent = frameContent
                .replace('</head>', `<style>${options.initialStyles}</style></head>`);
        }
        if (options.baseUrl) {
            frameContent = frameContent
                .replace('<head>', `<head><base target="_parent" href="${options.baseUrl}"/>`);
        }
        return frameContent;
    }
    createIframe() {
        var _a;
        const containerSelector = this.options.frameContainer;
        const container = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;
        if (!container) {
            throw new Error('Websandbox: Cannot find container for sandbox ' + container);
        }
        const frame = document.createElement('iframe');
        frame.sandbox = `allow-scripts ${this.options.sandboxAdditionalAttributes}`;
        frame.allow = `${this.options.allowAdditionalAttributes}`;
        frame.className = (_a = this.options.frameClassName) !== null && _a !== void 0 ? _a : '';
        if (this.options.allowFullScreen) {
            frame.allowFullscreen = true;
        }
        if (this.options.frameSrc) {
            frame.src = this.options.frameSrc;
            container.appendChild(frame);
            return frame;
        }
        frame.setAttribute('srcdoc', this._prepareFrameContent(this.options));
        container.appendChild(frame);
        return frame;
    }
    destroy() {
        this.iframe.remove();
        this.removeMessageListener();
    }
    _runCode(code) {
        return this.connection.callRemoteServiceMethod('runCode', code);
    }
    _runFunction(fn) {
        return this._runCode(`(${fn.toString()})()`);
    }
    run(codeOrFunction) {
        if (codeOrFunction.name) {
            return this._runFunction(codeOrFunction);
        }
        return this._runCode(codeOrFunction);
    }
    importScript(path) {
        return this.connection.callRemoteServiceMethod('importScript', path);
    }
    injectStyle(style) {
        return this.connection.callRemoteServiceMethod('injectStyle', style);
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Websandbox);


/***/ },

/***/ "./node_modules/val-loader/dist/cjs.js!./lib/frame-bundle.js"
/*!*******************************************************************!*\
  !*** ./node_modules/val-loader/dist/cjs.js!./lib/frame-bundle.js ***!
  \*******************************************************************/
(module) {

module.exports = "(()=>{\"use strict\";const e=/([.[\\]:;'\"\\s])/,t=new Set([\"__proto__\",\"constructor\",\"prototype\"]);function s(t){const s=[];let o=0;for(let r=0;r<t.length;r++){const i=t[r];e.test(i)&&\"\\\\\"!==t[r-1]&&(s.push(t.substring(o,r)),o=r+1)}return s.push(t.substring(o,t.length)),s.filter(e=>!!e).map(e=>e.replace(/\\\\/g,\"\"))}function o(e){return e.some(e=>t.has(e))}function r(e,t){const r=s(t);return o(r)?null:r.reduce((e,t)=>e?e[t]:null,e)}const i=\"message\",n=\"response\",c=\"set-interface\",a=\"service-message\",l=!!window.MSInputMethodContext&&!!document.documentMode,h={allowedSenderOrigin:\"null\"},d=class{constructor(e,t,s={}){this.remote={},this.serviceMethods={},this.localApi={},this.callbacks={},this._resolveRemoteMethodsPromise=null,this.options=Object.assign(Object.assign({},h),s),this.incrementalID=Math.floor(1e5*Math.random()),this.postMessage=e,this.remoteMethodsWaitPromise=new Promise(e=>{this._resolveRemoteMethodsPromise=e}),t(e=>this.onMessageListener(e))}onMessageListener(e){const t=e.data,{allowedSenderOrigin:s}=this.options;s&&e.origin!==s&&!l||(t.type===n?this.popCallback(t.callId,t.success,t.result):t.type===i?this.callLocalApi(t.methodName,t.arguments).then(e=>this.responseOtherSide(t.callId,e)).catch(e=>this.responseOtherSide(t.callId,e,!1)):t.type===c?(this.setInterface(t.apiMethods),this.responseOtherSide(t.callId)):t.type===a&&this.callLocalServiceMethod(t.methodName,t.arguments).then(e=>this.responseOtherSide(t.callId,e)).catch(e=>this.responseOtherSide(t.callId,e,!1)))}postMessageToOtherSide(e){this.postMessage(e,\"*\")}setInterface(e){var t;this.remote={},e.forEach(e=>{const t=s(e);if(o(t))return;let r=this.remote;for(let e=0;e<t.length-1;e++){const s=t[e];r[s]&&\"object\"==typeof r[s]||(r[s]={}),r=r[s]}r[t[t.length-1]]=this.createMethodWrapper(e)}),null===(t=this._resolveRemoteMethodsPromise)||void 0===t||t.call(this)}getMethodsFromInterface(e){return Object.keys(e).reduce((t,s)=>(\"object\"==typeof e[s]?t.push(...this.getMethodsFromInterface(e[s]).map(e=>`${s}.${e}`)):t.push(s),t),[])}setLocalApi(e){return new Promise((t,s)=>{const o=this.registerCallback(t,s);this.postMessageToOtherSide({callId:o,apiMethods:this.getMethodsFromInterface(e),type:c})}).then(()=>this.localApi=e)}setServiceMethods(e){this.serviceMethods=e}callLocalApi(e,t){const s=r(this.localApi,e);if(!s)throw new Error(`Local method \"${e}\" is not registered`);return Promise.resolve(s.call(this,...t))}callLocalServiceMethod(e,t){const s=r(this.serviceMethods,e);if(!s)throw new Error(`Service method ${e} is not registered`);return Promise.resolve(s.call(this,...t))}createMethodWrapper(e){return(...t)=>this.callRemoteMethod(e,...t)}callRemoteMethod(e,...t){return new Promise((s,o)=>{const r=this.registerCallback(s,o);this.postMessageToOtherSide({callId:r,methodName:e,type:i,arguments:t})})}callRemoteServiceMethod(e,...t){return new Promise((s,o)=>{const r=this.registerCallback(s,o);this.postMessageToOtherSide({callId:r,methodName:e,type:a,arguments:t})})}responseOtherSide(e,t,s=!0){t instanceof Error&&(t=[...Object.keys(t),\"message\"].reduce((e,s)=>(e[s]=t[s],e),{}));const o=()=>this.postMessage({callId:e,type:n,success:s,result:t},\"*\");try{o()}catch(e){console.error(\"Failed to post response, recovering...\",e),e instanceof DOMException&&(t=JSON.parse(JSON.stringify(t)),o())}}registerCallback(e,t){const s=(++this.incrementalID).toString();return this.callbacks[s]={successCallback:e,failureCallback:t},s}popCallback(e,t,s){const o=this.callbacks[e];o&&(t?o.successCallback(s):o.failureCallback(s),delete this.callbacks[e])}},p=window.Websandbox||new class{constructor(){this.connection=new d(window.parent.postMessage.bind(window.parent),e=>{window.addEventListener(\"message\",t=>{if(t.source===window.parent)return e(t)})},{allowedSenderOrigin:void 0}),this.connection.setServiceMethods({runCode:e=>this.runCode(e),importScript:e=>this.importScript(e),injectStyle:e=>this.injectStyle(e),importStyle:e=>this.importStyle(e)}),this.connection.callRemoteServiceMethod(\"iframeInitialized\")}runCode(e){const t=document.createElement(\"script\");t.innerHTML=e,document.getElementsByTagName(\"head\")[0].appendChild(t)}importScript(e){const t=document.createElement(\"script\");return t.src=e,document.getElementsByTagName(\"head\")[0].appendChild(t),new Promise(e=>t.onload=()=>e())}injectStyle(e){const t=document.createElement(\"style\");t.innerHTML=e,document.getElementsByTagName(\"head\")[0].appendChild(t)}importStyle(e){const t=document.createElement(\"link\");t.rel=\"stylesheet\",t.href=e,document.getElementsByTagName(\"head\")[0].appendChild(t)}};window.Websandbox=p})();"

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!***********************************!*\
  !*** ./examples/simple/simple.js ***!
  \***********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_websandbox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../lib/websandbox */ "./lib/websandbox.ts");
/* eslint-disable no-console */


var localApi = {
    testApiFn: function (message) {
        console.log('Host function called from iframe with: ' + message);
    }
};

const sandbox = _lib_websandbox__WEBPACK_IMPORTED_MODULE_0__["default"].create(localApi, {frameContainer: '.iframe__container', frameClassName: 'simple__iframe'});
sandbox.promise
    .then(() => {
        console.log('Sandbox is created. Trying to run code inside');

        return sandbox.run(`
            console.info("Sandboxed code initialized successfully");
            var title = document.createElement('h3');
            title.innerHTML = "Content is generated from the sandbox";
            document.body.appendChild(title);
            Websandbox.connection.remote.testApiFn("some argument");

            Websandbox.connection.setLocalApi({
                sandboxedMethod: function(message) {
                    console.info('sandboxedMethod called successfully:', message);
                    return 'this is sandboxedMethod result';
                }
            });
        `);
    })
    .then(() => console.log('Code has been ran'))
    .then(() => {
        console.log('Calling sandboxedMethod...');
        return sandbox.connection.remote.sandboxedMethod('hello from host');
    })
    .then(res => console.log('Call was successful:', res));



})();

/******/ })()
;
//# sourceMappingURL=simple.js.map