/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTopTracks } from "../../lib/spotify";
import { getPlaiceholder } from "plaiceholder";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const response = await getTopTracks();
	const { items } = await response.json();

	const tracks = items.slice(0, 10).map((track: any) => ({
		artist: track.artists.map((_artist: any) => _artist.name)[0],
		songUrl: track.external_urls.spotify,
		title: track.name,
		albumImageUrl: track.album.images[0].url,
	}));

	const tracksWithPlaceholders = await Promise.all(
		tracks.map(async (track: any) => {
			const { base64: blurAlbumImageUrl } = await getPlaiceholder(
				track.albumImageUrl
			);
			return {
				...track,
				blurAlbumImageUrl,
			};
		})
	);

	const half = Math.ceil(tracksWithPlaceholders.length / 2);

	const firstHalf = tracksWithPlaceholders.slice(0, half).reverse();
	const secondHalf = tracksWithPlaceholders.slice(half).reverse();

	return res.status(200).json({ tracks: [...firstHalf, ...secondHalf] });
};
