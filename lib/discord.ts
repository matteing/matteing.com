import { DISCORD_HOOK } from "../config";

export async function postMessage(message: string) {
	if (DISCORD_HOOK) {
		await fetch(DISCORD_HOOK, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content: message,
			}),
		});
	}
}
