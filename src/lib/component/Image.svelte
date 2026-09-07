<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { PictureSource } from '../types.js';
	import { observeElement, createImageSchema } from '../vanilla/index.js';

	// Backwards-compatible props (v1.1.2)
	export let src: string;
	export let alt: string = '';
	export let backgroundColor: string = '#c2c2c224';
	export let disableLoader: boolean = false;
	export let disabeLoader: boolean = false; // Original typo alias
	export let disableBroken: boolean = false;

	// Enhanced SEO & performance props
	export let placeholder: string | undefined = undefined;
	export let aspectRatio: string | number | undefined = undefined;
	export let width: string | number | undefined = undefined;
	export let height: string | number | undefined = undefined;
	export let srcset: string | undefined = undefined;
	export let sizes: string | undefined = undefined;
	export let sources: PictureSource[] = [];
	export let objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' = 'cover';
	export let objectPosition: string = 'center';
	export let rootMargin: string = '200px';
	export let threshold: number | number[] = 0.01;
	export let native: boolean = false;
	export let fetchpriority: 'high' | 'low' | 'auto' | undefined = undefined;
	export let decoding: 'async' | 'sync' | 'auto' = 'async';
	export let fadeDuration: number = 300;
	export let blur: number = 12;
	export let retry: boolean = false;
	export let maxRetries: number = 2;
	export let caption: string | undefined = undefined;
	export let title: string | undefined = undefined;
	export let schema: boolean | Record<string, unknown> = false;

	const dispatch = createEventDispatcher<{
		load: { event: Event };
		error: { event: Event };
		intersect: { entry: IntersectionObserverEntry };
		retry: { attempt: number };
	}>();

	let containerEl: HTMLElement;
	let loaded: boolean = false;
	let failed: boolean = false;
	let loading: boolean = true;
	let currentSrc: string = '';
	let currentSrcset: string | undefined = undefined;
	let currentAttempt: number = 0;
	let unobserve: (() => void) | null = null;

	$: effectiveDisableLoader = disableLoader || disabeLoader;
	$: schemaJson = schema ? createImageSchema({ src, alt, width, height, caption, schema }) : '';

	function startLoading() {
		loading = true;
		failed = false;

		const img = new Image();
		if (srcset) img.srcset = srcset;
		if (sizes) img.sizes = sizes;
		img.src = src;

		img.onload = (e) => {
			loading = false;
			loaded = true;
			failed = false;
			currentSrc = src;
			currentSrcset = srcset;
			dispatch('load', { event: e });
		};

		img.onerror = (e) => {
			loading = false;
			failed = true;
			dispatch('error', { event: e as Event });
		};
	}

	export function handleRetry() {
		currentAttempt++;
		dispatch('retry', { attempt: currentAttempt });
		startLoading();
	}

	onMount(() => {
		if (native) {
			startLoading();
		} else {
			unobserve = observeElement(
				containerEl,
				(entry) => {
					dispatch('intersect', { entry });
					startLoading();
				},
				{ rootMargin, threshold }
			);
		}

		return () => {
			if (unobserve) {
				unobserve();
				unobserve = null;
			}
		};
	});
</script>

