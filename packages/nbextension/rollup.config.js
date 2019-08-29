import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

export default {
  input: './src/neptune-notebook.js',
  plugins: [
    /*
     * This is not really what webpack's define plugin does, looks like rollup
     * is not that powerful.
     */
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    /*
     * Rollup works on es6 by default, but node_modules are commonjs pretty
     * often.
     */
    commonjs({
      include: 'node_modules/**',
      /* This is a fix for styled-components. */
      namedExports: {
        'node_modules/react/index.js': [
          'cloneElement',
          'createContext',
          'Component',
          'createElement'
        ],
        'node_modules/react-dom/index.js': ['render', 'hydrate'],
        'node_modules/react-is/index.js': [
          'isElement',
          'isValidElementType',
          'ForwardRef'
        ]
      }
    }),
    /*
     * This plugin exists for node modules resolution.
     */
    resolve({
      jsnext: true,
      main: false
    }),
    babel({
      exclude: 'node_modules/**'
    })
    // uglify(),
  ],
  output: {
    file: 'dist/neptune-notebook.js',
    /* This does not seem to be important. */
    format: 'cjs',
    sourceMap: true
  }
}
