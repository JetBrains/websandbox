/* eslint-env node */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = () => {
  return {
    mode: 'development',
    devtool: false,
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
    optimization: {
      minimize: false // We don't want to minify distributed code, only join everything together
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
        }
      ]
    }
  };
};
