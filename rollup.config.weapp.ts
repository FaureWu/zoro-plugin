import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

const replaceOption = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
};

const plugins = ['loading', 'mixin', 'perf'];

export default plugins.map(name => {
  const outputFileName = name.replace(/([A-Z])/g, '-$1').toLowerCase();

  return {
    input: `src/plugin/${name}.ts`,
    output: {
      format: 'es',
      indent: false,
      file: `dist/zoro-${outputFileName}.js`,
    },
    plugins: [
      nodeResolve({
        mainFields: ['module', 'main', 'jsnext'],
      }),
      typescript({
        useTsconfigDeclarationDir: true,
        clean: true,
        rollupCommonJSResolveHack: true,
      }),
      replace(replaceOption),
      commonjs(),
    ],
  };
});
