// Libs
const webpack = require('webpack');
const path = require('path');

// Config
const project = require('./config/project');

/*
 * Jupyter Lab extension (labextension) is a standard npm package.
 * It supports both es6 modules and commonjs.
 *
 * Jupyter tools will create the package themselves, by using "npm pack", so it
 * is important to set the "main" field in package.json to the bundle generated
 * for labextension.
 */
module.exports = {
  mode: 'development',
  entry: project.src.resolve('labextension/index.js'),
  output: {
    path: project.dist.resolve('labextension'),
    filename: 'neptune-notebook.js',
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        include: [
          project.src.resolve(),
        ],
        use: ['eslint-loader'],
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'babel-loader',
        include: [
          project.src.resolve(),
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.svg?$/,
        use: 'file-loader',
        include: [
          path.resolve(__dirname, 'node_modules')
        ],
      },
      {
        test: /\.svg?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }],
        include: [
          project.src.resolve()
        ],
      }
    ]
  },
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      src: project.src.resolve(),
      'platform': project.src.resolve('labextension'),
    },
  },
  plugins: [
    /*
     * Strip development code from react.
     */
    new webpack.DefinePlugin({
      'process.env': {
        /* TODO: change to 'production' or read from process. */
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.DefinePlugin({
      'NEPTUNE_BUILD_DATE': JSON.stringify(new Date()),
    }),
  ],
  devtool: 'eval-source-map',
  /* TODO: enable */
  optimization: {
    minimize: false,
  },
};
