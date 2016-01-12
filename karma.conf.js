function getWebpackConfig() {
    var config = require('./webpack.config');
    //Drop entries because it breaks karma-webpack
    config.entry = {};
    return config;
}

module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai'],

        files: ['test/**/*.js'],

        preprocessors: {'test/**/*.js': ['webpack']},

        webpackServer: {quiet: true},

        webpack: getWebpackConfig(),

        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],

        singleRun: true,

        concurrency: Infinity
    })
}
