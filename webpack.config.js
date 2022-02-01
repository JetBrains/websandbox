/* eslint-env node */
const path = require('path');

module.exports = () => {
  return {
    mode: 'development',
    devtool: 'none',
    target: 'web',
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
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: [
            path.resolve('./', 'lib')
          ],
          loader: 'ts-loader',
          options: {}
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
