import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'

const babelOption = {
  babelrc: false,
  exclude: 'node_modules/**',
  presets: [['@babel/preset-env', { modules: false, loose: true }]],
}

const replaceOption = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
}

const plugins = ['loading', 'extendModel', 'mixin', 'perf']

export default plugins.map(name => {
  const outputFileName = name.replace(/([A-Z])/g, '-$1').toLowerCase()

  return {
    input: `src/${name}.js`,
    output: {
      format: 'es',
      indent: false,
      file: `dist/zoro-${outputFileName}.js`,
    },
    plugins: [
      nodeResolve({
        mainFields: ['module', 'main', 'jsnext'],
      }),
      babel(babelOption),
      replace(replaceOption),
      commonjs(),
    ],
  }
})
