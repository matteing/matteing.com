import { NextApiRequest, NextApiResponse } from "next";
import get from "lodash/fp/get";
import { REVALIDATE_KEY } from "../../../config";
import { postMessage } from "../../../lib/discord";
import isError from "lodash/isError";
import reduce from "lodash/reduce";

interface RevalidateMap {
	[type: string]: (slug: string) => string;
}

const PATH_MAP: RevalidateMap = {
	post: (slug) => `/posts/${slug}`,
	page: (slug) => `/${slug}`,
};

interface SlugItem {
	type: "post" | "page";
	slug: string;
}

function collectSlugs(req: NextApiRequest): SlugItem[] {
	return reduce(
		Object.keys(req.body),
		(result: SlugItem[], value) => {
			const currentSlug = get(`${value}.current.slug`, req.body);
			const previousSlug = get(`${value}.previous.slug`, req.body);
			if (previousSlug === undefined && currentSlug) {
				return [
					...result,
					{ type: value as SlugItem["type"], slug: currentSlug },
				];
			} else if (currentSlug === undefined && previousSlug) {
				return [
					...result,
					{ type: value as SlugItem["type"], slug: previousSlug },
				];
			} else {
				return [
					...result,
					{ type: value as SlugItem["type"], slug: currentSlug },
					{ type: value as SlugItem["type"], slug: previousSlug },
				];
			}
		},
		[]
	);
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// Check for secret to confirm this is a valid request
	if (req.query.secret !== REVALIDATE_KEY) {
		return res.status(401).json({ message: "Invalid token" });
	}

	try {
		const collected = collectSlugs(req);
		await Promise.all(
			collected.map(async (item) => {
				const path = PATH_MAP[item.type](item.slug);
				await res.revalidate(path);
				await postMessage(`✅ Revalidated w/ ISR: \`${path}\``);
			})
		);
		return res.json({ revalidated: true });
	} catch (err) {
		// If there was an error, Next.js will continue
		// to show the last successfully generated page
		// eslint-disable-next-line no-console
		console.error(err);
		let message = "Unknown Error";
		if (isError(err)) message = err.message;
		postMessage(`⚠️ Failed to on-demand revalidate. \`${message}\``);
		return res.status(500).send("Error revalidating");
	}
};
