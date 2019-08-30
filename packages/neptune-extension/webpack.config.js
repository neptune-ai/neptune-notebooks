const webpack = require('webpack')
const path = require('path')

/*
 * In AMD we would write (which is pretty simple):
 *
 * define([ dependency1, depedency2 ], function( function1, function2 ) {
 *   return factory_return_value;
 * });
 *
 * To achieve the same in webpack the above transforms to:
 *
 * import function1 from 'dependency1';
 * import function2 from 'dependency1';
 *
 * export default factory_return_value;
 *
 * It is pretty complicated to generate such AMD in webpack, because first
 * one has to write general ES6 import/export code, and then fine-tune
 * webpack options to transform it to AMD module. I guess it is impossible
 * to write the AMD module template oneself, because webpack throws on the
 * encounter with "define" keyword.
 */
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'neptune-notebook.js',
    /*
     * Step 1: Instruct to generate AMD module.
     */
    libraryTarget: 'amd',
    /*
     * Step 2: Tell webpack to take the default export and return it from the
     * AMD module's factory function.
     */
    libraryExport: 'default'
  },
  /*
   * Step 3: Enter AMD module dependencies here. The "key" is the module alias,
   * as it appears in "export" code. The value will be copied to AMD module's
   * "define(dependencies)".
   *
   * Dependencies not specified here will be resolved and bundled.
   */
  externals: {
    jquery: 'jquery',
    'base/js/namespace': 'base/js/namespace',
    'base/js/events': 'base/js/events',
    'base/js/dialog': 'base/js/dialog'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src')
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
