import assert from "node:assert/strict";
import { registerHooks, createRequire } from "node:module";
import test from "node:test";
import { getPlaybackPosition } from "../lib/apple-music/playback.mjs";

const require = createRequire(import.meta.url);
const nextServerUrl = new URL(`file://${require.resolve("next/server")}`).href;
const root = new URL("../", import.meta.url);
const store = new URL("../lib/apple-music/now-playing.ts", import.meta.url)
	.href;
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === "@/lib/redis")
			return {
				url: "data:text/javascript,export function getRedis(){return globalThis.musicTestRedis ?? null}",
				shortCircuit: true,
			};
		if (specifier.startsWith("@/"))
			return {
				url: new URL(
					`${specifier.slice(2)}${specifier.endsWith(".mjs") ? "" : ".ts"}`,
					root,
				).href,
				shortCircuit: true,
			};
		if (context.parentURL === store && specifier === "./normalize")
			return {
				url: new URL("lib/apple-music/normalize.ts", root).href,
				shortCircuit: true,
			};
		if (specifier === "next/server")
			return { url: nextServerUrl, shortCircuit: true };
		return nextResolve(specifier, context);
	},
});
const { parsePlaybackUpdate, getNowPlayingState } = await import(store);
const route = await import(new URL("app/api/now-playing/route.ts", root).href);
const sessionId = "00000000-0000-4000-8000-000000000001";
const observationId = "00000000-0000-4000-8000-000000000002";
const track = {
	id: "123",
	type: "songs",
	attributes: {
		name: "Track",
		artistName: "Artist",
		durationInMillis: 180000,
	},
};
const body = { sessionId, observationId, sequence: 1, track, elapsedMs: 45000 };
const state = {
	track: { durationMs: 180000 },
	isPlaying: true,
	serverTime: 1_000_000,
	estimatedStartedAt: 955000,
	expiresAt: 1_045_000,
};

test("progress uses server time, advances from observation, and does not need browser wall time", () => {
	const value = getPlaybackPosition(state, 5000);
	assert.equal(value.isPlaying, true);
	assert.equal(value.currentTime, 50000);
	assert.equal(value.progressPercent, (50000 / 180000) * 100);
});

test("heartbeat expires even if the browser keeps its last successful response", () => {
	assert.equal(getPlaybackPosition(state, 44999).isPlaying, true);
	assert.equal(getPlaybackPosition(state, 45000).isPlaying, false);
});

test("known duration ends the estimate with no pause buffer; unknown duration has no progress", () => {
	assert.equal(
		getPlaybackPosition({ ...state, track: { durationMs: 45000 } })
			.isPlaying,
		false,
	);
	const unknown = {
		...state,
		track: { durationMs: 0 },
		estimatedStartedAt: state.serverTime,
	};
	assert.deepEqual(getPlaybackPosition(unknown, 10000), {
		isPlaying: true,
		currentTime: 0,
		progressPercent: 0,
	});
	assert.equal(
		getPlaybackPosition({ ...unknown, expiresAt: 2_000_000 }, 45000)
			.isPlaying,
		false,
	);
});

test("ingestion validates updates and assigns server-owned timestamps", () => {
	const update = parsePlaybackUpdate(body, 1_000_000);
	assert.equal(update.estimatedStartedAt, 955000);
	assert.equal(update.expiresAt, 1_045_000);
	assert.equal(update.track.name, "Track");
	assert.equal(
		parsePlaybackUpdate({
			...body,
			track: null,
			observationId: null,
			elapsedMs: 0,
		}).track,
		null,
	);
	for (const change of [
		null,
		{},
		{ ...body, sequence: -1 },
		{ ...body, elapsedMs: -1 },
		{ ...body, elapsedMs: Infinity },
		{ ...body, track: {} },
		{ ...body, observationId: null },
		{ ...body, sessionId: "invalid" },
		{ ...body, track: null },
	]) {
		assert.throws(() => parsePlaybackUpdate(change), { status: 400 });
	}
});

test("public read never infers playback without a live CLI record", async () => {
	globalThis.musicTestRedis = null;
	assert.equal((await getNowPlayingState()).isPlaying, false);
	globalThis.musicTestRedis = {
		get: async () =>
			JSON.stringify({
				...parsePlaybackUpdate(body),
				expiresAt: Date.now() - 1,
			}),
	};
	assert.equal((await getNowPlayingState()).track, null);
	delete globalThis.musicTestRedis;
});

test("write endpoints reject missing/wrong authentication, malformed JSON and oversized payloads", async () => {
	const oldSecret = process.env.MUSIC_SYNC_SECRET;
	process.env.MUSIC_SYNC_SECRET = "x".repeat(32);
	try {
		const request = (
			value,
			auth = `Bearer ${process.env.MUSIC_SYNC_SECRET}`,
		) =>
			new Request("http://localhost/api/now-playing", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: auth,
				},
				body: value,
			});
		assert.equal((await route.POST(request("{}", ""))).status, 401);
		assert.equal(
			(await route.DELETE(request("{}", "Bearer wrong"))).status,
			401,
		);
		assert.equal((await route.POST(request("{"))).status, 400);
		assert.equal(
			(await route.POST(request("x".repeat(65537)))).status,
			413,
		);
		assert.equal((await route.POST(request("{}"))).status, 400);
		const noStorage = await route.POST(request(JSON.stringify(body)));
		assert.equal(noStorage.status, 503);
		assert.equal(noStorage.headers.get("Cache-Control"), "no-store");
	} finally {
		if (oldSecret === undefined) delete process.env.MUSIC_SYNC_SECRET;
		else process.env.MUSIC_SYNC_SECRET = oldSecret;
	}
});
