var path = require('path');

function resolve(relativePath) {
  return path.resolve(__dirname, relativePath);
}

module.exports = {
  appBuild: resolve('../build'),
  appHtml: resolve('../index.html'),
  appFavicon: resolve('../favicon.ico'),
  appPackageJson: resolve('../package.json'),
  appFESrc: resolve('../app-fe'),
  appSLSrc: resolve('../app-sl'),
  appNodeModules: resolve('../node_modules'),
  ownNodeModules: resolve('../node_modules'),
  bootstrapCSSPath: resolve('../node_modules/bootstrap/dist/css')
};