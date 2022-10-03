import { getNowPlaying } from "../../lib/spotify";
import { getPlaiceholder } from "plaiceholder";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const response = await getNowPlaying();

		if (response.status === 204 || response.status > 400) {
			return res.status(200).json({ isPlaying: false });
		}

		const song = await response.json();
		const isPlaying = song.is_playing;
		const title = song.item.name;
		const artist = song.item.artists.map(
			(_artist: { name: string }) => _artist.name
		)[0];
		const album = song.item.album.name;
		const albumImageUrl = song.item.album.images[0].url;
		const songUrl = song.item.external_urls.spotify;
		const { base64: blurAlbumImageUrl } = await getPlaiceholder(
			albumImageUrl
		);

		return res.status(200).json({
			album,
			albumImageUrl,
			blurAlbumImageUrl,
			artist,
			isPlaying,
			songUrl,
			title,
		});
	} catch (e) {
		// eslint-disable-next-line lodash/prefer-lodash-typecheck
		if (!(e instanceof Error)) {
			throw e;
		}

		return res.status(500).json({ error: e.message || "" });
	}
};
