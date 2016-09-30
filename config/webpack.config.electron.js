var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var paths = require('./paths');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
	nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
	devtool: 'source-map',
	target: 'electron-main',
	entry: [
		path.join(paths.appSrc, '/../electron.js')
	],
	output: {
		path: paths.appBuild,
		filename: 'electron.js'
	},
	resolve: {
		extensions: ['', '.js']
	},
	resolveLoader: {
		root: paths.ownNodeModules,
		moduleTemplates: ['*-loader']
	},
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				loader: 'eslint!source-map',
				include: paths.appSrc
			}
		],
		loaders: [
			{
				test: /\.js$/,
				include: paths.appSrc,
				loader: 'babel',
				query: require('./babel.dev')
			},
			{
				test: /\.json$/,
				include: [paths.appSrc, paths.appNodeModules],
				loader: 'json'
			},
		]
	},
	eslint: {
		configFile: path.join(__dirname, 'eslint.js'),
		useEslintrc: false
	},
	plugins: [
    	new LodashModuleReplacementPlugin,
		/*new webpack.optimize.UglifyJsPlugin({
			compressor: {
				warnings: false
			}
		}),*/
		new webpack.BannerPlugin(
			'require("source-map-support").install();',
			{ raw: true, entryOnly: false }
		),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('development')
			}
		})
	],
  	externals: [nodeModules]
};
