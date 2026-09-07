import type { LazyImageOptions, LazyImageState } from '../types.js';

export const SPINNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lazy-image-spinner"><circle stroke-dasharray="113.097 39.699" r="24" stroke-width="4" stroke="currentColor" fill="none" cy="50" cx="50"></circle></svg>`;

export const BROKEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="lazy-image-broken-icon"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L489.3 358.2l90.5-90.5c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114l-96 96-31.9-25C430.9 239.6 420.1 175.1 377 132c-52.2-52.3-134.5-56.2-191.3-11.7L38.8 5.1zM239 162c30.1-14.9 67.7-9.9 92.8 15.3c20 20 27.5 48.3 21.7 74.5L239 162zM116.6 187.9L60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5l61.8-61.8-50.6-39.9zM220.9 270c-2.1 39.8 12.2 80.1 42.2 110c38.9 38.9 94.4 51 143.6 36.3L220.9 270z"/></svg>`;

/**
 * Generate Schema.org ImageObject structured data for SEO
 */
export function createImageSchema(options: LazyImageOptions): string {
	const schemaData: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'ImageObject',
		contentUrl: options.src,
		url: options.src,
		name: options.alt || options.title || 'Image',
		description: options.alt || options.caption || ''
	};

	if (options.width) schemaData.width = String(options.width);
	if (options.height) schemaData.height = String(options.height);
	if (options.caption) schemaData.caption = options.caption;

	if (typeof options.schema === 'object' && options.schema !== null) {
		Object.assign(schemaData, options.schema);
	}

	return JSON.stringify(schemaData);
}

// Observer registry for pooled IntersectionObservers
const observerPool = new Map<string, IntersectionObserver>();
const elementCallbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>();

function getObserverKey(rootMargin: string, threshold: number | number[]): string {
	return `${rootMargin}_${Array.isArray(threshold) ? threshold.join(',') : threshold}`;
}

export function observeElement(
	element: Element,
	callback: (entry: IntersectionObserverEntry) => void,
	options: { rootMargin?: string; threshold?: number | number[] } = {}
): () => void {
	if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
		// Fallback for SSR or non-supporting environments: trigger immediately
		callback({ isIntersecting: true, target: element } as unknown as IntersectionObserverEntry);
		return () => {};
	}

	const rootMargin = options.rootMargin || '200px';
	const threshold = options.threshold ?? 0.01;
	const key = getObserverKey(rootMargin, threshold);

	let observer = observerPool.get(key);
	if (!observer) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const cb = elementCallbacks.get(entry.target);
						if (cb) {
							cb(entry);
							observer?.unobserve(entry.target);
							elementCallbacks.delete(entry.target);
						}
					}
				}
			},
			{ rootMargin, threshold }
		);
		observerPool.set(key, observer);
	}

	elementCallbacks.set(element, callback);
	observer.observe(element);

	return () => {
		observer?.unobserve(element);
		elementCallbacks.delete(element);
	};
}

/**
 * Universal Framework-Agnostic LazyImage class
 */
export class LazyImage {
	private container: HTMLElement;
	private options: LazyImageOptions;
	private state: LazyImageState = 'idle';
	private unobserve: (() => void) | null = null;
	private currentAttempt = 0;

	private wrapperEl: HTMLElement | null = null;
	private placeholderImgEl: HTMLImageElement | null = null;
	private mainImgEl: HTMLImageElement | null = null;
	private pictureEl: HTMLPictureElement | null = null;
	private overlayEl: HTMLElement | null = null;
	private schemaScriptEl: HTMLScriptElement | null = null;

	constructor(target: HTMLElement | string, options: LazyImageOptions) {
		const resolvedTarget = typeof target === 'string' ? document.querySelector(target) : target;
		if (!resolvedTarget || !(resolvedTarget instanceof HTMLElement)) {
			throw new Error('[LazyImage] Invalid target element or selector.');
		}
		this.container = resolvedTarget;
		this.options = { ...options };
		this.init();
	}

