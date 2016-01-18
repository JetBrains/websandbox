import Sandbox from '../../lib/websandbox-api';

var localApi = {
    testApiFn: function (message) {
        console.log('Host function called from iframe with: ' + message);
    }
};

const sandbox = Sandbox.create(localApi, {iframeContainer: '.iframe__container', frameClassName: 'simple__iframe'});
sandbox.promise
    .then(() => {
        console.log('Sandbox is created. Trying to import code inside');

        sandbox.importScript('scriptToImport.js')
            .then(() => console.log('Code has been imported'));
    });

