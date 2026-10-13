import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { MIN_SECRET_LENGTH } from "@/lib/apple-music/shared.mjs";
import {
	clearPlayback,
	getNowPlayingState,
	MusicSyncError,
	publishPlayback,
} from "@/lib/apple-music/now-playing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const MAX_BODY_BYTES = 64 * 1024;

function authorize(request: Request) {
	const secret = process.env.MUSIC_SYNC_SECRET;
	if (!secret || secret.length < MIN_SECRET_LENGTH)
		throw new MusicSyncError("Music sync is not configured", 503);
	const expected = Buffer.from(`Bearer ${secret}`);
	const actual = Buffer.from(request.headers.get("authorization") ?? "");
	if (
		actual.length !== expected.length ||
		!timingSafeEqual(actual, expected)
	) {
		throw new MusicSyncError("Unauthorized", 401);
	}
}

async function readBody(request: Request) {
	if (!request.headers.get("content-type")?.startsWith("application/json")) {
		throw new MusicSyncError("Expected application/json", 415);
	}
	const reader = request.body?.getReader();
	if (!reader) throw new MusicSyncError("Missing body", 400);
	const chunks: Uint8Array[] = [];
	let length = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		length += value.length;
		if (length > MAX_BODY_BYTES) {
			await reader.cancel();
			throw new MusicSyncError("Payload too large", 413);
		}
		chunks.push(value);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		throw new MusicSyncError("Invalid JSON", 400);
	}
}

function failure(error: unknown) {
	if (error instanceof MusicSyncError) {
		return NextResponse.json(
			{ error: error.message },
			{ status: error.status, headers },
		);
	}
	console.error("Music playback storage unavailable");
	return NextResponse.json(
		{ error: "Playback storage unavailable" },
		{ status: 503, headers },
	);
}

export async function GET() {
	try {
		return NextResponse.json(await getNowPlayingState(), { headers });
	} catch (error) {
		return failure(error);
	}
}

export async function POST(request: Request) {
	try {
		authorize(request);
		await publishPlayback(await readBody(request));
		return NextResponse.json({ ok: true }, { headers });
	} catch (error) {
		return failure(error);
	}
}

export async function DELETE(request: Request) {
	try {
		authorize(request);
		await clearPlayback(await readBody(request));
		return NextResponse.json({ ok: true }, { headers });
	} catch (error) {
		return failure(error);
	}
}
