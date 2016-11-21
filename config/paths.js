var path = require('path');

function resolve(relativePath) {
  return path.resolve(__dirname, relativePath);
}

module.exports = {
  root: resolve('../'),
  appBuild: resolve('../build'),
  appHtml: resolve('../index.html'),
  appFavicon: resolve('../favicon.ico'),
  appPackageJson: resolve('../package.json'),
  appSrc: resolve('../app'),
  nodeModules: resolve('../node_modules')
};