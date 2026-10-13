import assert from "node:assert/strict";
import { createRequire, registerHooks } from "node:module";
import test from "node:test";
import sharp from "sharp";
import { getDominantColor } from "../lib/images.ts";

const require = createRequire(import.meta.url);
const routeUrl = new URL("../app/api/music/artwork/route.ts", import.meta.url)
	.href;
const apiUrl = new URL("../lib/apple-music/api.ts", import.meta.url).href;
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
		"export function getAlbumFromCatalog(id) { return globalThis.artworkAlbum(id); } export function getCatalogAlbumId(id) { return globalThis.artworkSongAlbum(id); }",
	"@/lib/apple-music/m3u8":
		"export function getVideoUrlFromM3u8(url) { return globalThis.artworkVideo(url); }",
	"@/lib/images":
		"export function getDominantColor(url) { return globalThis.artworkColor(url); }",
};
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (context.parentURL === apiUrl) {
			if (specifier === "../config")
				return {
					url: "data:text/javascript,export const AM_DEV_TOKEN='artwork-test-developer-token'; export const AM_USER_TOKEN=undefined;",
					shortCircuit: true,
				};
			if (specifier === "./web-token")
				return {
					url: "data:text/javascript,export function getAppleWebToken(){ throw new Error('Catalog song resolution must not request a web token'); }",
					shortCircuit: true,
				};
			if (specifier === "./normalize")
				return {
					url: new URL(
						"../lib/apple-music/normalize.ts",
						import.meta.url,
					).href,
					shortCircuit: true,
				};
		}
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
const { getCatalogAlbumId } = await import(apiUrl);
const coverUrl = "https://is1-ssl.mzstatic.com/image/1200x1200bb.jpg";
const request = (params = {}) =>
	new Request(
		`http://localhost/api/music/artwork?${new URLSearchParams(params)}`,
	);

test.beforeEach(() => {
	globalThis.artworkCache = new Map();
	globalThis.artworkAlbum = async () => ({ attributes: {} });
	globalThis.artworkSongAlbum = async () => "1692805050";
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
		"artworkSongAlbum",
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
	globalThis.artworkSongAlbum = async () => {
		fetched = true;
		return "1692805050";
	};
	for (const params of [
		{},
		{ coverUrl: "" },
		{ albumId: "library-id", coverUrl },
		{ songId: "i.library", coverUrl },
		{ songId: "" },
		{ songId: "1".repeat(21), coverUrl },
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

test("catalog song enrichment resolves a library track to animated album artwork and caches the mapping", async () => {
	let lookups = 0;
	globalThis.artworkSongAlbum = async (songId) => {
		assert.equal(songId, "1692805053");
		lookups += 1;
		return "1692805050";
	};
	globalThis.artworkAlbum = async (albumId) => {
		assert.equal(albumId, "1692805050");
		return {
			attributes: {
				editorialVideo: {
					motionSquareVideo1x1: { video: "manifest.m3u8" },
				},
			},
		};
	};
	const response = await GET(request({ songId: "1692805053", coverUrl }));
	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), {
		standard: "video.mp4",
		hq: "hq.mp4",
		dominantColor: "rgb(37, 83, 129)",
	});
	assert.equal((await GET(request({ songId: "1692805053" }))).status, 200);
	assert.equal(lookups, 1);
});

test("numeric album ID bypasses unnecessary catalog song resolution", async () => {
	globalThis.artworkSongAlbum = async () => {
		throw new Error("Must not resolve song");
	};
	const response = await GET(
		request({ albumId: "123", songId: "1692805053" }),
	);
	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), {
		standard: null,
		hq: null,
		dominantColor: null,
	});
});

test("failed catalog mappings preserve color and are retried instead of cached as absent video", async () => {
	let attempts = 0;
	globalThis.artworkSongAlbum = async () => {
		if (++attempts === 1) throw new Error("Temporary catalog failure");
		return "1692805050";
	};
	globalThis.artworkAlbum = async () => ({
		attributes: {
			editorialVideo: {
				motionSquareVideo1x1: { video: "manifest.m3u8" },
			},
		},
	});
	const first = await GET(request({ songId: "1692805053", coverUrl }));
	assert.equal(first.status, 200);
	assert.equal(first.headers.get("Cache-Control"), "no-store");
	assert.deepEqual(await first.json(), {
		standard: null,
		hq: null,
		dominantColor: "rgb(37, 83, 129)",
		retryable: true,
	});
	const recovered = await GET(request({ songId: "1692805053", coverUrl }));
	assert.equal((await recovered.json()).standard, "video.mp4");
	assert.equal(attempts, 2);
});

test("catalog song lookup uses only the developer token and requires a matching song with a catalog album", async (t) => {
	t.mock.method(globalThis, "fetch", async (url, options) => {
		assert.equal(
			url,
			"https://api.music.apple.com/v1/catalog/us/songs/1692805053?include=albums",
		);
		assert.deepEqual(options.headers, {
			Authorization: "Bearer artwork-test-developer-token",
		});
		assert.equal(options.redirect, "error");
		assert.ok(options.signal instanceof AbortSignal);
		return Response.json({
			data: [
				{
					id: "1692805053",
					type: "songs",
					relationships: {
						albums: {
							data: [
								{ type: "library-albums", id: "l.baO44Q9" },
								{ type: "albums", id: "1692805050" },
							],
						},
					},
				},
			],
		});
	});
	assert.equal(await getCatalogAlbumId("1692805053"), "1692805050");
	await assert.rejects(
		getCatalogAlbumId("i.library"),
		/Invalid catalog song ID/,
	);
});

test("unsuccessful or missing catalog song mappings remain retryable failures", async (t) => {
	const fetch = t.mock.method(globalThis, "fetch");
	for (const response of [
		new Response(null, { status: 503 }),
		Response.json({ data: [] }),
		Response.json({
			data: [
				{
					id: "1692805053",
					type: "songs",
					relationships: { albums: { data: [] } },
				},
			],
		}),
		Response.json({
			data: [
				{
					id: "different",
					type: "songs",
					relationships: {
						albums: { data: [{ id: "123", type: "albums" }] },
					},
				},
			],
		}),
	]) {
		fetch.mock.mockImplementation(async () => response);
		await assert.rejects(
			getCatalogAlbumId("1692805053"),
			/Catalog (song|album) unavailable/,
		);
	}
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
	const partial = await first.json();
	assert.equal(partial.dominantColor, "rgb(37, 83, 129)");
	assert.equal(partial.retryable, true);
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
		retryable: true,
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
	assert.equal((await response.json()).retryable, true);
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
