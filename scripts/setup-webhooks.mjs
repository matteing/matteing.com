/* eslint-disable no-console */
import GhostAdminAPI from "@tryghost/admin-api";
import prompt from "prompt";
import env from "@next/env";

env.loadEnvConfig("./");

const EVENTS = [
	"post.added",
	"post.deleted",
	"post.published.edited",
	"post.published",
	"post.unpublished",
	"page.added",
	"page.deleted",
	"page.published.edited",
	"page.published",
	"page.unpublished",
];

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
const NEXT_PUBLIC_GHOST_URL = process.env.NEXT_PUBLIC_GHOST_URL;
const GHOST_ADMIN_KEY = process.env.GHOST_ADMIN_KEY;
const REVALIDATE_KEY = process.env.REVALIDATE_KEY;

prompt.start();

if (
	!NEXT_PUBLIC_URL ||
	!NEXT_PUBLIC_GHOST_URL ||
	!GHOST_ADMIN_KEY ||
	!REVALIDATE_KEY
) {
	console.error("Environment variables not set.");
	process.exit(1);
}

const adminApi = GhostAdminAPI({
	url: NEXT_PUBLIC_GHOST_URL,
	key: GHOST_ADMIN_KEY,
	version: "v5.0",
});

async function setWebhooks(integrationId) {
	const hooks = EVENTS.map((event) => ({
		name: "Vercel",
		event,
		target_url: `${NEXT_PUBLIC_URL}/api/ghost/revalidate?secret=${REVALIDATE_KEY}`,
		integration_id: integrationId,
	}));
	const result = await Promise.all(
		hooks.map(async (hook) => await adminApi.webhooks.add(hook))
	);
	console.log(result);
}

prompt.get(["integrationId"], (err, result) => {
	setWebhooks(result.integrationId);
});
