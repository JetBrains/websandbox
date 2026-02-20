/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const ghpages = require('gh-pages');

const options = {branch: 'gh-pages'};

// Use token-authenticated URL in CI
// eslint-disable-next-line no-undef
if (process.env.GITHUB_TOKEN) {
  // eslint-disable-next-line no-undef
  const repo = process.env.GITHUB_REPOSITORY || 'JetBrains/websandbox';
  // eslint-disable-next-line no-undef
  options.repo = `https://git:${process.env.GITHUB_TOKEN}@github.com/${repo}.git`;
}

console.log('publishing...');

ghpages.publish('dist-examples', options, function(err) {
  if (err) {
    console.error('failed to publish', err);
  } else {
    console.info('published', err);
  }
});