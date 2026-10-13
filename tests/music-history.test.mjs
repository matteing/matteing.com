import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import {
	normalizeTrack,
	normalizeRecentTracks,
	recentAlbumsFromTracks,
} from "../lib/apple-music/normalize.ts";

// Substitute I/O only. Cache lifecycle/revalidation belongs to Next, not this test suite.
const readerUrl = new URL(
	"../lib/apple-music/recently-played.ts",
	import.meta.url,
).href;
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (context.parentURL === readerUrl) {
			if (specifier === "next/cache") {
				return {
					url:
						"data:text/javascript," +
						encodeURIComponent(`
					export function unstable_cache(refresh) {
						globalThis.musicHistoryRefresh = refresh;
						return () => "musicHistorySnapshot" in globalThis ? globalThis.musicHistorySnapshot : refresh();
					}
				`),
					shortCircuit: true,
				};
			}
			if (specifier === "./api") {
				return {
					url: "data:text/javascript,export function getRecentTracks(){return globalThis.musicHistoryFetch()}",
					shortCircuit: true,
				};
			}
			if (specifier === "./normalize") {
				return {
					url: new URL(
						"../lib/apple-music/normalize.ts",
						import.meta.url,
					).href,
					shortCircuit: true,
				};
			}
		}
		return nextResolve(specifier, context);
	},
});
const { getRecentlyPlayedState, snapshotToRecentlyPlayedState } = await import(
	readerUrl
);

test.afterEach(() => {
	delete globalThis.musicHistoryFetch;
	delete globalThis.musicHistorySnapshot;
});

function song(id, overrides = {}) {
	return {
		id,
		type: "songs",
		attributes: {
			name: `Track ${id}`,
			artistName: "Artist",
			albumName: `Album ${id}`,
			...overrides,
		},
	};
}

function snapshot(fetchedAt = 1_000_000) {
	return {
		albums: recentAlbumsFromTracks(normalizeRecentTracks([song("a")])),
		fetchedAt,
	};
}

test("library tracks survive missing artwork, album name, URL, and duration", () => {
	const track = normalizeTrack({
		...song("i.library"),
		type: "library-songs",
		attributes: { name: "Song", artistName: "Artist" },
	});
	assert.equal(track.album.name, "Song");
	assert.equal(track.album.coverUrl, "");
	assert.equal(track.durationMs, 0);
	assert.equal(track.url, "");
});

test("normalization preserves catalog song identities without changing library track or album IDs", () => {
	assert.equal(
		normalizeTrack(song("1692805053")).catalogSongId,
		"1692805053",
	);
	const track = normalizeTrack({
		...song("i.XMDoPDPH2Mbk0A", {
			name: "fetish",
			albumName: "KLEPTO - EP",
			playParams: { catalogId: "1692805053" },
		}),
		type: "library-songs",
		relationships: {
			albums: { data: [{ id: "l.baO44Q9", type: "library-albums" }] },
		},
	});
	assert.equal(track.id, "i.XMDoPDPH2Mbk0A");
	assert.equal(track.album.id, "l.baO44Q9");
	assert.equal(track.catalogSongId, "1692805053");
});

test("catalog relationship fallback accepts only numeric song IDs", () => {
	const librarySong = { ...song("i.library"), type: "library-songs" };
	assert.equal(
		normalizeTrack({
			...librarySong,
			relationships: {
				catalog: {
					data: [
						{ id: "123", type: "albums" },
						{ id: "invalid", type: "songs" },
						{ id: "1692805053", type: "songs" },
					],
				},
			},
		}).catalogSongId,
		"1692805053",
	);
	for (const id of [
		"",
		"i.library",
		"-1",
		"1/../../albums",
		"1".repeat(21),
		123,
	]) {
		assert.equal(
			normalizeTrack({
				...librarySong,
				attributes: {
					...librarySong.attributes,
					playParams: { catalogId: id },
				},
				relationships: { catalog: { data: [{ id, type: "songs" }] } },
			}).catalogSongId,
			undefined,
		);
	}
});

test("normalization allows only safe Apple URLs and validated artwork colors", () => {
	const track = normalizeTrack(
		song("a", {
			url: "javascript:alert(1)",
			durationInMillis: -20,
			artwork: {
				url: "https://is1-ssl.mzstatic.com/image/{w}x{h}.jpg",
				bgColor: "123abc",
			},
			previews: [{ url: "https://attacker.example/music.mp3" }],
		}),
	);
	assert.equal(track.url, "");
	assert.equal(track.previewUrl, null);
	assert.equal(track.durationMs, 0);
	assert.equal(
		track.album.coverUrl,
		"https://is1-ssl.mzstatic.com/image/600x600.jpg",
	);
	assert.equal(track.dominantColor, "#123abc");
	assert.equal(
		normalizeTrack(song("a", { artwork: { bgColor: "red; color: blue" } }))
			.dominantColor,
		null,
	);
});

