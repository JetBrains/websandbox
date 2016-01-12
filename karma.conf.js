// Karma configuration
// Generated on Tue Jan 12 2016 16:38:58 GMT+0300 (MSK)

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],

    files: ['test/**/*.js'],

    preprocessors: {'test/**/*.js': ['webpack']},

    webpackServer: {quiet: true},

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
