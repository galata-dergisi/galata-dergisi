import fs from 'fs';
import copy from 'rollup-plugin-copy';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import autoprefixer from 'autoprefixer';
import sveltePreprocess from 'svelte-preprocess';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

try {
	if (!production) {
		console.log("Removing 'public'...");
		fs.rmdirSync('public', { recursive: true });
	}
} catch (ex) {
	if (ex.code !== 'ENOENT') {
		console.trace(ex);
		process.exit(1);
	}
}

fs.rmdirSync('public', { recursive: true });
fs.mkdirSync('public/katkida-bulunun', { recursive: true });

function getCommonPlugins({ cssPath }) {
	return [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: (css) => {
				css.write(cssPath, !production);
			},
			preprocess: sveltePreprocess({
				postcss: {
					plugins: [autoprefixer],
				},
			}),
		}),

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
		input: 'client/pages/homepage/index.js',
		output: {
			sourcemap: !production,
			format: 'iife',
			name: 'GalataDergisi',
			file: 'public/bundle.js',
		},
		plugins: [
			...getCommonPlugins({ cssPath: 'public/bundle.css' }),

			// Watch the `public` directory and refresh the
			// browser on changes when not in production
			!production && livereload('public'),

			copy({
				targets: [
					{ src: 'client/images', dest: 'public' },
					{ src: 'client/fonts', dest: 'public' },
					{ src: 'client/pages/homepage/index.html', dest: 'public' },
					{ src: 'client/pages/homepage/global.css', dest: 'public' },
					{ src: 'client/service-worker.js', dest: 'public' },
					{ src: 'client/lib/legacy-player.js', dest: 'public' },
					{ src: 'client/audio', dest: 'public' },
				],
			}),
		],
		watch: {
			clearScreen: false,
		},
	},
	{
		input: 'client/pages/contribute/contribute.js',
		output: {
			sourcemap: !production,
			format: 'iife',
			name: 'Contribute',
			file: 'public/katkida-bulunun/bundle.js',
		},
		plugins: [
			...getCommonPlugins({ cssPath: 'public/katkida-bulunun/bundle.css' }),
			copy({
				targets: [
					{ src: 'client/pages/contribute/katkida-bulunun.html', dest: 'public/katkida-bulunun', rename: 'index.html' },
				],
			}),
		],
		watch: {
			clearScreen: false,
		},
	},
];
