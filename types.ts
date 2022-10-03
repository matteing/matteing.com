import { NextPage } from "next";
import { AppProps } from "next/app";
import { PropsWithChildren, ReactElement, ReactNode } from "react";

// TODO: Replate with Layouts RFC once it's out...
// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	// eslint-disable-next-line no-unused-vars
	getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

export interface NowPlayingResponse extends Track {
	isPlaying: boolean;
}

export interface TopTracksResponse {
	tracks: Track[];
}

export interface Track {
	artist: string;
	songUrl: string;
	title: string;
	albumImageUrl: string;
	blurAlbumImageUrl: string;
}

export type BaseProps = PropsWithChildren & { className?: string };

export interface RawPostMatter {
	slug: string;
	content: string;
	data: Partial<Post>;
}

export interface Post {
	slug: string;
	title: string;
	status: "published" | "unpublished" | "unlisted";
	tags: string[];
	postLayout: "feature-image" | "large-feature-image";
	excerpt: string;
	singleLiner?: string;
	body: string;
	featured?: boolean;
	featureImage?: string;
	featureImageFit?: string;
	featureImagePosition?: string;
	featureImageBlur?: string;
	createdAt: string; // has to be a string or getStaticProps screams at you.
}
