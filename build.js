const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const babel = require('@babel/core');

/**
 * Bundle for web use
 */
webpack(
  {
    mode: 'production',
    entry: path.join(__dirname, 'src', 'dist.js'),
    output: {
      path: __dirname,
      filename: 'frames.js',
    },
    module: {
      rules: [
        { test: /.js$/, exclude: /(node_modules)/, use: 'babel-loader' }
      ],
    },
    resolve: {
      extensions: ['.js']
    },
  },
  function (err, stats) {
    if (err) throw err;
    console.log(stats.toString({ colors: true }));
  }
);

/**
 * Transpile ES6 to CommonJS
 */
babel.transformFile(
  './src/frames.js', 
  { minified: true, sourceType: 'module' }, 
  function (err, result) {
    if (err) throw err;
    console.log(result);
    fs.writeFile(
      'index.js', 
      result.code, 
      function(err) { if (err) throw err; }
    );
  },
);
