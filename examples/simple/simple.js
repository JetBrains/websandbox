import Sandbox from '../../lib/sandbox-api';

var localApi = {
    test: function () {
        alert('test function called');
    }
}

var sandbox = Sandbox.create(localApi, '');

sandbox.runCode('console.log("hello from iframe");');