export interface PictureSource {
	srcset: string;
	type?: string;
	media?: string;
	sizes?: string;
}

export interface LazyImageOptions {
	src: string;
	alt?: string;
	placeholder?: string;
	aspectRatio?: string | number;
	srcset?: string;
	sizes?: string;
	sources?: PictureSource[];
	width?: string | number;
	height?: string | number;
	objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
	objectPosition?: string;
	rootMargin?: string;
	threshold?: number | number[];
	native?: boolean;
	fetchpriority?: 'high' | 'low' | 'auto';
	decoding?: 'async' | 'sync' | 'auto';
	fadeDuration?: number;
	blur?: number;
	backgroundColor?: string;
	disableLoader?: boolean;
	disabeLoader?: boolean; // Backward compatibility with v1.1.2 typo
	disableBroken?: boolean;
	retry?: boolean;
	maxRetries?: number;
	schema?: boolean | Record<string, unknown>;
	caption?: string;
	title?: string;
	onLoad?: (event: Event) => void;
	onError?: (event: Event) => void;
	onIntersect?: (entry: IntersectionObserverEntry) => void;
	onRetry?: (attempt: number) => void;
}

export type LazyImageState = 'idle' | 'loading' | 'loaded' | 'error';
