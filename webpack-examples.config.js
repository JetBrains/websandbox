/* eslint-env node */
var HtmlWebpackPlugin = require('html-webpack-plugin');

var baseConfig = require('./webpack.config');
baseConfig.entry = {};
var configMerger = require('webpack-config-merger');

module.exports = configMerger(baseConfig, {
    entry: {
        simple: './examples/simple/simple',
        style: './examples/style/style',
        importScript: './examples/importScript/importScript',
        scriptToImport: './examples/importScript/scriptToImport'
    },
    output: {
        filename: '[name].js'
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
            filename: 'style.html',
            template: 'examples/style/style.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'importScript.html',
            template: 'examples/importScript/importScript.html'
        })
    ]
});