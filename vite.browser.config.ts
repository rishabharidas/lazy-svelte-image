import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		emptyOutDir: false,
		lib: {
			entry: 'src/lib/browser.ts',
			name: 'LazyImageGlobal',
			formats: ['iife'],
			fileName: () => 'browser.global.js'
		},
		outDir: 'dist'
	}
});
