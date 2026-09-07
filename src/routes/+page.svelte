<script lang="ts">
	import { onMount } from 'svelte';
	import { Image, lazyImage, createLazyImage } from '$lib/index.js';
	import '$lib/style.css';
	import '$lib/element/index.js';

	let activeTab = 'component';
	let retryCount = 0;
	let lastEvent = 'None';
	let vanillaContainer: HTMLDivElement;

	// Sample high-quality images with LQIP low-res placeholders
	const sampleImages = {
		landscape: {
			full: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
			lqip: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=40&q=20',
			alt: 'Panoramic mountain lake surrounded by pine forests',
			caption: 'Yosemite National Park, California',
			aspect: '16/9'
		},
		architecture: {
			full: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
			lqip: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=40&q=20',
			alt: 'Warm minimal architectural interior with sunbeam',
			caption: 'Minimalist living space design',
			aspect: '4/3'
		},
		broken: {
			full: 'https://invalid-domain-image-not-found.xyz/broken.jpg',
			alt: 'Failed image demonstration',
			aspect: '16/9'
		}
	};

	onMount(() => {
		if (vanillaContainer) {
			createLazyImage(vanillaContainer, {
				src: sampleImages.landscape.full,
				placeholder: sampleImages.landscape.lqip,
				alt: 'Vanilla JS Image Example',
				aspectRatio: '16/9',
				retry: true,
				schema: true,
				caption: 'Mounted using vanilla createLazyImage()',
				onLoad: () => (lastEvent = 'Vanilla JS: loaded'),
				onError: () => (lastEvent = 'Vanilla JS: error')
			});
		}
	});

	function handleComponentLoad(e: CustomEvent<{ event: Event }>) {
		lastEvent = `Component: loaded (${e.detail.event.type})`;
	}

	function handleComponentError() {
		lastEvent = 'Component: load failed (showing fallback UI)';
	}

	function handleComponentRetry(e: CustomEvent<{ attempt: number }>) {
		retryCount = e.detail.attempt;
		lastEvent = `Component: retry attempt #${retryCount}`;
	}
</script>

