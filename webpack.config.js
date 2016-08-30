var webpack = require('webpack');
var path = require('path');

var BundleTracker = require('webpack-bundle-tracker');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require ('html-webpack-plugin');
var WebpackDevServer = require('webpack-dev-server');

var environment = process.env.NODE_ENV || 'development';
var host = '0.0.0.0';
var port = '9000';
var projectTitle = 'Project Title';

var outputName, pathinfo, devtool;
var plugins = [];
var preLoaders = [];

/*
  All environments
*/
plugins.push(new HtmlWebpackPlugin({
    title: projectTitle,
    filename: path.resolve('dist/index.html'),
    template: path.resolve('src/js/index.ejs'),
    hash: true,
  })
);
plugins.push(new ExtractTextPlugin('[name].css'));
plugins.push(new BundleTracker({
    path: path.resolve('dist'),
    filename: 'webpack-stats.'+ environment +'.json',
    logTime: true,
    indent: true,
  })
);
plugins.push(new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(environment),
}));

/*
  Build
*/
if (environment === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false,
    }
  }));
  plugins.push(new webpack.optimize.OccurenceOrderPlugin());
  outputName = '[name].min.js';
  pathinfo = false;
  devtool = 'source-map';
}

/*
  Dev
*/
if (environment === 'development') {
  // turn off linting for debugging
  if (!(process.argv.some((arg) => arg === '--debug'))) {
    preLoaders.push({
      test: /\.jsx?$/,
      loader: 'eslint',
    });
  }
  outputName = '[name].js';
  pathinfo = true;
  devtool = 'source-map';
}


var config = {
  context: __dirname,
  entry: path.resolve('src/js/index.jsx'),
  pathinfo: pathinfo,
  devtool: devtool,
  output: {
    path: path.resolve('dist'),
    filename: outputName,
  },
  plugins: plugins,
  module: {
    preLoaders: preLoaders,
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('css?sourceMap!less?sourceMap')
      },
      {
        test: /\.jpg$|\.png|\.gif|\.ico$/,
        loader: 'file-loader?name=img/[name].[ext]'
      },
      {
        test: /\.woff|woff2|ttf|eot|svg$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      },
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    modulesDirectories: ['node_modules'],
    extensions: ['', '.ejs', '.js', 'jsx', '.less']
  },
};

if (environment === 'development') {
  new WebpackDevServer(webpack(config), {
    contentBase: './dist',
    hot: true,
    quiet: false,
    noInfo: false,
    stats: {
      assets: false,
      colors: true,
      version: true,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
    },
  }).listen(port, host, function(err, result) {
    if (err) {
      console.log(err);
    }
  });
  console.log('-------------------------');
  console.log('Local web server runs at http://' + host + ':' + port);
  console.log('-------------------------');
  console.log('')
}


module.exports = config;
