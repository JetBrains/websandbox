import sandbox from '../lib/websandbox-api';

describe('Sandbox', function () {
    afterEach(() => {
        let frames = document.querySelectorAll('iframe');
        Array.prototype.forEach.call(frames, (frame) => frame.remove());
    });

    it('Sandbox init', function () {
        var sand = sandbox.create({});
        sand.should.be.defined;
    });

    it('Sandbox create iframe', function () {
        sandbox.create({});
        document.querySelector('iframe').should.be.defined;
    });

    it('Sandbox create iframe with correct src', function () {
        sandbox.create({}, {frameHtmlFileName: 'fooooo.html'});
        document.querySelector('iframe').srcdoc.should.contain('frame.js');
    });
});