<svelte:head>
	<title>lazy-svelte-image 2.0 | Universal High-Performance Image Engine</title>
	<meta
		name="description"
		content="Universal lazy loading image library for Svelte 5/4/3, Vanilla JS, Web Components, and all modern frameworks. Built for maximum SEO and zero CLS."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="demo-page">
	<!-- Hero Header -->
	<header class="hero">
		<div class="badge-row">
			<span class="pill-badge accent">v2.0 Universal</span>
			<span class="pill-badge success">0 Vulnerabilities</span>
			<span class="pill-badge">Svelte 5 & 4 & 3 Ready</span>
			<span class="pill-badge">Web Components</span>
		</div>
		<h1 class="hero-title">
			<span class="gradient-text">lazy-svelte-image</span>
		</h1>
		<p class="hero-subtitle">
			High-performance, SEO-optimized image loader with blur-up LQIP, zero Cumulative Layout Shift
			(CLS), Schema.org JSON-LD, and universal support across Svelte, Vanilla JS, and all
			frameworks.
		</p>

		<!-- Event Feed Bar -->
		<div class="status-bar">
			<span class="status-dot"></span>
			<span class="status-label">Live Event:</span>
			<code class="status-value">{lastEvent}</code>
		</div>
	</header>

	<!-- Navigation Tabs -->
	<nav class="tabs-nav">
		<button
			class="tab-btn"
			class:active={activeTab === 'component'}
			on:click={() => (activeTab = 'component')}
		>
			<span class="tab-icon">⚡</span>
			Svelte Component
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'action'}
			on:click={() => (activeTab = 'action')}
		>
			<span class="tab-icon">🎯</span>
			Svelte Action
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'element'}
			on:click={() => (activeTab = 'element')}
		>
			<span class="tab-icon">🌐</span>
			Web Component
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'vanilla'}
			on:click={() => (activeTab = 'vanilla')}
		>
			<span class="tab-icon">🍦</span>
			Vanilla JS
		</button>
		<button class="tab-btn" class:active={activeTab === 'seo'} on:click={() => (activeTab = 'seo')}>
			<span class="tab-icon">🔍</span>
			SEO & Core Web Vitals
		</button>
	</nav>

	<!-- Tab 1: Svelte Component -->
	{#if activeTab === 'component'}
		<section class="section-grid">
			<div class="card">
				<div class="card-header">
					<span class="card-tag">Feature 1</span>
					<h2>Blur-Up LQIP & Aspect Ratio</h2>
					<p>
						Preserves 16:9 space beforehand (zero CLS) and transitions smoothly from low-res preview
						to full resolution.
					</p>
				</div>
				<div class="image-box">
					<Image
						src={sampleImages.landscape.full}
						placeholder={sampleImages.landscape.lqip}
						alt={sampleImages.landscape.alt}
						aspectRatio="16/9"
						caption={sampleImages.landscape.caption}
						schema={true}
						on:load={handleComponentLoad}
						on:error={handleComponentError}
					>
						<span slot="overlay" class="custom-badge">LQIP Smooth Blur</span>
					</Image>
				</div>
				<div class="code-snippet">
					<pre><code
							>&lt;Image
  src="image.jpg"
  placeholder="preview-lowres.jpg"
  aspectRatio="16/9"
  caption="Yosemite National Park"
  schema=&#123;true&#125;
/&gt;</code
						></pre>
				</div>
			</div>

			<div class="card">
				<div class="card-header">
					<span class="card-tag error-tag">Feature 2</span>
					<h2>Error Fallback & Interactive Retry</h2>
					<p>
						Gracefully falls back with SVG broken indicator, custom slots, and exponential retry
						capabilities.
					</p>
				</div>
				<div class="image-box">
					<Image
						src={sampleImages.broken.full}
						alt="Broken test image"
						aspectRatio="16/9"
						retry={true}
						maxRetries={3}
						on:load={handleComponentLoad}
						on:error={handleComponentError}
						on:retry={handleComponentRetry}
					/>
				</div>
				<div class="code-snippet">
					<pre><code
							>&lt;Image
  src="invalid-image-url.jpg"
  aspectRatio="16/9"
  retry=&#123;true&#125;
  maxRetries=&#123;3&#125;
  on:retry=&#123;handleRetry&#125;
/&gt;</code
						></pre>
				</div>
			</div>
		</section>
	{/if}

	<!-- Tab 2: Svelte Action -->
	{#if activeTab === 'action'}
		<section class="section-grid single-col">
			<div class="card">
				<div class="card-header">
					<span class="card-tag">use:lazyImage Directive</span>
					<h2>Zero DOM Wrapper Svelte Action</h2>
					<p>
						Directly attach lazy-loading to standard HTML <code>&lt;img&gt;</code> elements across Svelte
						3, 4, and 5.
					</p>
				</div>
				<div class="image-box bounded">
					<img
						use:lazyImage={{
							src: sampleImages.architecture.full,
							placeholder: sampleImages.architecture.lqip,
							fadeDuration: 400,
							onLoad: () => (lastEvent = 'Action: image loaded')
						}}
						alt={sampleImages.architecture.alt}
						class="action-styled-img"
					/>
				</div>
				<div class="code-snippet">
					<pre><code
							>&lt;script&gt;
  import &#123; lazyImage &#125; from 'lazy-svelte-image';
&lt;/script&gt;

&lt;img
  use:lazyImage=&#123;&#123;
    src: 'architecture.jpg',
    placeholder: 'thumb.jpg'
  &#125;&#125;
  alt="Living Room"
/&gt;</code
						></pre>
				</div>
			</div>
		</section>
	{/if}

	<!-- Tab 3: HTML5 Web Component -->
	{#if activeTab === 'element'}
		<section class="section-grid single-col">
			<div class="card">
				<div class="card-header">
					<span class="card-tag success-tag">Cross-Framework Standard</span>
					<h2>&lt;lazy-image&gt; Custom Element</h2>
					<p>
						Runs natively in React, Vue, Angular, Solid, or plain static HTML with Shadow DOM
						isolation and slots.
					</p>
				</div>
				<div class="image-box bounded">
					<lazy-image
						src={sampleImages.landscape.full}
						placeholder={sampleImages.landscape.lqip}
						alt="Web Component Demo"
						aspect-ratio="16/9"
						caption="Rendered via HTML5 <lazy-image> Custom Element"
					></lazy-image>
				</div>
				<div class="code-snippet">
					<pre><code
							>&lt;!-- Plain HTML or any framework --&gt;
&lt;script type="module" src="lazy-svelte-image/element"&gt;&lt;/script&gt;

&lt;lazy-image
  src="landscape.jpg"
  placeholder="thumb.jpg"
  aspect-ratio="16/9"
  caption="Natural vista"
&gt;&lt;/lazy-image&gt;</code
						></pre>
				</div>
			</div>
		</section>
	{/if}

	<!-- Tab 4: Vanilla JavaScript -->
	{#if activeTab === 'vanilla'}
		<section class="section-grid single-col">
			<div class="card">
				<div class="card-header">
					<span class="card-tag">Framework-Agnostic</span>
					<h2>Imperative Vanilla JS Engine</h2>
					<p>
						Instantiate dynamic lazy-loading on any DOM element with the <code>LazyImage</code>
						class or helper.
					</p>
				</div>
				<div class="image-box bounded">
					<div bind:this={vanillaContainer}></div>
				</div>
				<div class="code-snippet">
					<pre><code
							>import &#123; createLazyImage &#125; from 'lazy-svelte-image/vanilla';

createLazyImage('#my-container', &#123;
  src: 'landscape.jpg',
  placeholder: 'thumb.jpg',
  aspectRatio: '16/9',
  schema: true,
  retry: true
&#125;);</code
						></pre>
				</div>
			</div>
		</section>
	{/if}

	<!-- Tab 5: SEO Inspector -->
	{#if activeTab === 'seo'}
		<section class="section-grid">
			<div class="card">
				<div class="card-header">
					<span class="card-tag success-tag">Googlebot & Web Crawlers</span>
					<h2>SSR Crawler Fallback (&lt;noscript&gt;)</h2>
					<p>
						Ensures search engine indexing bots immediately discover image sources and alt tags,
						even without JavaScript execution.
					</p>
				</div>
				<div class="info-callout">
					<strong>Why this is critical:</strong>
					In previous versions, images were rendered inside client-side
					<code>onMount</code>, outputting only a spinner during SSR. Crawlers indexed zero images!
					Version 2.0 ensures full crawlability.
				</div>
				<div class="code-snippet">
					<pre><code
							>&lt;!-- Generated SSR Fallback --&gt;
&lt;noscript&gt;
  &lt;img
    src="https://.../photo.jpg"
    alt="Panoramic mountain lake"
    loading="lazy"
  /&gt;
&lt;/noscript&gt;</code
						></pre>
				</div>
			</div>

			<div class="card">
				<div class="card-header">
					<span class="card-tag">Search Engine Structured Data</span>
					<h2>Schema.org ImageObject JSON-LD</h2>
					<p>
						Automatically injects Google-compliant structured data for enhanced Google Images and
						rich preview cards.
					</p>
				</div>
				<div class="code-snippet">
					<pre><code
							>&#123;
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "contentUrl": "https://.../photo.jpg",
  "url": "https://.../photo.jpg",
  "name": "Panoramic mountain lake...",
  "description": "Yosemite National Park, California"
&#125;</code
						></pre>
				</div>
				<div class="features-list">
					<div class="feature-item">
						<span class="check-icon">✓</span>
						<span
							><strong>Zero CLS:</strong> CSS <code>aspect-ratio</code> eliminates layout shifts</span
						>
					</div>
					<div class="feature-item">
						<span class="check-icon">✓</span>
						<span
							><strong>Next-Gen Formats:</strong> <code>&lt;picture&gt;</code> source fallbacks (AVIF/WebP)</span
						>
					</div>
					<div class="feature-item">
						<span class="check-icon">✓</span>
						<span
							><strong>LCP Acceleration:</strong> <code>fetchpriority="high"</code> option for hero images</span
						>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Footer -->
	<footer class="demo-footer">
		<div class="footer-links">
			<a
				href="https://github.com/rishabharidas/lazy-svelte-image"
				target="_blank"
				rel="noreferrer"
				class="footer-link"
			>
				GitHub Repository ↗
			</a>
			<a
				href="https://www.npmjs.com/package/lazy-svelte-image"
				target="_blank"
				rel="noreferrer"
				class="footer-link"
			>
				npm Package ↗
			</a>
		</div>
		<p class="footer-note">
			Updated to Svelte 5 with backwards compatibility (Svelte 3/4), 0 security vulnerabilities, and
			universal framework support.
		</p>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			'Plus Jakarta Sans',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		background: #090d16;
		color: #f1f5f9;
		-webkit-font-smoothing: antialiased;
	}

	.demo-page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 48px 24px;
		box-sizing: border-box;
	}

	/* Hero */
	.hero {
		text-align: center;
		margin-bottom: 40px;
	}

	.badge-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		margin-bottom: 20px;
	}

	.pill-badge {
		display: inline-flex;
		align-items: center;
		padding: 4px 12px;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.08);
		color: #cbd5e1;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.pill-badge.accent {
		background: rgba(98, 154, 169, 0.2);
		color: #8ed0df;
		border-color: rgba(98, 154, 169, 0.4);
	}

	.pill-badge.success {
		background: rgba(34, 197, 94, 0.15);
		color: #4ade80;
		border-color: rgba(34, 197, 94, 0.3);
	}

	.hero-title {
		font-size: clamp(2.2rem, 5vw, 3.5rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 16px 0;
		line-height: 1.1;
	}

	.gradient-text {
		background: linear-gradient(135deg, #ffffff 0%, #8ed0df 50%, #629aa9 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-subtitle {
		max-width: 680px;
		margin: 0 auto 24px auto;
		font-size: 1.05rem;
		line-height: 1.6;
		color: #94a3b8;
	}

	/* Status Bar */
	.status-bar {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 8px 18px;
		background: rgba(15, 23, 42, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 9999px;
		font-size: 0.85rem;
		backdrop-filter: blur(8px);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background: #22c55e;
		border-radius: 50%;
		box-shadow: 0 0 8px #22c55e;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.status-label {
		color: #64748b;
		font-weight: 600;
	}

	.status-value {
		font-family: 'JetBrains Mono', monospace;
		color: #8ed0df;
		font-size: 0.8rem;
	}

	/* Navigation Tabs */
	.tabs-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		margin-bottom: 32px;
		padding: 6px;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
	}

	.tab-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		background: transparent;
		color: #94a3b8;
		border: none;
		border-radius: 10px;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tab-btn:hover {
		color: #f1f5f9;
		background: rgba(255, 255, 255, 0.05);
	}

	.tab-btn.active {
		background: #629aa9;
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(98, 154, 169, 0.35);
	}

	/* Grid & Cards */
	.section-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 24px;
		margin-bottom: 48px;
	}

	.section-grid.single-col {
		grid-template-columns: 1fr;
		max-width: 720px;
		margin-left: auto;
		margin-right: auto;
	}

	.card {
		background: rgba(15, 23, 42, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 18px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
		backdrop-filter: blur(12px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
	}

	.card-header h2 {
		margin: 8px 0 6px 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #f8fafc;
	}

	.card-header p {
		margin: 0;
		font-size: 0.88rem;
		line-height: 1.5;
		color: #94a3b8;
	}

	.card-tag {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #8ed0df;
	}

	.card-tag.error-tag {
		color: #f87171;
	}

	.card-tag.success-tag {
		color: #4ade80;
	}

	.image-box {
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: #0f172a;
	}

	.image-box.bounded {
		max-height: 420px;
	}

	.custom-badge {
		position: absolute;
		bottom: 12px;
		right: 12px;
		padding: 4px 10px;
		background: rgba(0, 0, 0, 0.7);
		color: #8ed0df;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 6px;
		backdrop-filter: blur(4px);
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	.action-styled-img {
		display: block;
		width: 100%;
		aspect-ratio: 4/3;
		object-fit: cover;
	}

	.code-snippet {
		background: #070b13;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		padding: 14px;
		overflow-x: auto;
	}

	.code-snippet pre {
		margin: 0;
	}

	.code-snippet code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.82rem;
		color: #cbd5e1;
		line-height: 1.5;
	}

	.info-callout {
		padding: 14px;
		background: rgba(98, 154, 169, 0.12);
		border-left: 3px solid #629aa9;
		border-radius: 6px;
		font-size: 0.85rem;
		line-height: 1.5;
		color: #cbd5e1;
	}

	.features-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 6px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.875rem;
		color: #cbd5e1;
	}

	.check-icon {
		color: #4ade80;
		font-weight: bold;
	}

	/* Footer */
	.demo-footer {
		text-align: center;
		padding-top: 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.footer-links {
		display: flex;
		justify-content: center;
		gap: 20px;
		margin-bottom: 12px;
	}

	.footer-link {
		color: #8ed0df;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.footer-link:hover {
		color: #ffffff;
		text-decoration: underline;
	}

	.footer-note {
		margin: 0;
		font-size: 0.8rem;
		color: #64748b;
	}
</style>
