/* eslint-env node */
var path = require('path');

module.exports = {
    entry: {
        frame: './lib/frame',
        websandbox: './lib/websandbox-api'
    },
    output: {
        path: __dirname + '/dist',
        libraryTarget: 'umd',
        library: 'Websandbox',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [path.resolve('./', 'lib'), path.resolve('./', 'test')],
                loader: 'babel-loader'}
        ]
    }
};