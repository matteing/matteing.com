import { NextApiRequest, NextApiResponse } from "next";
import { Post } from "../../../types";
import escape from "lodash/escape";
import { getAllPosts } from "../../../lib/blog";
import { isPublished, orderPostsByDate } from "../../../lib/filters";

/* Full credit to https://jonbellah.com/articles/rss-feed-nextjs */

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const posts = orderPostsByDate(await getAllPosts()).filter(isPublished);
		const postItems = posts
			.map((post: Post) => {
				const url = `${process.env.NEXT_PUBLIC_URL}/posts/${post.slug}`;

				return `<item>
              <title>${post.title}</title>
              <link>${url}</link>
              <guid>${url}</guid>
              <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
              ${post.excerpt && `<description>${post.excerpt}</description>`}
              <content:encoded>${escape(post.body)}</content:encoded>
            </item>`;
			})
			.join("");

		// Add urlSet to entire sitemap string
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
          <channel>
          <title>matteing.com</title>
          <description>Sergio Mattei's Blog</description>
          <link>${process.env.NEXT_PUBLIC_URL}</link>
          <lastBuildDate>${posts[0].createdAt}</lastBuildDate>
          ${postItems}
          </channel>
          </rss>`.trim();

		// set response content header to xml
		res.setHeader("Content-Type", "text/xml");

		return res.status(200).send(sitemap);
	} catch (e: unknown) {
		// eslint-disable-next-line lodash/prefer-lodash-typecheck
		if (!(e instanceof Error)) {
			throw e;
		}

		return res.status(500).json({ error: e.message || "" });
	}
};
