/* eslint-env node */
var path = require('path');

module.exports = {
    entry: './lib/websandbox-api',
    output: {
        path: __dirname + '/dist',
        libraryTarget: 'umd',
        library: 'Websandbox',
        filename: 'websandbox.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [
                    path.resolve('./', 'examples'),
                    path.resolve('./', 'lib'),
                    path.resolve('./', 'test')
                ],
                loader: 'babel-loader'
            }, {
                test: /\.html$/,
                include: [path.resolve('./', 'lib')],
                loader: 'html?interpolate'
            }
        ]
    }
};