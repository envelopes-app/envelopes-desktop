var webpack = require('webpack');  
module.exports = {  
  target: 'web',
  entry: './test/TestsContainer.ts',
  externals: {
	"electron": "electron"
  },
  output: {
    path: './build',
    filename: 'tests.bundle.js'
  },
  // Turn on sourcemaps
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  ts: {
	configFileName: "./test/tsconfig.json"
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  }
}