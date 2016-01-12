var path = require('path');

module.exports = {
    entry: {
        frame: "./lib/frame",
        sandboxjs: "./lib/sandbox"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    }
};