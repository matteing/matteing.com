import assert from "node:assert/strict";
import { createRequire, registerHooks } from "node:module";
import test from "node:test";
import sharp from "sharp";
import { getDominantColor } from "../lib/images.ts";

const require = createRequire(import.meta.url);
const routeUrl = new URL("../app/api/music/artwork/route.ts", import.meta.url)
	.href;
const modules = {
	"next/cache": `export function unstable_cache(callback, keys) {
		return async (...args) => {
			const key = JSON.stringify([keys, args]);
			if (globalThis.artworkCache.has(key)) return globalThis.artworkCache.get(key);
			const value = await callback(...args);
			globalThis.artworkCache.set(key, value);
			return value;
		};
	}`,
	"@/lib/apple-music/api":
		"export function getAlbumFromCatalog(id) { return globalThis.artworkAlbum(id); }",
	"@/lib/apple-music/m3u8":
		"export function getVideoUrlFromM3u8(url) { return globalThis.artworkVideo(url); }",
	"@/lib/images":
		"export function getDominantColor(url) { return globalThis.artworkColor(url); }",
};
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (context.parentURL === routeUrl) {
			if (specifier in modules)
				return {
					url: `data:text/javascript,${encodeURIComponent(modules[specifier])}`,
					shortCircuit: true,
				};
			if (specifier === "@/lib/apple-music/normalize")
				return {
					url: new URL(
						"../lib/apple-music/normalize.ts",
						import.meta.url,
					).href,
					shortCircuit: true,
				};
			if (specifier === "next/server")
				return {
					url: new URL(`file://${require.resolve("next/server")}`)
						.href,
					shortCircuit: true,
				};
		}
		return nextResolve(specifier, context);
	},
});
const { GET } = await import(routeUrl);
const coverUrl = "https://is1-ssl.mzstatic.com/image/1200x1200bb.jpg";
const request = (params = {}) =>
	new Request(
		`http://localhost/api/music/artwork?${new URLSearchParams(params)}`,
	);

test.beforeEach(() => {
	globalThis.artworkCache = new Map();
	globalThis.artworkAlbum = async () => ({ attributes: {} });
	globalThis.artworkVideo = async () => ({
		standard: "video.mp4",
		hq: "hq.mp4",
	});
	globalThis.artworkColor = async () => "rgb(37, 83, 129)";
});
test.afterEach(() => {
	for (const key of [
		"artworkCache",
		"artworkAlbum",
		"artworkVideo",
		"artworkColor",
	])
		delete globalThis[key];
});

test("artwork enrichment validates Apple covers and optional numeric album IDs before fetching", async () => {
	let fetched = false;
	globalThis.artworkColor = async () => {
		fetched = true;
		return "rgb(1, 2, 3)";
	};
	globalThis.artworkAlbum = async () => {
		fetched = true;
		return { attributes: {} };
	};
	for (const params of [
		{},
		{ coverUrl: "" },
		{ albumId: "library-id", coverUrl },
		{ coverUrl: "http://is1-ssl.mzstatic.com/image.jpg" },
		{ coverUrl: "https://mzstatic.com.evil.test/image.jpg" },
		{ coverUrl: "https://user:password@is1-ssl.mzstatic.com/image.jpg" },
		{ coverUrl: "https://is1-ssl.mzstatic.com:8443/image.jpg" },
	])
		assert.equal((await GET(request(params))).status, 400);
	assert.equal(fetched, false);
});

test("cover-only enrichment restores color for library albums without catalog IDs", async () => {
	globalThis.artworkAlbum = async () => {
		throw new Error("Must not fetch catalog");
	};
	const response = await GET(request({ coverUrl }));
	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), {
		standard: null,
		hq: null,
		dominantColor: "rgb(37, 83, 129)",
	});
	assert.match(response.headers.get("Cache-Control"), /s-maxage=86400/);
});

test("a video failure preserves the independently cached color and retries video", async () => {
	let albumCalls = 0;
	let colorCalls = 0;
	globalThis.artworkAlbum = async () => {
		albumCalls += 1;
		return albumCalls === 1 ? null : { attributes: {} };
	};
	globalThis.artworkColor = async () => {
		colorCalls += 1;
		return "rgb(37, 83, 129)";
	};
	const first = await GET(request({ albumId: "123", coverUrl }));
	assert.equal(first.status, 200);
	assert.equal(first.headers.get("Cache-Control"), "no-store");
	assert.equal((await first.json()).dominantColor, "rgb(37, 83, 129)");
	const recovered = await GET(request({ albumId: "123", coverUrl }));
	assert.equal(recovered.status, 200);
	assert.match(recovered.headers.get("Cache-Control"), /s-maxage=86400/);
	assert.equal(albumCalls, 2);
	assert.equal(colorCalls, 1);
});

test("transient color failure does not cache an absent color or discard successful video", async () => {
	let colorCalls = 0;
	let albumCalls = 0;
	globalThis.artworkAlbum = async () => {
		albumCalls += 1;
		return {
			attributes: {
				editorialVideo: {
					motionSquareVideo1x1: { video: "manifest.m3u8" },
				},
			},
		};
	};
	globalThis.artworkColor = async () =>
		++colorCalls === 1 ? null : "rgb(37, 83, 129)";
	const first = await GET(request({ albumId: "123", coverUrl }));
	assert.equal(first.status, 200);
	assert.equal(first.headers.get("Cache-Control"), "no-store");
	assert.deepEqual(await first.json(), {
		standard: "video.mp4",
		hq: "hq.mp4",
		dominantColor: null,
	});
	const second = await GET(request({ albumId: "123", coverUrl }));
	assert.equal((await second.json()).dominantColor, "rgb(37, 83, 129)");
	assert.equal(colorCalls, 2);
	assert.equal(albumCalls, 1);
});

test("total enrichment failures are retryable without caching", async () => {
	globalThis.artworkColor = async () => null;
	const response = await GET(request({ coverUrl }));
	assert.equal(response.status, 503);
	assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("dominant color retains the original image-derived RGB algorithm with bounded safe fetch", async (t) => {
	const image = await sharp({
		create: {
			width: 16,
			height: 16,
			channels: 3,
			background: { r: 37, g: 83, b: 129 },
		},
	})
		.png()
		.toBuffer();
	t.mock.method(globalThis, "fetch", async (url, options) => {
		assert.equal(url, coverUrl);
		assert.equal(options.redirect, "error");
		assert.equal(options.cache, "no-store");
		assert.ok(options.signal instanceof AbortSignal);
		return new Response(image);
	});
	assert.equal(await getDominantColor(coverUrl), "rgb(37, 83, 129)");
});

test("dominant color rejects unsuccessful image responses instead of treating them as artwork", async (t) => {
	t.mock.method(console, "error", () => {});
	t.mock.method(
		globalThis,
		"fetch",
		async () => new Response("Unavailable", { status: 503 }),
	);
	assert.equal(await getDominantColor(coverUrl), null);
});
