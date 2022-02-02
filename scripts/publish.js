/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const ghpages = require('gh-pages');

console.log('publishing...');

ghpages.publish('dist-examples', {branch: 'gh-pages'}, function(err) {
  if (err) {
    console.error('failed to publish', err);
  } else {
    console.info('published', err);
  }
});