import {
	LazyImage,
	createLazyImage,
	createImageSchema,
	SPINNER_SVG,
	BROKEN_SVG
} from './vanilla/index.js';
import { LazyImageElement, defineLazyImageElement } from './element/index.js';

export {
	LazyImage,
	createLazyImage,
	createImageSchema,
	LazyImageElement,
	defineLazyImageElement,
	SPINNER_SVG,
	BROKEN_SVG
};

// Auto-register <lazy-image> custom element
defineLazyImageElement();

// Attach to window for direct <script> tag usage
if (typeof window !== 'undefined') {
	const w = window as unknown as Record<string, unknown>;
	w.LazyImage = LazyImage;
	w.createLazyImage = createLazyImage;
	w.createImageSchema = createImageSchema;
	w.LazyImageElement = LazyImageElement;
}
