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

module.exports = function ({ mode, project }) {
  return {
    entry: project.src.resolve('nbextension/index.tsx'),
    output: {
      path: project.dist.resolve('nbextension'),
      filename: 'neptune-notebook.js',
      /*
       * Step 1: Instruct to generate AMD module.
       */
      libraryTarget: 'amd',
      /*
       * Step 2: Tell webpack to take the default export and return it from the
       * AMD module's factory function.
       */
      libraryExport: 'default',
    },
    /*
     * Step 3: Enter AMD module dependencies here. The "key" is the module alias,
     * as it appears in "export" code. The value will be copied to AMD module's
     * "define(dependencies)".
     *
     * Dependencies not specified here will be resolved and bundled.
     */
    externals: {
      jquery: 'jQuery',
      'base/js/namespace': 'base/js/namespace',
      'contents': 'contents',
      'services/config': 'services/config',
      'services/kernels/comm': 'services/kernels/comm',
    },
    // TODO: probably should be depenand of build mode
    devtool: mode === 'development'
      ? 'cheap-eval-module-source-map'
      : 'none',
  };
};
