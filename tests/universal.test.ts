import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createImageSchema } from '../dist/vanilla/index.js';
import type { LazyImageOptions } from '../dist/types.js';

describe('lazy-svelte-image Universal & SEO tests', () => {
	test('createImageSchema generates valid Google-compliant JSON-LD ImageObject', () => {
		const opts: LazyImageOptions = {
			src: 'https://example.com/photo.jpg',
			alt: 'Scenic mountain landscape',
			caption: 'Beautiful Rocky Mountains during sunrise',
			width: 1920,
			height: 1080
		};

		const json = createImageSchema(opts);
		const parsed = JSON.parse(json);

		assert.equal(parsed['@context'], 'https://schema.org');
		assert.equal(parsed['@type'], 'ImageObject');
		assert.equal(parsed.contentUrl, 'https://example.com/photo.jpg');
		assert.equal(parsed.name, 'Scenic mountain landscape');
		assert.equal(parsed.description, 'Scenic mountain landscape');
		assert.equal(parsed.caption, 'Beautiful Rocky Mountains during sunrise');
		assert.equal(parsed.width, '1920');
		assert.equal(parsed.height, '1080');
	});

	test('createImageSchema supports custom schema overrides', () => {
		const opts: LazyImageOptions = {
			src: 'https://example.com/art.png',
			schema: {
				author: {
					'@type': 'Person',
					name: 'Jane Doe'
				},
				license: 'https://creativecommons.org/licenses/by/4.0/'
			}
		};

		const json = createImageSchema(opts);
		const parsed = JSON.parse(json);

		assert.equal(parsed.author.name, 'Jane Doe');
		assert.equal(parsed.license, 'https://creativecommons.org/licenses/by/4.0/');
	});

	test('Vanilla and Action exports are loadable in standard JS environments', async () => {
		const vanilla = await import('../dist/vanilla/index.js');
		assert.ok(vanilla.LazyImage, 'LazyImage vanilla class should be exported');
		assert.ok(vanilla.createLazyImage, 'createLazyImage helper should be exported');
		assert.ok(vanilla.createImageSchema, 'createImageSchema should be exported');
		assert.ok(vanilla.SPINNER_SVG, 'SPINNER_SVG should be exported');
		assert.ok(vanilla.BROKEN_SVG, 'BROKEN_SVG should be exported');

		const action = await import('../dist/action/index.js');
		assert.ok(action.lazyImage, 'lazyImage action should be exported');
	});
});
