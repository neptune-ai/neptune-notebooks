// Libs
const webpack = require('webpack')

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
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'babel-loader',
        include: [
          project.src.resolve()
        ]
      }
    ]
  },
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      src: project.src.resolve(),
    },
  },
  plugins: [
    /*
     * Strip development code from react.
     */
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],
  /* TODO: enable */
  optimization: {
    minimize: false
  }
}
