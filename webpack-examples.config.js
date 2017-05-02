/* eslint-env node */
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./webpack.config');

module.exports = {
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
    module: baseConfig.module,
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
};
