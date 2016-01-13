import Connection from '../lib/connection';

describe('Connection', function () {

    beforeEach(function () {
        this.localApi = sinon.stub({
            testLocalMethod: () => {
            }
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

    it('should call remote and wait for response', function (done) {
        let conn = new Connection(this.localApi, this.postMessage, this.registerOnMessageListener);
        conn.setInterface({testMethod: null});

        conn.remote.testMethod('test', 123)
            .then(res => {
                res.should.eql({foo: 'bar'});
                done();
            });


        //Emulate response
        this.callMessageListener({
            callId: this.postMessage.getCall(0).args[0].callId,
            type: 'response',
            success: true,
            result: {foo: 'bar'}
        })
    });

    it('should call local API on remote call', function () {
        new Connection(this.localApi, this.postMessage, this.registerOnMessageListener);

        this.callMessageListener({
            callId: 'fake-call-id',
            type: 'message',
            methodName: 'testLocalMethod',
            arguments: [{foo: 'bar'}, 123]
        });

        this.localApi.testLocalMethod.should.have.been.calledWith({foo: 'bar'}, 123);
    });

    it('should response to remote call', function (done) {
        new Connection(this.localApi, this.postMessage, this.registerOnMessageListener);

        this.localApi.testLocalMethod.returns({fake: 'response'});

        this.callMessageListener({
            callId: 'fake-call-id',
            type: 'message',
            methodName: 'testLocalMethod',
            arguments: []
        });

        setTimeout(() => {
            this.postMessage.should.have.been.calledWith({
                callId: "fake-call-id",
                result: {fake: 'response'},
                success: true,
                type: "response"
            }, '*');
            done();
        }, 10);

    });
});