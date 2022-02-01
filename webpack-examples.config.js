/* eslint-env node */
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./webpack.config');

module.exports = {
    mode: 'development',
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
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {}
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: false,
            template: 'examples/index.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'simple.html',
            template: 'examples/simple/simple.html',
            chunks: ['simple']
        }),
        new HtmlWebpackPlugin({
            filename: 'style.html',
            template: 'examples/style/style.html',
            chunks: ['style']
        }),
        new HtmlWebpackPlugin({
            filename: 'importScript.html',
            template: 'examples/importScript/importScript.html',
            chunks: ['importScript']
        })
    ]
};
