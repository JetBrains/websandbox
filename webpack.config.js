/* eslint-env node */
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var fs = require('fs');

module.exports = {
    entry: {
        websandbox: './lib/websandbox-api',
        frame: './lib/frame'
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
                include: [
                    path.resolve('./', 'examples'),
                    path.resolve('./', 'lib'),
                    path.resolve('./', 'test')
                ],
                loader: 'babel-loader'
            },
            {
                test: /\.html$/,
                include: [path.resolve('./', 'lib')],
                loader: 'html?interpolate'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'frame.html',
            inject: false,
            templateContent: function (options) {
                var iframeCompiledChunk = options.compilation.assets['frame.js'].source();
                var tpl = fs.readFileSync('lib/iframe-src.html', {encoding: 'utf8'});
                console.log('>>>>>tpl', tpl.replace('{{IFRAME_CODE}}', iframeCompiledChunk))
                return tpl.replace('{{IFRAME_CODE}}', iframeCompiledChunk);
            }
        })
    ]
};