/* eslint-env node */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./webpack.config');

// ES module build of the host library, referenced by the "module" field in package.json.
// The UMD build from webpack.config.js stays the "main" entry for CommonJS and script-tag users.
module.exports = () => {
  const config = baseConfig();
  return {
    ...config,
    entry: {
      websandbox: './lib/websandbox'
    },
    output: {
      path: config.output.path,
      library: {type: 'module'},
      filename: '[name].mjs'
    },
    experiments: {
      outputModule: true
    }
  };
};
