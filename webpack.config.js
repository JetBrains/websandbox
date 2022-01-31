/* eslint-env node */
const path = require('path');

module.exports = () => {
  return {
    mode: 'development',
    devtool: 'none',
    entry: {
      websandbox: './lib/websandbox',
      frame: './lib/frame'
    },
    output: {
      path: __dirname + '/dist',
      libraryTarget: 'umd',
      library: 'Websandbox',
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [
            path.resolve('./', 'examples'),
            path.resolve('./', 'lib'),
            path.resolve('./', 'test')
          ],
          use: ['babel-loader']
        },
        {
          test: /\.html$/,
          include: [path.resolve('./', 'lib')],
          use: ['html-loader?interpolate']
        }
      ]
    }
  };
};
