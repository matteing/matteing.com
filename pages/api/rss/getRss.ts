import { NextApiRequest, NextApiResponse } from "next";
import { GHOST_RSS_ENDPOINT } from "../../../config";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const rssData = await fetch(GHOST_RSS_ENDPOINT);
		res.setHeader("Content-Type", "text/xml");
		return res.status(200).send(await rssData.text());
	} catch (e: unknown) {
		// eslint-disable-next-line lodash/prefer-lodash-typecheck
		if (!(e instanceof Error)) {
			throw e;
		}
		return res.status(500).json({ error: e.message || "" });
	}
};
