import sandbox from '../lib/websandbox-api';

describe('Sandbox', function () {
    afterEach(() => {
        let frames = document.querySelectorAll('iframe');
        Array.prototype.forEach.call(frames, (frame) => frame.remove());
    });

    it('should init', function () {
        var sand = sandbox.create({});
        sand.should.be.defined;
    });

    it('should create iframe', function () {
        sandbox.create({});
        document.querySelector('iframe').should.be.defined;
    });

    it('should create iframe with correct src', function () {
        sandbox.create({}, {frameHtmlFileName: 'fooooo.html'});
        document.querySelector('iframe').srcdoc.should.contain('frame.js');
    });

    it.skip('should create sandbox and call local api back', function (done) {
        var localApi = {
            methodToCall: sinon.spy()
        };

        sandbox.create(localApi).promise
            .then(sandbox => sandbox.runCode('Websandbox.connection.remote.methodToCall("some argument", 123);'))
            .then(() => {
                localApi.testLocalMethod.should.have.been.calledWith('some argument', 123);
                done();
            });

    });
});