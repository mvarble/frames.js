const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

/**
 * Transpile ES6 to CommonJS
 */
function log(err, stats) {
  if (err) throw err;
  console.log(stats.toString({ colors: true }));
}
const config = {
  target: 'node',
  mode: 'production',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: __dirname,
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      { test: /.js$/, exclude: /(node_modules)/, use: 'babel-loader' }
    ],
  },
  resolve: { extensions: ['.js'] },
  externals: [nodeExternals()],
};
webpack(config, log);
