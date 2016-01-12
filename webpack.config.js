var path = require('path');

module.exports = {
    entry: {
        frame: "./lib/frame",
        sandboxjs: "./lib/sandbox"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [path.resolve('./', 'lib'), path.resolve('./', 'test')],
                loader: "babel-loader"}
        ]
    }
};