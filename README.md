# lazy-svelte-image ⚡

[![npm version](https://img.shields.io/npm/v/lazy-svelte-image.svg)](https://www.npmjs.com/package/lazy-svelte-image)
[![license](https://img.shields.io/npm/l/lazy-svelte-image.svg)](https://github.com/rishabharidas/lazy-svelte-image/blob/main/LICENSE)
[![svelte](https://img.shields.io/badge/svelte-5%20%7C%204%20%7C%203-FF3E00.svg)](https://svelte.dev)
[![vulnerabilities](https://img.shields.io/badge/vulnerabilities-0-brightgreen.svg)](https://github.com/rishabharidas/lazy-svelte-image)
[![Universal JS](https://img.shields.io/badge/Vanilla%20JS%20%26%20Web%20Component-supported-blue.svg)](https://github.com/rishabharidas/lazy-svelte-image)

A high-performance, SEO-optimized, **universal** image loading library for **Svelte 5, 4, 3**, **Vanilla JavaScript**, and **all modern frameworks (React, Vue, Angular, Solid)** via HTML5 Web Components or standalone CDN `<script>`.

---

## 🌟 Highlights

- ⚡ **Universal & Framework-Agnostic**: Works as a Svelte component, Svelte action (`use:lazyImage`), HTML5 Web Component (`<lazy-image>`), Vanilla JS class (`LazyImage`), or direct CDN script tag.
- 🚀 **Svelte 5 & Backwards Compatible**: Runs natively on the latest Svelte 5 as well as Svelte 4 and Svelte 3.
- 🔒 **Zero Vulnerabilities**: Completely modernized dependency tree with 0 security advisories.
- 🔍 **SEO & Core Web Vitals Optimized**:
  - **SSR & Crawler Indexing**: Googlebot, Bing, Pinterest, and social crawlers discover images immediately on initial page load via SSR-friendly rendering and automatic `<noscript>` fallbacks.
  - **Zero Cumulative Layout Shift (CLS)**: Built-in `aspectRatio` space reservation prevents jarring content shifts.
  - **Schema.org Structured Data**: Automatic Google-compliant `ImageObject` JSON-LD generation for image search previews.
  - **LCP Optimization**: Supports `fetchpriority="high" | "low"` and `decoding="async"`.
- 🎨 **Blur-Up LQIP**: Low-Quality Image Placeholder support with smooth, customizable blur transitions.
- 🔁 **Error Recovery & Retries**: Built-in broken image indicator with customizable slots and interactive retry button.
- 📦 **Zero-Config CDN**: Drop-in `<script>` tag for WordPress, PHP, Hugo, or plain HTML websites.

---

## 📦 Installation

```bash
npm install lazy-svelte-image
```

_(Note: Svelte is an optional peer dependency. You can install this package in Vanilla JS or React/Vue projects without peer dependency warnings!)_

---

## 🚀 Quick Start

### 1. Svelte Component

```svelte
<script>
	import { Image } from 'lazy-svelte-image';
</script>

<!-- High-performance image with blur-up LQIP and zero CLS -->
<Image
	src="https://images.example.com/landscape.jpg"
	placeholder="https://images.example.com/landscape-thumb.jpg"
	alt="Majestic mountain lake at sunrise"
	aspectRatio="16/9"
	caption="Rocky Mountains, Colorado"
	schema={true}
/>
```

#### With Custom Slots and Error Retry:

```svelte
<Image src="/path/to/image.jpg" aspectRatio="4/3" retry={true} maxRetries={3}>
	<!-- Custom spinner -->
	<div slot="loader" class="my-custom-spinner">Loading...</div>

	<!-- Custom broken state -->
	<div slot="broken" class="my-custom-error">
		<span>Oops! Image could not be loaded.</span>
	</div>

	<!-- Custom overlay watermark or badge -->
	<span slot="overlay" class="badge">PRO</span>
</Image>
```

---

### 2. Svelte Action (`use:lazyImage`)

For minimalists who want zero wrapper elements around a native `<img>`:

```svelte
<script>
	import { lazyImage } from 'lazy-svelte-image';
</script>

<img
	use:lazyImage={{
		src: 'https://images.example.com/photo.jpg',
		placeholder: 'https://images.example.com/photo-thumb.jpg',
		rootMargin: '200px'
	}}
	alt="Modern living room interior"
	style="aspect-ratio: 16/9; width: 100%; object-fit: cover;"
/>
```

---

### 3. HTML5 Web Component (`<lazy-image>`)

Works in **React**, **Vue**, **Angular**, **Solid**, or plain HTML without requiring any Svelte runtime!

```html
<!-- Import the web component -->
<script type="module">
	import 'lazy-svelte-image/element';
</script>

<lazy-image
	src="https://images.example.com/nature.jpg"
	placeholder="https://images.example.com/nature-thumb.jpg"
	alt="Autumn forest path"
	aspect-ratio="16/9"
	caption="Autumn foliage"
	retry
></lazy-image>
```

---

### 4. Vanilla JavaScript

Framework-free imperative API:

```javascript
import { createLazyImage } from 'lazy-svelte-image/vanilla';
import 'lazy-svelte-image/style.css';

const imageInstance = createLazyImage('#my-image-container', {
	src: 'https://images.example.com/hero.jpg',
	placeholder: 'https://images.example.com/hero-lqip.jpg',
	alt: 'Hero banner',
	aspectRatio: '16/9',
	schema: true,
	retry: true,
	onLoad: (event) => console.log('Image loaded!', event),
	onError: (error) => console.error('Image failed', error)
});
```

---

### 5. Global CDN Usage (No bundler required)

Add directly to any traditional website (WordPress, PHP, Shopify, plain HTML):

```html
<!-- Include stylesheet and script -->
<link rel="stylesheet" href="https://unpkg.com/lazy-svelte-image/dist/style.css" />
<script src="https://unpkg.com/lazy-svelte-image/dist/browser.global.js"></script>

<!-- Use the custom element immediately -->
<lazy-image
	src="https://images.example.com/photo.jpg"
	aspect-ratio="16/9"
	alt="Example image"
></lazy-image>
```

---

## 🔍 SEO & Core Web Vitals Guide

### 1. Cumulative Layout Shift (CLS = 0)

When an image doesn't have an explicit size or aspect ratio, the browser cannot reserve vertical space while loading, causing the page content to jump when the image renders.
By specifying `aspectRatio="16/9"` or `aspectRatio="4/3"`, `lazy-svelte-image` enforces CSS aspect-ratio on the container before the image arrives, ensuring **zero layout shift**.

### 2. SSR & Search Engine Indexing

Older lazy loaders hide the `<img>` element during SSR until hydration `onMount`, resulting in web crawlers indexing nothing.
`lazy-svelte-image` outputs:

1. Crawler-friendly attributes on initial HTML render.
2. An automatic `<noscript><img src="..." alt="..." /></noscript>` block ensuring 100% indexing even if JavaScript execution is delayed or disabled.

### 3. Schema.org Structured Data

Setting `schema={true}` automatically injects Google-compliant `ImageObject` JSON-LD metadata into the page for enhanced Google Images visibility:

```json
{
	"@context": "https://schema.org",
	"@type": "ImageObject",
	"contentUrl": "https://images.example.com/photo.jpg",
	"url": "https://images.example.com/photo.jpg",
	"name": "Alt description",
	"description": "Caption or Alt text",
	"width": "1920",
	"height": "1080"
}
```

---

## 🛠️ API Reference

### Component Props (`<Image />`)

| Prop              | Type                                                       | Default       | Description                                                       |
| :---------------- | :--------------------------------------------------------- | :------------ | :---------------------------------------------------------------- |
| `src`             | `string`                                                   | _(Required)_  | URL of the high-resolution image                                  |
| `alt`             | `string`                                                   | `''`          | Descriptive alternative text for accessibility and SEO            |
| `placeholder`     | `string`                                                   | `undefined`   | Low-resolution image or data URI for LQIP blur-up                 |
| `aspectRatio`     | `string \| number`                                         | `undefined`   | CSS aspect ratio (e.g. `'16/9'`, `'4/3'`, `'1/1'`) to prevent CLS |
| `width`           | `string \| number`                                         | `undefined`   | Width of the image container                                      |
| `height`          | `string \| number`                                         | `undefined`   | Height of the image container                                     |
| `srcset`          | `string`                                                   | `undefined`   | Responsive image candidates (`srcset`)                            |
| `sizes`           | `string`                                                   | `undefined`   | Responsive image sizes rule (`sizes`)                             |
| `sources`         | `PictureSource[]`                                          | `[]`          | Array of source definitions for `<picture>` elements              |
| `objectFit`       | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'`     | CSS `object-fit` property                                         |
| `objectPosition`  | `string`                                                   | `'center'`    | CSS `object-position` property                                    |
| `rootMargin`      | `string`                                                   | `'200px'`     | Preload margin for `IntersectionObserver`                         |
| `threshold`       | `number \| number[]`                                       | `0.01`        | Intersection threshold                                            |
| `native`          | `boolean`                                                  | `false`       | Use browser's native `loading="lazy"`                             |
| `fetchpriority`   | `'high' \| 'low' \| 'auto'`                                | `undefined`   | Resource priority hint (useful for LCP images)                    |
| `decoding`        | `'async' \| 'sync' \| 'auto'`                              | `'async'`     | Image decoding mode                                               |
| `fadeDuration`    | `number`                                                   | `300`         | Fade-in transition duration in milliseconds                       |
| `blur`            | `number`                                                   | `12`          | Blur radius in pixels for the LQIP placeholder                    |
| `backgroundColor` | `string`                                                   | `'#c2c2c224'` | Placeholder background color                                      |
| `disableLoader`   | `boolean`                                                  | `false`       | Disable the loading spinner                                       |
| `disabeLoader`    | `boolean`                                                  | `false`       | Backward-compatible alias for `disableLoader`                     |
| `disableBroken`   | `boolean`                                                  | `false`       | Disable broken image fallback view                                |
| `retry`           | `boolean`                                                  | `false`       | Display retry button on failure                                   |
| `maxRetries`      | `number`                                                   | `2`           | Maximum retry attempts                                            |
| `caption`         | `string`                                                   | `undefined`   | Optional figure caption                                           |
| `title`           | `string`                                                   | `undefined`   | Image title attribute                                             |
| `schema`          | `boolean \| object`                                        | `false`       | Generate Schema.org `ImageObject` JSON-LD                         |

### Slots

| Slot Name | Description                                              |
| :-------- | :------------------------------------------------------- |
| `loader`  | Custom loading indicator / spinner                       |
| `broken`  | Custom broken image fallback UI                          |
| `overlay` | Custom overlay element (e.g. badge, watermark, controls) |
| `caption` | Custom caption markup inside `<figcaption>`              |

### Events

| Event       | Detail                                 | Description                                               |
| :---------- | :------------------------------------- | :-------------------------------------------------------- |
| `load`      | `{ event: Event }`                     | Fired when the high-resolution image has finished loading |
| `error`     | `{ event: Event }`                     | Fired when the image fails to load                        |
| `intersect` | `{ entry: IntersectionObserverEntry }` | Fired when the image enters the observer viewport         |
| `retry`     | `{ attempt: number }`                  | Fired when a retry attempt is triggered                   |

---

## 🔄 Backward Compatibility with v1.x

This version is **100% backward compatible** with `lazy-svelte-image` v1.1.2:

- Existing props `src`, `alt`, `backgroundColor`, `disableLoader`, `disabeLoader` (original typo alias), and `disableBroken` are fully supported.
- Existing slots `slot="loader"` and `slot="broken"` work without any code changes.
- Existing projects upgrading from Svelte 4 to Svelte 5 will work without modifications.

---

## 📄 License

MIT © [Rishabh Haridas](https://github.com/rishabharidas)
