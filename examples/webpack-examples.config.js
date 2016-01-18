/* eslint-env node */
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        simple: './examples/simple/simple',
        importScript: './examples/importScript/importScript',
        scriptToImport: './examples/importScript/scriptToImport',
        frame: './lib/frame'
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
        libraryTarget: 'var',
        library: 'Websandbox'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [path.resolve('./', '../lib'), path.resolve('./', '')],
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'examples/index.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'simple.html',
            template: 'examples/simple/simple.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'importScript.html',
            template: 'examples/importScript/importScript.html'
        })
    ]
};