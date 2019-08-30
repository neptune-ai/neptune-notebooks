const webpack = require('webpack')
const path = require('path')

/*
 * Jupyter Lab extension (labextension) is a standard npm package.
 * It supports both es6 modules and commonjs.
 *
 * Jupyter tools will create the package themselves, by using "npm pack", so it
 * is important to set the "main" field in package.json to the bundle generated
 * for labextension.
 */
module.exports = {
  entry: './src/labextension/index.js',
  output: {
    path: path.resolve(process.cwd(), 'dist/labextension'),
    filename: 'neptune-notebook.js',
    libraryTarget: 'commonjs2',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [
          path.resolve(process.cwd(), 'src')
        ]
      }
    ]
  },
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js']
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