	private init(): void {
		this.renderStructure();

		if (this.options.native) {
			this.loadMainImage();
		} else {
			this.unobserve = observeElement(
				this.container,
				(entry) => {
					this.options.onIntersect?.(entry);
					this.loadMainImage();
				},
				{
					rootMargin: this.options.rootMargin,
					threshold: this.options.threshold
				}
			);
		}
	}

	private renderStructure(): void {
		this.container.innerHTML = '';
		const opts = this.options;

		// Wrapper element with aspect-ratio prevention of layout shift (CLS)
		const wrapper = document.createElement('div');
		wrapper.className = 'lazy-image-wrapper';
		if (opts.backgroundColor) {
			wrapper.style.setProperty('--lazy-bg', opts.backgroundColor);
		}
		if (opts.fadeDuration !== undefined) {
			wrapper.style.setProperty('--lazy-fade', `${opts.fadeDuration}ms`);
		}
		if (opts.blur !== undefined) {
			wrapper.style.setProperty('--lazy-blur', `${opts.blur}px`);
		}
		if (opts.objectFit) {
			wrapper.style.setProperty('--lazy-object-fit', opts.objectFit);
		}
		if (opts.objectPosition) {
			wrapper.style.setProperty('--lazy-object-position', opts.objectPosition);
		}

		if (opts.aspectRatio) {
			wrapper.setAttribute('data-aspect-ratio', 'true');
			wrapper.style.setProperty('--lazy-aspect-ratio', String(opts.aspectRatio));
		}
		if (opts.width) {
			wrapper.style.width = typeof opts.width === 'number' ? `${opts.width}px` : opts.width;
		}
		if (opts.height) {
			wrapper.style.height = typeof opts.height === 'number' ? `${opts.height}px` : opts.height;
		}

		this.wrapperEl = wrapper;

		// Placeholder image if provided (Blur-up LQIP)
		if (opts.placeholder) {
			const placeholderImg = document.createElement('img');
			placeholderImg.className = 'lazy-image-placeholder-img';
			placeholderImg.src = opts.placeholder;
			placeholderImg.alt = '';
			placeholderImg.setAttribute('aria-hidden', 'true');
			placeholderImg.decoding = 'async';
			wrapper.appendChild(placeholderImg);
			this.placeholderImgEl = placeholderImg;
		}

		// Overlay element for spinner or broken state
		const overlay = document.createElement('div');
		overlay.className = 'lazy-image-overlay';
		wrapper.appendChild(overlay);
		this.overlayEl = overlay;

		const disableLoader = opts.disableLoader ?? opts.disabeLoader ?? false;
		if (!disableLoader) {
			overlay.innerHTML = `<div class="lazy-image-loader-container">${SPINNER_SVG}</div>`;
		}

		// Image / Picture setup
		if (opts.sources && opts.sources.length > 0) {
			const picture = document.createElement('picture');
			picture.className = 'lazy-image-picture';
			for (const s of opts.sources) {
				const source = document.createElement('source');
				source.srcset = s.srcset;
				if (s.type) source.type = s.type;
				if (s.media) source.media = s.media;
				if (s.sizes) source.sizes = s.sizes;
				picture.appendChild(source);
			}
			const img = document.createElement('img');
			img.className = 'lazy-image-main';
			img.alt = opts.alt || '';
			if (opts.title) img.title = opts.title;
			if (opts.native) {
				img.loading = 'lazy';
				img.src = opts.src;
				if (opts.srcset) img.srcset = opts.srcset;
				if (opts.sizes) img.sizes = opts.sizes;
			}
			img.decoding = opts.decoding || 'async';
			if (opts.fetchpriority) img.setAttribute('fetchpriority', opts.fetchpriority);
			picture.appendChild(img);
			wrapper.appendChild(picture);
			this.pictureEl = picture;
			this.mainImgEl = img;
		} else {
			const img = document.createElement('img');
			img.className = 'lazy-image-main';
			img.alt = opts.alt || '';
			if (opts.title) img.title = opts.title;
			if (opts.native) {
				img.loading = 'lazy';
				img.src = opts.src;
				if (opts.srcset) img.srcset = opts.srcset;
				if (opts.sizes) img.sizes = opts.sizes;
			}
			img.decoding = opts.decoding || 'async';
			if (opts.fetchpriority) img.setAttribute('fetchpriority', opts.fetchpriority);
			wrapper.appendChild(img);
			this.mainImgEl = img;
		}

		// Optional caption
		this.container.appendChild(wrapper);

		if (opts.caption) {
			const caption = document.createElement('figcaption');
			caption.className = 'lazy-image-caption';
			caption.textContent = opts.caption;
			this.container.appendChild(caption);
		}

		// Inject Schema.org structured data if enabled for SEO
		if (opts.schema) {
			const script = document.createElement('script');
			script.type = 'application/ld+json';
			script.textContent = createImageSchema(opts);
			this.container.appendChild(script);
			this.schemaScriptEl = script;
		}
	}

