import css from 'rollup-plugin-css-only';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import autoprefixer from 'autoprefixer';
import sveltePreprocess from 'svelte-preprocess';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

function getCommonPlugins({ cssPath }) {
	return [
		svelte({
			preprocess: sveltePreprocess({
				postcss: {
					plugins: [autoprefixer],
				},
			}),
		}),

    css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: (importee) => {
				return importee === 'svelte' || importee.startsWith('svelte/');
			},
		}),
		commonjs(),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
	];
}

export default [
	{
		input: 'client/pages/editor-panel/index.js',
		output: {
			sourcemap: !production,
			format: 'iife',
			name: 'EditorPanel',
			file: 'editor-panel/bundle.js',
		},
		plugins: [
			...getCommonPlugins({ cssPath: 'bundle.css' }),
			!production && livereload('editor-panel'),
		],
		watch: {
			clearScreen: false,
		},
	},
];
