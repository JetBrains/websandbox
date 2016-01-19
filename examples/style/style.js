import Sandbox from '../../lib/websandbox-api';

const sandbox = Sandbox.create({});
sandbox.promise
    .then(() => {
        console.log('Sandbox is created. Trying to inject styles inside');

        return sandbox.injectStyle(`
            html, body {
                background-color: blue;
            }
        `);
    })
    .then(() => console.log('Style has been injected if iframe is blue'));


