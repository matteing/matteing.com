import { NextApiRequest, NextApiResponse } from "next";
import get from "lodash/fp/get";
import { DISCORD_HOOK } from "../../../config";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// Check for secret to confirm this is a valid request
	if (req.query.secret !== process.env.REVALIDATE_KEY) {
		return res.status(401).json({ message: "Invalid token" });
	}

	try {
		// this should be the actual path not a rewritten path
		// e.g. for "/blog/[slug]" this should be "/blog/post-1"
		const currentSlug = get("post.current.slug", req.body);
		const previousSlug = get("post.previous.slug", req.body);
		if (currentSlug) await res.revalidate(currentSlug);
		if (previousSlug !== currentSlug) await res.revalidate(previousSlug);
		if (DISCORD_HOOK) {
			await fetch(DISCORD_HOOK, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: `Updated: previous: ${currentSlug}, current: ${previousSlug} `,
				}),
			});
		}
		return res.json({ revalidated: true });
	} catch (err) {
		// If there was an error, Next.js will continue
		// to show the last successfully generated page
		if (DISCORD_HOOK) {
			await fetch(DISCORD_HOOK, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: `Failed to On-Demand ISG.`,
				}),
			});
		}
		return res.status(500).send("Error revalidating");
	}
};
