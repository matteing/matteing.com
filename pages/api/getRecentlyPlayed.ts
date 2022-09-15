/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { getRecentlyPlayed } from "../../lib/spotify";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const response = await getRecentlyPlayed();
	const { items } = await response.json();

	const tracks = items
		.map((item: any) => item.track)
		.slice(0, 10)
		.map((track: any) => ({
			artist: track.artists.map((_artist: any) => _artist.name)[0],
			songUrl: track.external_urls.spotify,
			title: track.name,
			albumImageUrl: track.album.images[0].url,
		}));
	return res.status(200).json({ tracks });
};
