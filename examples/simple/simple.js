import Sandbox from '../../lib/sandbox-api';

var localApi = {
    testApiFn: function (message) {
        console.info('Host function called from iframe with: ' + message);
    }
};

const sandbox = Sandbox.create(localApi, {iframeContainer: '.iframe__container', frameClassName: 'simple__iframe'});
sandbox.promise
    .then(() => {
        console.log('Sandbox is created. Trying to run code inside');

        sandbox.runCode(`
            console.log("Sandboxed code initialized successfully");
            document.body.innerHTML = "Content is generated from the iframe";
            Sandboxjs.connection.remote.testApiFn("some argument");

            Sandboxjs.connection.setLocalApi({
                sandboxedMethod: function(message) {
                    console.info('sandboxed method called successfully:', message);
                }
            });
        `)
            .then(() => console.log('Code has been ran'))
            .then(() => {
                console.log('Calling sandboxed method...');
                sandbox.connection.remote.sandboxedMethod('hello from host');
            });
    });

