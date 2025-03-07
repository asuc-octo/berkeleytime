import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import vsharp from 'vite-plugin-vsharp';
import path from 'path';

export default defineConfig({
	root: path.resolve(__dirname, 'src'),
	server: {
		host: true,
		port: 3000,
		open: true
	},
	publicDir: path.resolve(__dirname, 'public'),
	plugins: [
		react(),
		svgr(),
		tsconfigPaths(),
		visualizer(),
		vsharp({
      width: 640,
      height: 640,
			excludePublic: ['public']
		}),
		createHtmlPlugin({
			minify: true,
			entry: '/index.tsx',
			template: '/index.html'
		})
	],
	resolve: {
		alias: {
			'~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap')
		}
	},
	build: {
		outDir: '../build',
		sourcemap: false
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
        @import '/assets/scss/bt/base/responsive';
        @import '/assets/scss/bt/theming/colors';
        `
			}
		}
	}
});
