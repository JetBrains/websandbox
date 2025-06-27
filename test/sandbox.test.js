import Sandbox from '../lib/websandbox';
import Connection from '../lib/connection';

describe('Sandbox', function () {
    afterEach(() => {
        let frames = document.querySelectorAll('iframe');
        Array.prototype.forEach.call(frames, (frame) => frame.remove());
    });

    it('should init', function () {
        var sand = Sandbox.create({});
        sand.should.not.be.undefined;
    });

    it('should create iframe', function () {
        Sandbox.create({});
        document.querySelector('iframe').should.not.be.undefined;
    });

    it('should create iframe with correct srcdoc', function () {
        Sandbox.create({});
        document.querySelector('iframe').srcdoc.should.contain(`TYPE_SET_INTERFACE`);
    });

    it('should support passing custom frameContent', function () {
        Sandbox.create({}, {frameContent: `
            <html>
                <head>
                </head>
                <body>this is custom frame content</body>
            </html>
        `});

        document.querySelector('iframe').srcdoc.should.contain(`TYPE_SET_INTERFACE`);
        document.querySelector('iframe').srcdoc.should.contain('this is custom frame content');
    });

    it('should add base tag if baseUrl provided', function () {
        Sandbox.create({}, {baseUrl: 'http://example.com'});
        document.querySelector('iframe').srcdoc.should.contain(`<base target="_parent" href="http://example.com"/>`);
    });

    it('should add only "allow-scripts" sandbox attribute by default', function () {
        Sandbox.create({});
        document.querySelector('iframe').sandbox.value.should.equal('allow-scripts ');
    });

    it('should allow additional sandbox attrs', function () {
        Sandbox.create({}, {sandboxAdditionalAttributes: 'allow-pointer-lock'});
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
            })
            .catch(done);
    });

    it('should create sandbox and call nested local api back', async function () {
        var localApi = {
            nested: {
                methodToCall: sinon.spy()
            }
        };

        const sandbox = Sandbox.create(localApi);
        const remote = await sandbox.promise;
        await remote.run(`Websandbox.connection.remote.nested.methodToCall("some argument", 123);`);
        localApi.nested.methodToCall.should.have.been.calledWith('some argument', 123);
    });

    it('should not pass messages to neighbour sandboxes because their event.souce should not be the same', function () {
        var localApi1 = {methodToCall: sinon.spy()};
        var localApi2 = {methodToCall: sinon.spy()};

        const sandbox1 = Sandbox.create(localApi1);
        const sandbox2 = Sandbox.create(localApi2);
        
        return Promise.all([sandbox1.promise, sandbox2.promise])
            .then(() => {
                sandbox1.connection.onMessageListener = (e) => Connection.prototype.onMessageListener.call(sandbox1.connection, e);
                sinon.spy(sandbox1.connection, 'onMessageListener');
                sandbox2.connection.onMessageListener = (e) => Connection.prototype.onMessageListener.call(sandbox2.connection, e);
                sinon.spy(sandbox2.connection, 'onMessageListener');

                return sandbox2.run('Websandbox.connection.remote.methodToCall("some argument", 123);');
            })
            .then(() => {
                sandbox1.connection.onMessageListener.should.not.have.been.called;
                sandbox2.connection.onMessageListener.should.have.been.called;
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
            })
            .catch(done);

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
            })
            .catch(done);

    });

    it('should pass Error instance back', function (done) {
        const sandbox = Sandbox.create({});
        
        sandbox.promise
            .then(sandbox => sandbox.run(`Websandbox.connection.setLocalApi({
                dynamicMethod: function() {
                    console.log('inside dynamic method');
                    return new Promise((resolve, reject) => reject(new Error('fake error')));
                }
            });`))
            .then(() => sandbox.connection.remote.dynamicMethod())
            .catch((err) => {
                err.message.should.equal('fake error');
                done();
            })
            .catch(done);
    });
});