test("valid empty history is distinct from a malformed snapshot or malformed track", () => {
	assert.deepEqual(normalizeRecentTracks([]), []);
	for (const raw of [
		undefined,
		{},
		[null],
		[{ id: "x", type: "songs", attributes: {} }],
	]) {
		assert.throws(() => normalizeRecentTracks(raw));
	}
});

test("Apple's iTunes preview CDN remains usable", () => {
	const url =
		"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview/song.m4a";
	assert.equal(
		normalizeTrack(song("preview", { previews: [{ url }] })).previewUrl,
		url,
	);
});

test("album deduplication preserves order and distinguishes artists and album IDs", () => {
	const raw = [
		song("a", { albumName: "Shared name", artistName: "A" }),
		song("b", { albumName: "Shared name", artistName: "B" }),
		song("c", { albumName: "Shared name", artistName: "A" }),
		{
			...song("d"),
			relationships: {
				albums: { data: [{ id: "catalog-album", type: "albums" }] },
			},
		},
		{
			...song("e"),
			relationships: {
				albums: { data: [{ id: "catalog-album", type: "albums" }] },
			},
		},
	];
	const albums = recentAlbumsFromTracks(normalizeRecentTracks(raw));
	assert.deepEqual(
		albums.map((album) => album.artist),
		["A", "B", "Artist"],
	);
	assert.equal(albums[2].id, "catalog-album");
});

test("history becomes visibly stale at 30 seconds and unavailable at five minutes", () => {
	const value = snapshot();
	assert.equal(
		snapshotToRecentlyPlayedState(value, value.fetchedAt + 29_999).stale,
		false,
	);
	const stale = snapshotToRecentlyPlayedState(
		value,
		value.fetchedAt + 30_000,
	);
	assert.equal(stale.stale, true);
	assert.equal(stale.unavailable, false);
	assert.equal(stale.fetchedAt, value.fetchedAt);
	assert.equal(
		snapshotToRecentlyPlayedState(value, value.fetchedAt + 299_999)
			.unavailable,
		false,
	);
	const expired = snapshotToRecentlyPlayedState(
		value,
		value.fetchedAt + 300_000,
	);
	assert.equal(expired.unavailable, true);
	assert.equal(expired.fetchedAt, null);
	assert.deepEqual(expired.albums, []);
});

test("future or nonfinite snapshot times cannot surface cached history", () => {
	for (const fetchedAt of [1_000_001, Infinity, NaN]) {
		assert.equal(
			snapshotToRecentlyPlayedState(snapshot(fetchedAt), 1_000_000)
				.unavailable,
			true,
		);
	}
});

test("each successful refresh replaces the whole snapshot, including valid empty history", async (t) => {
	t.mock.method(Date, "now", () => 1_000_000);
	let data = [song("a"), song("b")];
	globalThis.musicHistoryFetch = async () => Response.json({ data });
	assert.deepEqual(
		(await globalThis.musicHistoryRefresh()).albums.map(
			(album) => album.name,
		),
		["Album a", "Album b"],
	);
	data = [song("a"), song("c")];
	assert.deepEqual(
		(await globalThis.musicHistoryRefresh()).albums.map(
			(album) => album.name,
		),
		["Album a", "Album c"],
	);
	data = [];
	const empty = await globalThis.musicHistoryRefresh();
	assert.deepEqual(empty, { albums: [], fetchedAt: 1_000_000 });
	assert.equal(snapshotToRecentlyPlayedState(empty).unavailable, false);
});

test("malformed history and expired credentials reject before the cache receives a value", async () => {
	for (const payload of [{}, { data: {} }, { data: [null] }]) {
		globalThis.musicHistoryFetch = async () => Response.json(payload);
		await assert.rejects(globalThis.musicHistoryRefresh);
	}
	globalThis.musicHistoryFetch = async () =>
		Response.json({}, { status: 401 });
	await assert.rejects(globalThis.musicHistoryRefresh, /401/);
});

test("a retained cache snapshot keeps its original age; cold errors return unavailable", async (t) => {
	t.mock.method(Date, "now", () => 1_030_000);
	t.mock.method(console, "error", () => {});
	globalThis.musicHistorySnapshot = snapshot();
	const cached = await getRecentlyPlayedState();
	assert.equal(cached.stale, true);
	assert.equal(cached.fetchedAt, 1_000_000);
	assert.equal(cached.serverTime, 1_030_000);
	delete globalThis.musicHistorySnapshot;
	globalThis.musicHistoryFetch = async () => {
		throw new Error("Offline");
	};
	assert.deepEqual(await getRecentlyPlayedState(), {
		albums: [],
		fetchedAt: null,
		stale: false,
		unavailable: true,
		serverTime: 1_030_000,
	});
});
