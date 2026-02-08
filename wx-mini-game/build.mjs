import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/game-entry.ts'],
  bundle: true,
  outfile: 'game.js',
  format: 'cjs',
  platform: 'neutral',
  mainFields: ['main', 'module'],
  target: 'es2017',
  minify: !watch,
  sourcemap: watch,
};

if (watch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(config);
  console.log('Build complete → game.js');
}
