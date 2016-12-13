var fs = require('fs');
var path = require('path');
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
var url = require('url');
var paths = require('./paths');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
	nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  bail: true,
  devtool: 'source-map',
  entry: [
    require.resolve('./polyfills'),
	  path.join(paths.appSrc, 'index')
  ],
  output: {
    path: paths.appBuild,
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].chunk.js',
    publicPath: './'
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx', 'css', 'less']
  },
  resolveLoader: {
    root: paths.nodeModules,
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
        query: require('./babel.prod')
      },
      { 
        test: /\.(ts|tsx)?$/, 
        include: paths.appSrc,
        loader: 'ts' 
      }, 
      {
        test: /\.css$/,
        include: [paths.appSrc, paths.nodeModules],
        // Disable autoprefixer in css-loader itself:
        // https://github.com/webpack/css-loader/issues/281
        // We already have it thanks to postcss.
        loader: ExtractTextPlugin.extract('style', 'css?-autoprefixer!postcss')
      },
	  {
        test: /\.less$/,
        loader: "style!css!less"
      },
      {
        test: /\.json$/,
        include: [paths.appSrc, paths.nodeModules],
        loader: 'json'
      },
      {
        test: /\.(jpg|png|gif||woff)$/,
        loader: 'file',
      },
      { 
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: "file" 
      },
      {
         test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
         loader: "url?limit=10000&mimetype=application/octet-stream" 
      },
      { 
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
        loader: "url?limit=10000&mimetype=image/svg+xml" 
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url?limit=10000"
      },
      {
        test: /\.(mp4|webm)$/,
        loader: 'url?limit=10000'
      }
    ]
  },
  eslint: {
    configFile: path.join(__dirname, 'eslint.js'),
    useEslintrc: false
  },
  postcss: function() {
    return [autoprefixer];
  },
  plugins: [
	new webpack.IgnorePlugin(/vertx/),
    new LodashModuleReplacementPlugin,
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      favicon: paths.appFavicon,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
/*    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    }),*/
    new ExtractTextPlugin('[name].[contenthash:8].css')
  ],
  externals: [nodeModules]
};
