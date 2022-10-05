import { Mobiledoc } from "@bustle/mobiledoc-vdom-renderer";
import { PostOrPage } from "@tryghost/content-api";
import { NextPage } from "next";
import { AppProps } from "next/app";
import { PropsWithChildren, ReactElement, ReactNode } from "react";

// TODO: Replate with Layouts RFC once it's out...
// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	// eslint-disable-next-line no-unused-vars
	getLayout?: (page: ReactElement) => ReactNode;
};

type CamelizeString<T extends PropertyKey> = T extends string
	? string extends T
		? string
		: T extends `${infer F}_${infer R}`
		? `${F}${Capitalize<CamelizeString<R>>}`
		: T
	: T;

type Camelize<T> = { [K in keyof T as CamelizeString<K>]: T[K] };

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
	postLayout:
		| "feature-image"
		| "large-feature-image"
		| "dark-large-feature-image";
	excerpt: string;
	singleLiner?: string;
	body: string; // Mobiledoc
	featured?: boolean;
	featureImage?: string;
	featureImageFit?: string;
	featureImagePosition?: string;
	featureImageBlur?: string;
	createdAt: string; // has to be a string or getStaticProps screams at you.
}

export type AdminPostOrPage = PostOrPage & {
	mobiledoc: string;
	visibility: "public" | "members" | "none";
};
export interface GhostPost
	extends Camelize<Omit<AdminPostOrPage, "mobiledoc">> {
	mobiledoc: Mobiledoc;
	plaintext: string | null;
	postLayout:
		| "feature-image"
		| "large-feature-image"
		| "dark-large-feature-image";
	singleLiner?: string;
	featureImageFit?: string;
	featureImagePosition?: string;
	featureImageBlur?: string;
}
// eslint-disable-next-line no-unused-vars
export type MobiledocGetter = (props: {
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
	payload: any;
	key: string;
}) => React.ReactNode;
