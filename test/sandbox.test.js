import Sandbox from '../lib/websandbox-api';

describe('Sandbox', function () {
    afterEach(() => {
        let frames = document.querySelectorAll('iframe');
        Array.prototype.forEach.call(frames, (frame) => frame.remove());
    });

    it('should init', function () {
        var sand = Sandbox.create({});
        sand.should.be.defined;
    });

    it('should create iframe', function () {
        Sandbox.create({});
        document.querySelector('iframe').should.be.defined;
    });

    it('should create iframe with correct src', function () {
        Sandbox.create({}, {frameHtmlFileName: 'fooooo.html'});
        document.querySelector('iframe').srcdoc.should.contain('window.SANDBOX_ID');
    });

    it('should create sandbox and call local api back', function (done) {
        var localApi = {
            methodToCall: sinon.spy()
        };

        const sandbox = Sandbox.create(localApi);
        sandbox.promise
            .then(sandbox => {
                return sandbox.runCode('Websandbox.connection.remote.methodToCall("some argument", 123);');
            })
            .then(() => {
                localApi.methodToCall.should.have.been.calledWith('some argument', 123);
                done();
            });

    });

    it('should create sandbox and call sandboxed API', function (done) {
        var localApi = {
            confirmDynamicMethodCall: sinon.spy()
        };

        const sandbox = Sandbox.create(localApi);
        sandbox.promise
            .then(sandbox => sandbox.runCode(`Websandbox.connection.setLocalApi({
                dynamicMethod: function(message) {
                    return Websandbox.connection.remote.confirmDynamicMethodCall(message);
                }
            });`))
            .then(() => sandbox.connection.remote.dynamicMethod('some message'))
            .then(() => {
                localApi.confirmDynamicMethodCall.should.have.been.calledWith('some message');
                done();
            });

    });
});