<figure class="lazy-image-figure">
	<div
		bind:this={containerEl}
		class="lazy-image-container"
		style="
			--lazy-bg: {backgroundColor};
			--lazy-fade: {fadeDuration}ms;
			--lazy-blur: {blur}px;
			--lazy-fit: {objectFit};
			--lazy-pos: {objectPosition};
			{aspectRatio ? `aspect-ratio: ${aspectRatio};` : ''}
			{width ? `width: ${typeof width === 'number' ? width + 'px' : width};` : ''}
			{height ? `height: ${typeof height === 'number' ? height + 'px' : height};` : ''}
		"
		data-loaded={loaded}
		data-failed={failed}
	>
		<!-- LQIP Blur-up placeholder -->
		{#if placeholder}
			<img
				src={placeholder}
				alt=""
				aria-hidden="true"
				class="placeholder-img"
				class:is-hidden={loaded}
				decoding="async"
			/>
		{/if}

		<!-- Active Picture or Image -->
		{#if sources && sources.length > 0}
			<picture class="main-picture">
				{#each sources as s, index (s.srcset + index)}
					<source srcset={loaded ? s.srcset : ''} type={s.type} media={s.media} sizes={s.sizes} />
				{/each}
				<img
					{...$$restProps}
					src={loaded ? currentSrc : native ? src : ''}
					srcset={loaded ? currentSrcset : native ? srcset : ''}
					{sizes}
					{alt}
					{title}
					{width}
					{height}
					{decoding}
					{fetchpriority}
					class="main-img"
					class:is-loaded={loaded}
					loading={native ? 'lazy' : undefined}
				/>
			</picture>
		{:else}
			<img
				{...$$restProps}
				src={loaded ? currentSrc : native ? src : ''}
				srcset={loaded ? currentSrcset : native ? srcset : ''}
				{sizes}
				{alt}
				{title}
				{width}
				{height}
				{decoding}
				{fetchpriority}
				class="main-img"
				class:is-loaded={loaded}
				loading={native ? 'lazy' : undefined}
			/>
		{/if}

		<!-- SEO Crawler Fallback: Guarantees Googlebot / crawlers without JS find the image -->
		<noscript>
			<img
				{...$$restProps}
				{src}
				{alt}
				{title}
				{width}
				{height}
				class="noscript-img"
				loading="lazy"
			/>
		</noscript>

		<!-- Overlay Slot / Elements (Loader & Error States) -->
		{#if failed && !disableBroken}
			<div class="overlay-container interactive">
				{#if $$slots.broken}
					<slot name="broken" />
				{:else}
					<div class="broken-view">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 640 512"
							class="lazy-image-broken-svg"
						>
							<path
								fill="currentColor"
								d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L489.3 358.2l90.5-90.5c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114l-96 96-31.9-25C430.9 239.6 420.1 175.1 377 132c-52.2-52.3-134.5-56.2-191.3-11.7L38.8 5.1zM239 162c30.1-14.9 67.7-9.9 92.8 15.3c20 20 27.5 48.3 21.7 74.5L239 162zM116.6 187.9L60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5l61.8-61.8-50.6-39.9zM220.9 270c-2.1 39.8 12.2 80.1 42.2 110c38.9 38.9 94.4 51 143.6 36.3L220.9 270z"
							/>
						</svg>
						<span>Not Found</span>
						{#if retry && currentAttempt < maxRetries}
							<button type="button" class="retry-btn" on:click={handleRetry}>Retry</button>
						{/if}
					</div>
				{/if}
			</div>
		{:else if loading && !effectiveDisableLoader && !loaded}
			<div class="overlay-container">
				{#if $$slots.loader}
					<slot name="loader" />
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 100 100"
						preserveAspectRatio="xMidYMid"
						width="64"
						height="64"
						class="lazy-image-spinner"
					>
						<g>
							<circle
								stroke-dasharray="113.09733552923255 39.69911184307752"
								r="24"
								stroke-width="4"
								stroke="#629aa9"
								fill="none"
								cy="50"
								cx="50"
							>
								<animateTransform
									keyTimes="0;1"
									values="0 50 50;360 50 50"
									dur="1s"
									repeatCount="indefinite"
									type="rotate"
									attributeName="transform"
								></animateTransform>
							</circle>
						</g>
					</svg>
				{/if}
			</div>
		{/if}

		<!-- Custom Overlay Slot (badges, watermarks, controls) -->
		{#if $$slots.overlay}
			<div class="overlay-container interactive">
				<slot name="overlay" />
			</div>
		{/if}

		<!-- Optional Default Slot -->
		<slot />
	</div>

	<!-- Optional SEO Caption -->
	{#if caption || $$slots.caption}
		<figcaption class="lazy-caption">
			<slot name="caption">{caption}</slot>
		</figcaption>
	{/if}
</figure>

<!-- SEO Schema.org JSON-LD Structured Data Injection -->
{#if schema && schemaJson}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + schemaJson + '</' + 'script>'}
{/if}

<style>
	.lazy-image-figure {
		margin: 0;
		padding: 0;
		display: block;
		width: 100%;
	}

	.lazy-image-container {
		position: relative;
		display: inline-block;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		background-color: var(--lazy-bg, #c2c2c224);
	}

	.main-picture {
		display: contents;
	}

	.main-img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: var(--lazy-fit, cover);
		object-position: var(--lazy-pos, center);
		opacity: 0;
		transition: opacity var(--lazy-fade, 300ms) cubic-bezier(0.4, 0, 0.2, 1);
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
		object-fit: var(--lazy-fit, cover);
		object-position: var(--lazy-pos, center);
		filter: blur(var(--lazy-blur, 12px));
		transform: scale(1.06);
		transition:
			opacity var(--lazy-fade, 300ms) ease-out,
			visibility 0s linear var(--lazy-fade, 300ms);
		pointer-events: none;
		opacity: 1;
	}

	.placeholder-img.is-hidden {
		opacity: 0;
		visibility: hidden;
	}

	.noscript-img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: var(--lazy-fit, cover);
	}

	.overlay-container {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 2;
	}

	.overlay-container.interactive {
		pointer-events: auto;
	}

	.broken-view {
		width: 5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 11px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		text-align: center;
		color: #4b5563;
	}

	:global(.lazy-image-broken-svg) {
		width: 38px;
		height: 38px;
		opacity: 0.65;
	}

	.retry-btn {
		padding: 4px 10px;
		font-size: 11px;
		font-family: inherit;
		color: #ffffff;
		background-color: #629aa9;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			transform 0.1s ease;
	}

	.retry-btn:hover {
		opacity: 0.9;
		transform: scale(1.02);
	}

	.lazy-caption {
		display: block;
		margin-top: 6px;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #4b5563;
	}
</style>
