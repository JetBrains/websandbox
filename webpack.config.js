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
            }, {
                test: /\.html$/,
                include: [path.resolve('./', 'lib')],
                loader: 'html?interpolate'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'frame.html',
            templateContent: function (templateParams, compilation) {
                var iframeCompiledChunk = compilation.assets['frame.js'].children[0]._value;
                var tpl = fs.readFileSync('lib/iframe-src.html', {encoding: 'utf8'});
                return tpl.replace('{{IFRAME_CODE}}', iframeCompiledChunk);
            }
        })
    ]
};