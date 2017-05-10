import Sandbox from '../lib/websandbox';

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
        Sandbox.create({});
        document.querySelector('iframe').srcdoc.should.contain(`this.id = 'websandbox-`);
    });

    it('should support passing custom frameContent', function () {
        Sandbox.create({}, {frameContent: `
            <html>
                <head>
                </head>
                <body>this is custom frame content</body>
            </html>
        `});

        document.querySelector('iframe').srcdoc.should.contain(`this.id = 'websandbox-`);
        document.querySelector('iframe').srcdoc.should.contain('this is custom frame content');
    });

    it('should add base tag if baseUrl provided', function () {
        Sandbox.create({}, {baseUrl: 'http://example.com'});
        document.querySelector('iframe').srcdoc.should.contain(`<base href="http://example.com"/>`);
    });

    it('should add only "allow-scripts" sandbox attribute by default', function () {
        Sandbox.create({});
        document.querySelector('iframe').sandbox.value.should.equal('allow-scripts');
    });

    it('should add "allow-pointer-lock" sandbox attribute if option is set', function () {
        Sandbox.create({}, {allowPointerLock: true});
        document.querySelector('iframe').sandbox.value.should.equal('allow-scripts allow-pointer-lock');
    });

    it('should inject initialization code', function () {
        Sandbox.create({}, {
            codeToRunBeforeInit: `console.log('foo')`
        });
        document.querySelector('iframe').srcdoc.should.contain(`<script>console.log('foo')</script>`);
    });

    it('should inject initial styles', function () {
        Sandbox.create({}, {
            initialStyles: `div {color: red;}`
        });
        document.querySelector('iframe').srcdoc.should.contain(`<style>div {color: red;}</style>`);
    });

    it('should create sandbox and call local api back', function (done) {
        var localApi = {
            methodToCall: sinon.spy()
        };

        const sandbox = Sandbox.create(localApi);
        sandbox.promise
            .then(sandbox => {
                return sandbox.run('Websandbox.connection.remote.methodToCall("some argument", 123);');
            })
            .then(() => {
                localApi.methodToCall.should.have.been.calledWith('some argument', 123);
                done();
            });

    });

    it('should run function inside sandbox', function (done) {
        var localApi = {
            methodToCall: sinon.spy()
        };

        function toRunInsideSandbox() {
            Websandbox.connection.remote.methodToCall("some argument", 123); //eslint-disable-line no-undef
        }

        const sandbox = Sandbox.create(localApi);
        sandbox.promise
            .then(sandbox => {
                return sandbox.run(toRunInsideSandbox);
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
            .then(sandbox => sandbox.run(`Websandbox.connection.setLocalApi({
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