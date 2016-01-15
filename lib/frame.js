import Connection from './connection';

class Frame {
    constructor() {
        this.connection = new Connection({}, window.postMessage, listener => {
            window.addEventListener('message', (e) => {
                if (e.data.type === 'run_code') {
                    this.runCode(e.data.code);
                    //TODO: notify about success here
                }

                if (e.data.type === 'import_script') {
                    this.importScript(e.data.scriptPath)
                        .then(() => {
                            //TODO: notify about success here
                            console.log('script is imported', e.data.code);
                        });
                }

                return listener(e);
            });

        });

        window.parent.postMessage({type: 'iframe_initialized'}, '*');
    }

    /**
     * Creates script tag with passed code and attaches it. Runs synchronous
     * @param code
     */
    runCode(code) {
        var scriptTag = document.createElement('script');
        scriptTag.innerHTML = code;
        document.body.appendChild(scriptTag);
    }

    importScript(scriptUrl) {
        var scriptTag = document.createElement('script');
        scriptTag.src = scriptUrl;
        document.body.appendChild(scriptTag);
        return new Promise(resolve => scriptTag.onload = resolve);
    }
}
new Frame();

module.exports = Frame; //eslint-disable-line