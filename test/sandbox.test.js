import sandbox from '../lib/sandbox-api';

describe('Sandbox', function () {
    afterEach(() => {
        let frames = document.querySelectorAll('iframe');
        Array.prototype.forEach.call(frames, (frame) => frame.remove());
    });

    it('Sandbox init', function () {
        var sand = sandbox.create({}, 'http://foo.bar/js.js');
        sand.should.be.defined;
    });

    it('Sandbox create iframe', function () {
        sandbox.create({}, 'http://foo.bar/js.js');
        document.querySelector('iframe').should.be.defined;
    });

    it('Sandbox create iframe with correct src', function () {
        sandbox.create({}, 'http://foo.bar/js.js', {frameHtmlFileName: 'fooooo.html'});
        document.querySelector('iframe').src.should.contain('fooooo.html');
    });
});