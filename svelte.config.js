import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';



/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Используем препроцессор Vite (например, для SCSS, TypeScript и т.д.)
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		// Настраиваем пути в проекте
		files: {
			routes: 'src/pages',              // Переносим маршруты в `app`
			lib: 'src',
			appTemplate: 'src/app/app.html',     // Входная точка приложения
			assets: 'static'
		}

	}
};

export default config;
