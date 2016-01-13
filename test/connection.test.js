import Connection from '../lib/connection';

describe('Connection', function () {

    let localApi = {};

    beforeEach(function() {
        this.localApi = sinon.stub({
            testMethod: () => {}
        });

        this.postMessage = sinon.spy();
        this.registerOnMessageListener = sinon.spy();
    })

    it('Connection init', function () {
        var conn = new Connection(this.localApi, this.postMessage, this.registerOnMessageListener);
        conn.should.be.defined;
    });
});