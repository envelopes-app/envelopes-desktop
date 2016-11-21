process.env.NODE_ENV = 'production';

var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var filesize = require('filesize');
var gzipSize = require('gzip-size').sync;
var rimrafSync = require('rimraf').sync;
var webpack = require('webpack');
var appConfig = require('../config/webpack.config.prod');
var containerConfig = require('../config/webpack.config.electron');
var paths = require('../config/paths');

// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
rimrafSync(paths.appBuild + '/*.*');

// Copy the package.json file into the build directory
fs.createReadStream(path.join(paths.root, 'package.json')).pipe(fs.createWriteStream(path.join(paths.appBuild, 'package.json')));

console.log('Creating an optimized production build...');
webpack(appConfig).run(function(err, stats) {
	if (err) {
		console.error('Failed to create a production build. Reason:');
		console.error(err.message || err);
		process.exit(1);
	}

	console.log(chalk.green('Compiled successfully.'));
	console.log();

	console.log('File sizes after gzip:');
	console.log();
	var assets = stats.toJson().assets
		.filter(asset => /\.(js|css)$/.test(asset.name))
		.map(asset => {
			var fileContents = fs.readFileSync(paths.appBuild + '/' + asset.name);
			return {
				name: asset.name,
				size: gzipSize(fileContents)
			};
		});
	assets.sort((a, b) => b.size - a.size);
	assets.forEach(asset => {
		console.log(
			'  ' + chalk.dim('build' + path.sep) + chalk.cyan(asset.name) + ': ' +
			chalk.green(filesize(asset.size))
		);
  	});
	console.log();

	webpack(containerConfig).run(function(err, stats) {
		if (err) {
			console.error('Failed to create a production build. Reason:');
			console.error(err.message || err);
			process.exit(1);
		}
	});
});
