import { AnimatePresence, m } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useNowPlaying, useTopTracks } from "../lib/swr";
import { Track } from "../types";
import SpotifyLogo from "./SpotifyLogo";

function AlbumCover({
	track,
	nowPlaying = false,
	...props
}: { track: Track; nowPlaying?: boolean } & Partial<ImageProps>) {
	return (
		<div
			className={`relative isolate h-[225px] w-[225px] shrink-0 rounded-lg drop-shadow-2xl ${
				nowPlaying
					? "ring-4 ring-green-500 ring-offset-8 ring-offset-gray-900 drop-shadow-2xl"
					: ""
			}`}
		>
			<Image
				{...props}
				width="225"
				height="225"
				className="z-10 rounded-lg"
				placeholder="blur"
				blurDataURL={track.blurAlbumImageUrl}
				src={track.albumImageUrl}
				alt={track.title}
			/>
		</div>
	);
}

function AlbumSkeleton() {
	return (
		<div className="slide shrink-0">
			<div className="mb-6">
				<div
					className={`h-[210px] w-[210px] shrink-0 animate-pulse rounded-lg bg-green-900 drop-shadow-2xl`}
				></div>
			</div>
			<p className="flex w-[225px] flex-col items-center text-center text-base leading-tight">
				<span className="block h-[1rem] w-[100px] animate-pulse rounded-lg bg-gray-700"></span>
				<span className="mt-1 block h-[1rem] w-[50px] animate-pulse rounded-lg bg-gray-700"></span>
			</p>
		</div>
	);
}

export default function SpotifyLibrary() {
	const { data: nowPlaying, error: nowPlayingError } = useNowPlaying();
	const { data: topTracks, error: topTracksError } = useTopTracks();
	const { isPlaying } = nowPlaying ?? { isPlaying: false };
	const { tracks } = topTracks ?? { tracks: undefined };

	const skeletonTracks = Array(20)
		.fill(0)
		.map((x, idx) => <AlbumSkeleton key={idx} />);

	if (nowPlayingError || topTracksError) return null;

	return (
		<div className="spotify-widget relative isolate mb-24 flex h-[500px] justify-center gap-16 overflow-hidden rounded-xl border-gray-100 bg-gray-900">
			<div className="absolute top-5 left-5 z-20 flex items-center gap-4">
				<SpotifyLogo />
				<div>
					<span className="text-xs font-light uppercase tracking-widest text-gray-200">
						{isPlaying ? "Now Playing" : "Top This Month"}
					</span>
				</div>
			</div>
			<div className="radial-edges pointer-events-none absolute z-10 h-full w-full"></div>
			<AnimatePresence initial={false}>
				{isPlaying && nowPlaying ? (
					<>
						<m.div
							key="background"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="radial absolute z-10 h-full w-full"
						></m.div>
						<m.a
							key={nowPlaying.title}
							initial={{ opacity: 0 }}
							animate={{
								opacity: 1,
							}}
							exit={{ opacity: 0 }}
							className="absolute top-[calc(50%-135px)] z-20"
							href={nowPlaying.songUrl}
							target="_blank"
						>
							<div className="scalable isolate cursor-pointer rounded-lg">
								<div className="relative flex -rotate-6 flex-col gap-6 text-center">
									<span className="absolute -right-6 -top-6 z-10 flex h-9 w-9">
										<span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
										<span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-500 bg-gray-800">
											<div className="now-playing-icon">
												<span />
												<span />
												<span />
											</div>
										</span>
									</span>
									<AlbumCover track={nowPlaying} nowPlaying />
									<p
										className="text-base leading-tight"
										style={{ maxWidth: 225 }}
									>
										<span className=" text-white">
											{nowPlaying.title}
										</span>
										<br />
										<span className=" text-gray-400">
											{nowPlaying.artist}
										</span>
									</p>
								</div>
							</div>
						</m.a>
					</>
				) : null}
			</AnimatePresence>
			<div
				className={
					"slide-track mt-28 flex gap-8" +
					(isPlaying ? " animation-paused" : "")
				}
			>
				{!tracks && skeletonTracks}
				{tracks &&
					[...tracks, ...tracks].map((track, idx) => (
						<m.a
							key={idx}
							className="slide scalable shrink-0 cursor-pointer transition-transform"
							href={track.songUrl}
							target="_blank"
						>
							<div className="mb-6">
								<AlbumCover track={track} />
							</div>
							<p className="w-[225px] text-center text-base leading-tight">
								<span className=" text-white">
									{track.title}
								</span>
								<br />
								<span className=" text-gray-400">
									{track.artist}
								</span>
							</p>
						</m.a>
					))}
			</div>
		</div>
	);
}
