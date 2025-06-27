/* eslint-disable @typescript-eslint/no-unused-expressions */
import Connection, {TYPE_MESSAGE, TYPE_RESPONSE} from '../lib/connection';

describe('Connection', function () {
    const CALL_ID = 'fake-call-id';
    let callMessageListener = null;

    beforeEach(function () {
        this.localApi = sinon.stub({
            testLocalMethod: () => {
            },
            nested: sinon.stub({
                method: () => {}
            })
        });

        this.registerOnMessageListener = (listener) => {
            callMessageListener = listener;
        };
        this.postMessage = sinon.stub();
    });

    it('should init onnection', function () {
        let conn = new Connection(this.postMessage, this.registerOnMessageListener);
        conn.should.not.be.undefined;
    });

    it('should call remote and wait for response', async function () {
        let conn = new Connection(this.postMessage, this.registerOnMessageListener);
        conn.setInterface(['testMethod']);

        const responsePromise = conn.remote.testMethod('test', 123);

        //Emulate response
        callMessageListener({
            data: {
                callId: this.postMessage.getCall(0).args[0].callId,
                type: TYPE_RESPONSE,
                success: true,
                result: {foo: 'bar'}
            }
        });

        const res = await responsePromise;
        res.should.eql({foo: 'bar'});
    });

    it('should accept nested.methods', function () {
        const conn = new Connection(this.postMessage, this.registerOnMessageListener);

        conn.postMessageToOtherSide = sinon.stub();

        conn.setLocalApi({nested: {method: () => {}}});

        conn.postMessageToOtherSide.should.have.been.calledWithMatch({apiMethods: ['nested.method']});
    });

    it('should accept nested methods in setInterface', function () {
        const conn = new Connection(this.postMessage, this.registerOnMessageListener);
        
        conn.setInterface(['flat', 'nested.method']);
        conn.remote.flat.should.be.a('function');
        conn.remote.nested.method.should.be.a('function');
    });

    it('should call nested.methods', function () {
        const conn = new Connection(this.postMessage, this.registerOnMessageListener);

        conn.postMessageToOtherSide = sinon.stub();
        conn.setLocalApi(this.localApi);

        conn.postMessageToOtherSide.should.have.been.calledWithMatch({apiMethods: ['testLocalMethod', 'nested.method']});
    });

    it('should handle failure of remote method', async function () {
        let conn = new Connection(this.postMessage, this.registerOnMessageListener);
        conn.setInterface(['testMethod']);

        const responsePromise = conn.remote.testMethod('test', 123);

        //Emulate response
        callMessageListener({
            data: {
                callId: this.postMessage.getCall(0).args[0].callId,
                type: TYPE_RESPONSE,
                success: false,
                result: {message: 'bar'}
            }
        });

        try {
            await responsePromise;
            throw new Error('Expected method to throw');
        } catch (err) {
            err.should.eql({message: 'bar'});
        }
    });

    it('should call local API on remote call', async function () {
        //First notify connection that localApi was registered on other side
        const conn = new Connection(this.postMessage, this.registerOnMessageListener);
        sinon.stub(conn, 'registerCallback').callsFake((resolve) => resolve());

        await conn.setLocalApi(this.localApi);

        callMessageListener({
            data: {
                callId: CALL_ID,
                type: TYPE_MESSAGE,
                methodName: 'testLocalMethod',
                arguments: [{foo: 'bar'}, 123]
            }
        });

        conn.localApi.testLocalMethod.should.have.been.calledWith({foo: 'bar'}, 123);
    });

    it('should response to remote call', async function () {
        const conn = new Connection(this.postMessage, this.registerOnMessageListener);
        sinon.stub(conn, 'registerCallback').callsFake((resolve) => resolve());

        this.localApi.testLocalMethod.returns({fake: TYPE_RESPONSE});

        await conn.setLocalApi(this.localApi);
        
        callMessageListener({
            data: {
                callId: CALL_ID,
                type: TYPE_MESSAGE,
                methodName: 'testLocalMethod',
                arguments: []
            }
        });

        // Wait for the asynchronous message handling
        await new Promise(resolve => setTimeout(resolve, 10));
        
        this.postMessage.should.have.been.calledWith({
            callId: "fake-call-id",
            result: {fake: TYPE_RESPONSE},
            success: true,
            type: "response"
        }, '*');
    });


    it('should response to remote call of nested method', async function () {
        const conn = new Connection(this.postMessage, this.registerOnMessageListener);
        sinon.stub(conn, 'registerCallback').callsFake((resolve) => resolve());

        this.localApi.nested.method.returns({fake: TYPE_RESPONSE});

        await conn.setLocalApi(this.localApi);
        
        callMessageListener({
            data: {
                callId: CALL_ID,
                type: TYPE_MESSAGE,
                methodName: 'nested.method',
                arguments: []
            }
        });

        // Wait for the asynchronous message handling
        await new Promise(resolve => setTimeout(resolve, 10));
        
        this.postMessage.should.have.been.calledWith({
            callId: "fake-call-id",
            result: {fake: TYPE_RESPONSE},
            success: true,
            type: "response"
        }, '*');
    });

    it('should resolve remote methods wait promise', async function () {
        const resolved = sinon.spy();
        const conn = new Connection(this.postMessage, this.registerOnMessageListener);
        
        Promise.resolve(conn.remoteMethodsWaitPromise).then(resolved);

        await new Promise(resolve => setTimeout(resolve));
        resolved.should.not.have.been.called;
        
        conn.setInterface(['testMethod']);
        await new Promise(resolve => setTimeout(resolve));
        resolved.should.have.been.called;
    });
});