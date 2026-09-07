import { SPINNER_SVG, BROKEN_SVG, observeElement } from '../vanilla/index.js';

const BaseElement =
	typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as unknown as typeof HTMLElement);

/**
 * Standard HTML5 Custom Element <lazy-image>
 * Works in plain HTML, React, Vue, Angular, Svelte, or any other framework!
 */
export class LazyImageElement extends BaseElement {
	private shadow!: ShadowRoot;
	private unobserve: (() => void) | null = null;
	private currentAttempt = 0;

	private wrapperEl!: HTMLElement;
	private placeholderEl!: HTMLImageElement | null;
	private mainImgEl!: HTMLImageElement;
	private overlayEl!: HTMLElement;

	static get observedAttributes(): string[] {
		return [
			'src',
			'alt',
			'placeholder',
			'aspect-ratio',
			'srcset',
			'sizes',
			'width',
			'height',
			'object-fit',
			'object-position',
			'root-margin',
			'threshold',
			'native',
			'fetchpriority',
			'decoding',
			'fade-duration',
			'blur',
			'background-color',
			'disable-loader',
			'disable-broken',
			'retry',
			'caption',
			'title'
		];
	}

	constructor() {
		super();
		if (typeof window !== 'undefined' && typeof this.attachShadow === 'function') {
			this.shadow = this.attachShadow({ mode: 'open' });
		}
	}

	connectedCallback(): void {
		this.render();
		const isNative = this.hasAttribute('native');
		if (isNative) {
			this.loadMainImage();
		} else {
			const rootMargin = this.getAttribute('root-margin') || '200px';
			const threshold = parseFloat(this.getAttribute('threshold') || '0.01');
			this.unobserve = observeElement(
				this,
				(entry) => {
					this.dispatchEvent(new CustomEvent('lazyintersect', { detail: { entry } }));
					this.loadMainImage();
				},
				{ rootMargin, threshold }
			);
		}
	}

	disconnectedCallback(): void {
		if (this.unobserve) {
			this.unobserve();
			this.unobserve = null;
		}
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		if (oldValue !== newValue && this.isConnected) {
			this.connectedCallback();
		}
	}

	private render(): void {
		const src = this.getAttribute('src') || '';
		const alt = this.getAttribute('alt') || '';
		const placeholder = this.getAttribute('placeholder');
		const aspectRatio = this.getAttribute('aspect-ratio');
		const width = this.getAttribute('width');
		const height = this.getAttribute('height');
		const objectFit = this.getAttribute('object-fit') || 'cover';
		const objectPosition = this.getAttribute('object-position') || 'center';
		const fadeDuration = this.getAttribute('fade-duration') || '300';
		const blur = this.getAttribute('blur') || '12';
		const backgroundColor = this.getAttribute('background-color') || '#c2c2c224';
		const disableLoader = this.hasAttribute('disable-loader');
		const decoding = this.getAttribute('decoding') || 'async';
		const fetchpriority = this.getAttribute('fetchpriority');
		const caption = this.getAttribute('caption');
		const isNative = this.hasAttribute('native');
		const srcset = this.getAttribute('srcset');
		const sizes = this.getAttribute('sizes');

		const styles = `
			:host {
				display: inline-block;
				width: 100%;
				position: relative;
				box-sizing: border-box;
			}
			.wrapper {
				position: relative;
				width: 100%;
				overflow: hidden;
				box-sizing: border-box;
				background-color: ${backgroundColor};
				${aspectRatio ? `aspect-ratio: ${aspectRatio};` : ''}
				${width ? `width: ${width.endsWith('px') || width.endsWith('%') ? width : width + 'px'};` : ''}
				${height ? `height: ${height.endsWith('px') || height.endsWith('%') ? height : height + 'px'};` : ''}
			}
			.main-img {
				display: block;
				width: 100%;
				height: 100%;
				object-fit: ${objectFit};
				object-position: ${objectPosition};
				opacity: 0;
				transition: opacity ${fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
				will-change: opacity;
			}
			.main-img.is-loaded {
				opacity: 1;
			}
			.placeholder-img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				object-fit: ${objectFit};
				object-position: ${objectPosition};
				filter: blur(${blur}px);
				transform: scale(1.06);
				transition: opacity ${fadeDuration}ms ease-out;
				pointer-events: none;
			}
			.placeholder-img.is-hidden {
				opacity: 0;
				visibility: hidden;
			}
			.overlay {
				position: absolute;
				inset: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				pointer-events: none;
				z-index: 2;
			}
			.overlay.interactive {
				pointer-events: auto;
			}
			.spinner-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 100%;
				color: #629aa9;
			}
			.lazy-image-spinner {
				width: 48px;
				height: 48px;
				animation: spin 1s linear infinite;
			}
			.lazy-image-spinner circle {
				stroke: currentColor;
				stroke-dasharray: 113.1 39.7;
				stroke-width: 4;
				fill: none;
			}
			@keyframes spin {
				to { transform: rotate(360deg); }
			}
			.broken-wrap {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				gap: 8px;
				padding: 16px;
				font-family: monospace;
				font-size: 11px;
				color: #4b5563;
				text-align: center;
			}
			.broken-icon {
				width: 40px;
				height: 40px;
				fill: currentColor;
				opacity: 0.65;
			}
			.retry-btn {
				margin-top: 4px;
				padding: 4px 10px;
				font-size: 11px;
				color: #fff;
				background-color: #629aa9;
				border: none;
				border-radius: 4px;
				cursor: pointer;
			}
			.caption {
				display: block;
				margin-top: 6px;
				font-size: 0.875rem;
				color: #4b5563;
			}
		`;

		this.shadow.innerHTML = `
			<style>${styles}</style>
			<div class="wrapper">
				${placeholder ? `<img class="placeholder-img" src="${placeholder}" alt="" aria-hidden="true" decoding="async" />` : ''}
				<div class="overlay">
					${!disableLoader ? `<slot name="loader"><div class="spinner-wrap">${SPINNER_SVG}</div></slot>` : ''}
				</div>
				<img class="main-img" alt="${alt}" ${isNative ? `loading="lazy" src="${src}"` : ''} ${srcset ? `srcset="${srcset}"` : ''} ${sizes ? `sizes="${sizes}"` : ''} decoding="${decoding}" ${fetchpriority ? `fetchpriority="${fetchpriority}"` : ''} />
			</div>
			${caption ? `<figcaption class="caption"><slot name="caption">${caption}</slot></figcaption>` : ''}
		`;

		this.wrapperEl = this.shadow.querySelector('.wrapper') as HTMLElement;
		this.placeholderEl = this.shadow.querySelector('.placeholder-img');
		this.mainImgEl = this.shadow.querySelector('.main-img') as HTMLImageElement;
		this.overlayEl = this.shadow.querySelector('.overlay') as HTMLElement;
	}

