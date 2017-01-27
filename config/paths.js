var path = require('path');

function resolve(relativePath) {
  return path.resolve(__dirname, relativePath);
}

module.exports = {
  root: resolve('../'),
  appSrc: resolve('../src'),
  appBuild: resolve('../app'),
  appHtml: resolve('../src/index.html'),
  appFavicon: resolve('../favicon.ico'),
  appPackageJson: resolve('../package.json'),
  nodeModules: resolve('../node_modules')
};