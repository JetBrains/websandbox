import Sandbox from '../../lib/websandbox-api';

var localApi = {
    testApiFn: function (message) {
        console.log('Host function called from iframe with: ' + message);
    }
};

const sandbox = Sandbox.create(localApi, {iframeContainer: '.iframe__container', frameClassName: 'simple__iframe'});
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


