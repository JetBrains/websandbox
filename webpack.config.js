/* eslint-env node */
var path = require('path');

module.exports = {
    entry: './lib/sandbox-api',
    output: {
        path: path.resolve('./', 'dist'),
        libraryTarget: 'umd',
        library: 'Sandboxjs',
        filename: 'Sandbox.js'
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