import Sandbox from '../../lib/sandbox-api';

var localApi = {
    testApiFn: function (message) {
        console.log('Host function called from iframe with: ' + message);
    }
};

const sandbox = Sandbox.create(localApi, {iframeContainer: '.iframe__container', frameClassName: 'simple__iframe'});
sandbox.promise
    .then(() => {
        console.log('sandbox is created!', sandbox);

        sandbox.runCode(`
            console.info("Logging from iframe is working.");
            document.body.innerHTML = "Content is generated from the iframe";
            Sandboxjs.connection.remote.testApiFn("some argument");
        `);
    });

