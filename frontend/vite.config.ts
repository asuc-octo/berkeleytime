import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
	root: path.resolve(__dirname, 'src'),
	server: {
		host: true,
		port: 3000,
		watch: {
			usePolling: true
		}
	},
	plugins: [
		react(),
		svgr(),
		tsconfigPaths(),
		visualizer(),
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
