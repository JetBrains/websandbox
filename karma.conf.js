/* eslint-env node */

function getWebpackConfig() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    var config = require('./webpack.config')();
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
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },

        browsers: ['ChromeHeadlessNoSandbox'],

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
