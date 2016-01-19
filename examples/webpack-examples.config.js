/* eslint-env node */
var HtmlWebpackPlugin = require('html-webpack-plugin');

var baseConfig = require('../webpack.config');
baseConfig.entry = {};
var configMerger = require('webpack-config-merger');

module.exports = configMerger(baseConfig, {
    entry: {
        simple: './examples/simple/simple',
        importScript: './examples/importScript/importScript',
        scriptToImport: './examples/importScript/scriptToImport'
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
});