import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'

module.exports = {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.min.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    babel({ runtimeHelpers: true }),
    resolve(),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/index.js': [
          'Component',
          'PureComponent',
          'Fragment',
          'Children',
          'createElement',
          'useContext',
          'useEffect',
          'useLayoutEffect',
          'useMemo',
          'useReducer',
          'useRef'
        ],
        'node_modules/react-dom/index.js': [
          'unstable_batchedUpdates'
        ],
        'node_modules/react-is/index.js': [
          'isContextConsumer',
          'isValidElementType'
        ]
      }
    }),
    postcss({
      extensions: [ '.css' ]
    })
  ]
}
