const webpack = require('webpack');

const config = {
  mode: 'production',
  entry: './src.js',
  output: {
    path: __dirname,
    filename: 'index.js'
  },
  module: {
    rules: [
      { test: /.js$/, exclude: /(node_modules)/, use: 'babel-loader' }
    ],
  },
  resolve: {
    extensions: ['.js']
  },
};

function callback(err, stats) {
  if (err) throw err;
  console.log(stats.toString({ colors: true }));
}

webpack(config, callback);
