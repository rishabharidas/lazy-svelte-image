import { observeElement } from '../vanilla/index.js';

export interface LazyImageActionOptions {
	src: string;
	placeholder?: string;
	srcset?: string;
	sizes?: string;
	rootMargin?: string;
	threshold?: number | number[];
	native?: boolean;
	fadeDuration?: number;
	onLoad?: (e: Event) => void;
	onError?: (e: Event) => void;
	onIntersect?: (entry: IntersectionObserverEntry) => void;
}

/**
 * Svelte Action `use:lazyImage`
 * Works across Svelte 3, Svelte 4, and Svelte 5!
 *
 * Usage:
 * <img use:lazyImage={{ src: 'large.jpg', placeholder: 'thumb.jpg' }} alt="Hero" />
 */
export function lazyImage(node: HTMLImageElement, options: LazyImageActionOptions) {
	let currentOptions = { ...options };
	let unobserve: (() => void) | null = null;
	const fadeDuration = currentOptions.fadeDuration ?? 300;

	node.style.transition = `opacity ${fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

	if (currentOptions.placeholder) {
		node.src = currentOptions.placeholder;
		node.style.opacity = '0.6';
		node.style.filter = 'blur(8px)';
	} else {
		node.style.opacity = '0';
	}

	function load() {
		const img = new Image();
		if (currentOptions.srcset) img.srcset = currentOptions.srcset;
		if (currentOptions.sizes) img.sizes = currentOptions.sizes;
		img.src = currentOptions.src;

		img.onload = (e) => {
			node.src = currentOptions.src;
			if (currentOptions.srcset) node.srcset = currentOptions.srcset;
			if (currentOptions.sizes) node.sizes = currentOptions.sizes;
			node.style.opacity = '1';
			node.style.filter = 'none';
			node.dispatchEvent(new CustomEvent('lazyload', { detail: { event: e } }));
			currentOptions.onLoad?.(e);
		};

		img.onerror = (e) => {
			node.dispatchEvent(new CustomEvent('lazyerror', { detail: { event: e } }));
			currentOptions.onError?.(e as Event);
		};
	}

	if (currentOptions.native) {
		node.loading = 'lazy';
		load();
	} else {
		unobserve = observeElement(
			node,
			(entry) => {
				node.dispatchEvent(new CustomEvent('lazyintersect', { detail: { entry } }));
				currentOptions.onIntersect?.(entry);
				load();
			},
			{
				rootMargin: currentOptions.rootMargin,
				threshold: currentOptions.threshold
			}
		);
	}

	return {
		update(newOptions: LazyImageActionOptions) {
			currentOptions = { ...newOptions };
		},
		destroy() {
			if (unobserve) {
				unobserve();
				unobserve = null;
			}
		}
	};
}
