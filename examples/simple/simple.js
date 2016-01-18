import Sandbox from '../../lib/sandbox-api';

var localApi = {
    test: function () {
        alert('test function called');
    }
};

const sandbox = Sandbox.create(localApi, {iframeContainer: '.iframe__container', frameClassName: 'simple__iframe'});
sandbox.promise
    .then(() => {
        console.log('sandbox is created!', sandbox);
        sandbox.runCode('console.log("hello from iframe");');

        sandbox.runCode('document.body.innerHTML = "Generated from sandbox"');
    });

