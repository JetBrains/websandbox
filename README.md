# Websandbox [![Build Status](https://travis-ci.org/huston007/websandbox.svg?branch=master)](https://travis-ci.org/huston007/websandbox)

Websandbox library provides a way to execute unsafe js code inside HTML5 sandbox - iframe with sandbox attribute.
It is usable to host user provided widgets and similar cases.

Usage example (see examples folder to more information): 
```js
import Sandbox from '../../lib/websandbox-api';

var localApi = {
    testApiFn: function (message) {
        console.log('Host function called from iframe with: ' + message);
    }
};

const sandbox = Sandbox.create(localApi, {iframeContainer: '.iframe__container', frameClassName: 'simple__iframe'});
sandbox.promise
    .then(() => {
        console.log('Sandbox is created. Trying to run code inside');

        sandbox.run(`
            console.info("Sandboxed code initialized successfully");
            document.body.innerHTML = "Content is generated from the sandbox";
            Websandbox.connection.remote.testApiFn("some argument");

            Websandbox.connection.setLocalApi({
                sandboxedMethod: function(message) {
                    console.info('sandboxedMethod called successfully:', message);
                    return 'this is sandboxedMethod result';
                }
            });
        `)
            .then(() => console.log('Code has been ran'))
            .then(() => {
                console.log('Calling sandboxedMethod...');
                sandbox.connection.remote.sandboxedMethod('hello from host')
                    .then(res => console.log('Call was successful:', res));
            });
    });


```