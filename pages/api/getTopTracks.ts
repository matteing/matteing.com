/* eslint-disable @typescript-eslint/no-explicit-any */
import { NEXT_PUBLIC_MUSIC_SERVICE } from "../../config";
import { getTopTracks as getTopTracksSpotify } from "../../lib/spotify";
import {
	getRecentTracks as getRecentTracksAppleMusic,
	getRecentResources as getRecentResourcesAppleMusic,
} from "../../lib/apple-music";
import { getPlaiceholder } from "plaiceholder";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		if (NEXT_PUBLIC_MUSIC_SERVICE === "apple-music") {
			const [tracksResponse, resourcesResponse] = await Promise.all([
				getRecentTracksAppleMusic(),
				getRecentResourcesAppleMusic(),
			]);
			const { data } = await tracksResponse.json();
			const { data: resources } = await resourcesResponse.json();
			const playlistsInRotation = resources
				.filter((resource: any) => resource.type === "playlists")
				.slice(0, 3);
			const tracks = [...playlistsInRotation, ...data]
				.slice(0, 10)
				.filter(
					(track: any) =>
						track?.attributes &&
						track?.attributes?.url &&
						track?.attributes?.artwork
				)
				.map((track: any) => ({
					artist:
						track.type === "playlists"
							? "Playlist"
							: track.attributes.artistName,
					songUrl: track.attributes.url,
					title: track.attributes.name,
					albumImageUrl: track.attributes.artwork.url.replace(
						"{w}x{h}",
						"1000x1000"
					),
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
			return res
				.status(200)
				.json({ tracks: [...firstHalf, ...secondHalf] });
		} else if (NEXT_PUBLIC_MUSIC_SERVICE === "spotify") {
			const response = await getTopTracksSpotify();
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

			return res
				.status(200)
				.json({ tracks: [...firstHalf, ...secondHalf] });
		}
	} catch (e) {
		// eslint-disable-next-line lodash/prefer-lodash-typecheck
		if (!(e instanceof Error)) {
			throw e;
		}

		return res.status(500).json({ error: e.message || "" });
	}
};
