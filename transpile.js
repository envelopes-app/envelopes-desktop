process.env.NODE_ENV = 'production';

var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var filesize = require('filesize');
var gzipSize = require('gzip-size').sync;
var rimrafSync = require('rimraf').sync;
var webpack = require('webpack');
var appConfig = require('./config/webpack.config.prod');
var containerConfig = require('./config/webpack.config.electron');
var paths = require('./config/paths');

if(!fs.existsSync(paths.appBuild)) {
	fs.mkdirSync(paths.appBuild);
}
else {
	// Remove all content but keep the directory so that
	// if you're in it, you don't end up in Trash
	rimrafSync(paths.appBuild + '/*.*');
}

// Copy the icon files into the app output directory
// fs.createReadStream(path.join(paths.root, 'package.json')).pipe(fs.createWriteStream(path.join(paths.appBuild, 'package.json')));

console.log('Creating an optimized production build...');
webpack(appConfig).run(function(err, stats) {
	if (err) {
		console.error("Failed to create a production 'react app' build. Reason:");
		console.error(err.message || err);
		process.exit(1);
	}
	else {
		outputStats("react app", stats);
	}


	webpack(containerConfig).run(function(err, stats) {
		if (err) {
			console.error("Failed to create a production 'electron container' build. Reason:");
			console.error(err.message || err);
			process.exit(1);
		}
		else {
			outputStats("electron container", stats);
		}
	});
});

function outputStats(moduleName, stats) {

	console.log(chalk.green("Compiled '" + moduleName + "' successfully."));
	console.log('File sizes after gzip:');
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
			'  ' + chalk.cyan(asset.name) + ': ' +
			chalk.green(filesize(asset.size))
		);
  	});
	console.log();
}