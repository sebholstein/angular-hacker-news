const path = require('path');
const AotPlugin = require('@ngtools/webpack').AotPlugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, 'src/main.ts'),
  output: {
    filename: 'app.min.js',
    path: path.resolve(__dirname, 'dist/src/')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: ['@ngtools/webpack', 'angular2-template-loader?keepUrl=true'],
      },
      { 
        test: /\.(html|css)$/, 
        loader: 'raw-loader'
      },
    ]
  },
  plugins: [
    new AotPlugin({
      tsConfigPath: 'tsconfig.json',
      mainPath: './src/main.ts'
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin({
      comments: false
    })
  ]
};