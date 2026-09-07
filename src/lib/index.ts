// Svelte Component
export { default as Image } from './component/Image.svelte';
export { default } from './component/Image.svelte';

// Svelte Action
export { lazyImage } from './action/index.js';
export type { LazyImageActionOptions } from './action/index.js';

// Vanilla JS Framework-Agnostic Engine
export {
	LazyImage,
	createLazyImage,
	createImageSchema,
	observeElement,
	SPINNER_SVG,
	BROKEN_SVG
} from './vanilla/index.js';

// HTML5 Web Component / Custom Element
export { LazyImageElement, defineLazyImageElement } from './element/index.js';

// Shared TypeScript Types
export type { LazyImageOptions, LazyImageState, PictureSource } from './types.js';