	private loadMainImage(): void {
		const src = this.getAttribute('src');
		if (!src || !this.mainImgEl) return;

		const img = new Image();
		const srcset = this.getAttribute('srcset');
		const sizes = this.getAttribute('sizes');
		if (srcset) img.srcset = srcset;
		if (sizes) img.sizes = sizes;
		img.src = src;

		img.onload = (e) => {
			this.mainImgEl.src = src;
			if (srcset) this.mainImgEl.srcset = srcset;
			if (sizes) this.mainImgEl.sizes = sizes;
			this.mainImgEl.classList.add('is-loaded');
			if (this.placeholderEl) {
				this.placeholderEl.classList.add('is-hidden');
			}
			if (this.overlayEl) {
				this.overlayEl.innerHTML = '';
			}
			this.dispatchEvent(new CustomEvent('lazyload', { detail: { event: e } }));
		};

		img.onerror = (e) => {
			const disableBroken = this.hasAttribute('disable-broken');
			const canRetry = this.hasAttribute('retry');
			if (this.overlayEl && !disableBroken) {
				this.overlayEl.classList.add('interactive');
				this.overlayEl.innerHTML = `
					<slot name="broken">
						<div class="broken-wrap">
							<div class="broken-icon">${BROKEN_SVG}</div>
							<span>Failed to load image</span>
							${canRetry ? `<button type="button" class="retry-btn">Retry</button>` : ''}
						</div>
					</slot>
				`;
				if (canRetry) {
					const btn = this.overlayEl.querySelector('.retry-btn');
					btn?.addEventListener('click', () => this.retry());
				}
			}
			this.dispatchEvent(new CustomEvent('lazyerror', { detail: { event: e } }));
		};
	}

	public retry(): void {
		this.currentAttempt++;
		this.dispatchEvent(new CustomEvent('lazyretry', { detail: { attempt: this.currentAttempt } }));
		const disableLoader = this.hasAttribute('disable-loader');
		if (this.overlayEl) {
			this.overlayEl.classList.remove('interactive');
			this.overlayEl.innerHTML = disableLoader
				? ''
				: `<slot name="loader"><div class="spinner-wrap">${SPINNER_SVG}</div></slot>`;
		}
		this.loadMainImage();
	}
}

/**
 * Register <lazy-image> custom element
 */
export function defineLazyImageElement(name = 'lazy-image'): void {
	if (typeof window !== 'undefined' && 'customElements' in window) {
		if (!customElements.get(name)) {
			customElements.define(name, LazyImageElement);
		}
	}
}

// Auto-register in browser environment
if (typeof window !== 'undefined') {
	defineLazyImageElement();
}
