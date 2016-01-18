import Connection from './connection';

class Frame {
    constructor() {
        this.id = window.SANDBOX_ID;
        this.connection = new Connection(this.id, window.parent.postMessage.bind(window.parent), listener => {
            window.addEventListener('message', (e) => {
                if (e.data.type === 'run_code') {
                    this.runCode(e.data.code);
                    window.parent.postMessage({type: 'script_import_finish'}, '*');
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

        window.parent.postMessage({type: 'iframe_initialized', connectionId: this.id}, '*');
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

module.exports = new Frame(); //eslint-disable-line