/**
 * Babel config is in it's own file (rather than inline in rollup.config.js) to
 * make the config available to jest (when run via npm test)
 */

module.exports = {
  exclude: 'node_modules/**',
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [['@babel/transform-runtime', { 'regenerator': true }]]
}
