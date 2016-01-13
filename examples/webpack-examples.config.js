var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        simple: './examples/simple/simple'
    },
    output: {
        path: __dirname + '/dist'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [path.resolve('./', '../lib'), path.resolve('./', '')],
                loader: 'babel-loader'}
        ]
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'examples/simple/simple.html',
        inject: 'body'
    })]
};