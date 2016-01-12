var sandbox = require('../lib/sandbox');


describe('Sandbox', function () {
    it('Sandbox init', function () {
        sandbox.create('http://foo.bar/js.js');
    });
});