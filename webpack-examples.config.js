/* eslint-env node */
var HtmlWebpackPlugin = require('html-webpack-plugin');

var baseConfig = require('./webpack.config');
delete baseConfig.entry.websandbox;
var configMerger = require('webpack-config-merger');

module.exports = configMerger(baseConfig, {
    entry: {
        simple: './examples/simple/simple',
        style: './examples/style/style',
        importScript: './examples/importScript/importScript',
        scriptToImport: './examples/importScript/scriptToImport'
    },
    output: {
        path: __dirname + '/dist-examples',
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: false,
            template: 'examples/index.html'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            filename: 'simple.html',
            template: 'examples/simple/simple.html'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            filename: 'style.html',
            template: 'examples/style/style.html'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            filename: 'importScript.html',
            template: 'examples/importScript/importScript.html'
        })
    ]
});