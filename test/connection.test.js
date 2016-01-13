import Connection from '../lib/connection';

describe('Connection', function () {

    beforeEach(function() {
        this.localApi = sinon.stub({
            testMethod: () => {}
        });

        this.registerOnMessageListener = (listener) => {
            this.callMessageListener = listener;
        };
        this.postMessage = sinon.stub();
    });

    it('should init onnection', function () {
        let conn = new Connection(this.localApi, this.postMessage, this.registerOnMessageListener);
        conn.should.be.defined;
    });

    it.only('should call remote and wait for response', function (done) {
        let conn = new Connection(this.localApi, this.postMessage, this.registerOnMessageListener);
        let fakeTestMethod = sinon.stub();
        conn.setInterface({testMethod: fakeTestMethod});
debugger;
        conn.remote.testMethod('test', 123)
            .then(res => {
                //fakeTestMethod.should.have.been.called;
                done();
            });

        this.callMessageListener({
            callId: this.postMessage.getCall(0).args[0].callId,
            type: 'response',
            success: true,
            data: {foo: 'bar'}
        })
    });
});