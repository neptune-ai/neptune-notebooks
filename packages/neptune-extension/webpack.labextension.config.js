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
      },
      {
        test: /\.svg?$/,
        use: 'file-loader',
        include: [
          path.resolve(__dirname, 'node_modules')
        ]
      }
    ]
  },
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      src: project.src.resolve(),
      'platform': path.resolve(__dirname, 'src/labextension')
    },
  },
  plugins: [
    /*
     * Strip development code from react.
     */
    new webpack.DefinePlugin({
      'process.env': {
        /* TODO: change to 'production' or read from process. */
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new webpack.DefinePlugin({
      'NEPTUNE_BUILD_DATE': JSON.stringify(new Date()),
    })
  ],
  devtool: 'eval-source-map',
  /* TODO: enable */
  optimization: {
    minimize: false
  }
}