	private loadMainImage(): void {
		if (!this.mainImgEl) return;
		this.state = 'loading';

		const img = new Image();
		if (this.options.srcset) img.srcset = this.options.srcset;
		if (this.options.sizes) img.sizes = this.options.sizes;
		img.src = this.options.src;

		img.onload = (e) => {
			this.state = 'loaded';
			if (this.mainImgEl) {
				this.mainImgEl.src = this.options.src;
				if (this.options.srcset) this.mainImgEl.srcset = this.options.srcset;
				if (this.options.sizes) this.mainImgEl.sizes = this.options.sizes;
				this.mainImgEl.classList.add('is-loaded');
			}
			if (this.placeholderImgEl) {
				this.placeholderImgEl.classList.add('is-hidden');
			}
			if (this.overlayEl) {
				this.overlayEl.innerHTML = '';
			}
			this.options.onLoad?.(e);
		};

		img.onerror = (e) => {
			this.state = 'error';
			if (this.overlayEl && !this.options.disableBroken) {
				this.overlayEl.classList.add('interactive');
				const canRetry =
					this.options.retry &&
					(this.options.maxRetries === undefined || this.currentAttempt < this.options.maxRetries);
				this.overlayEl.innerHTML = `
					<div class="lazy-image-broken-container">
						${BROKEN_SVG}
						<span>Failed to load image</span>
						${canRetry ? `<button type="button" class="lazy-image-retry-button">Retry</button>` : ''}
					</div>
				`;
				if (canRetry) {
					const btn = this.overlayEl.querySelector('.lazy-image-retry-button');
					btn?.addEventListener('click', () => this.retry());
				}
			}
			this.options.onError?.(e as Event);
		};
	}

	public retry(): void {
		this.currentAttempt++;
		this.options.onRetry?.(this.currentAttempt);
		const disableLoader = this.options.disableLoader ?? this.options.disabeLoader ?? false;
		if (this.overlayEl) {
			this.overlayEl.classList.remove('interactive');
			this.overlayEl.innerHTML = disableLoader
				? ''
				: `<div class="lazy-image-loader-container">${SPINNER_SVG}</div>`;
		}
		this.loadMainImage();
	}

	public getState(): LazyImageState {
		return this.state;
	}

	public update(newOptions: Partial<LazyImageOptions>): void {
		this.options = { ...this.options, ...newOptions };
		this.currentAttempt = 0;
		this.destroy();
		this.init();
	}

	public destroy(): void {
		if (this.unobserve) {
			this.unobserve();
			this.unobserve = null;
		}
		this.container.innerHTML = '';
		this.wrapperEl = null;
		this.placeholderImgEl = null;
		this.mainImgEl = null;
		this.pictureEl = null;
		this.overlayEl = null;
		this.schemaScriptEl = null;
	}
}

/**
 * Convenience helper to instantiate LazyImage
 */
export function createLazyImage(
	target: HTMLElement | string,
	options: LazyImageOptions
): LazyImage {
	return new LazyImage(target, options);
}
