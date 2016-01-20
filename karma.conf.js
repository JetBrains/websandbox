/* eslint-env node */

function getWebpackConfig() {
    var config = require('./webpack.config');
    //Drop entries because it breaks karma-webpack
    config.entry = {};
    config.plugins = [];
    config.devtool = 'inline-source-map';
    return config;
}

module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'sinon', 'sinon-chai'],

        files: ['test/**/*.js'],

        preprocessors: {
            'test/**/*.js': ['webpack', 'sourcemap']
        },

        webpackServer: {quiet: true},

        webpack: getWebpackConfig(),

        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },

        browsers: process.env.TRAVIS ? ['Chrome_travis_ci'] : ['Electron'],

        electronOpts: {
            show: false,
            skipTaskbar: true,
            height: 1024,
            width: 768,
            webPreferences: {
                pageVisibility: true
            }
        },
        singleRun: true,

        concurrency: Infinity
    });
};
