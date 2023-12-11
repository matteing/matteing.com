import { Card } from "@bustle/mobiledoc-vdom-renderer/dist/module/types/Mobiledoc";
import { getPlaiceholder } from "plaiceholder";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index";
import { ImageCardPayload } from "../components/ghost-renderer/ImageCard";
import { CodeCardPayload } from "../components/ghost-renderer/CodeCard";
import { GhostPost } from "../types";
import set from "lodash/fp/set";
import { getBlurFeatureImage } from "./ghost";

loadLanguages();

export async function getBlurImageCards(cards: Card[]): Promise<Card[]> {
	return await Promise.all(
		cards.map(async (card) => {
			const [type, payload] = card;
			if (type === "image" && (payload as ImageCardPayload).src) {
				if (
					(payload as ImageCardPayload).src.includes("gif") ||
					(payload as ImageCardPayload).src.includes("blob")
				) {
					return card;
				}
				const { base64: blurDataURL } = await getPlaiceholder(
					(payload as ImageCardPayload).src
				);
				return [type, { ...payload, blurDataURL }];
			} else {
				return card;
			}
		})
	);
}

export async function getHighlightedCards(cards: Card[]): Promise<Card[]> {
	return await Promise.all(
		cards.map(async (card) => {
			const [type, payload] = card;
			if (
				type === "code" &&
				Prism.languages[(payload as CodeCardPayload).language]
			) {
				const html = await Prism.highlight(
					(payload as CodeCardPayload).code,
					Prism.languages[(payload as CodeCardPayload).language],
					(payload as CodeCardPayload).language
				);
				return [type, { ...payload, html }];
			} else {
				return card;
			}
		})
	);
}

export async function optimizeImageCards(post: GhostPost): Promise<GhostPost> {
	return set(
		"mobiledoc.cards",
		await getBlurImageCards(post.mobiledoc.cards),
		post
	);
}

export async function highlightCodeCards(post: GhostPost): Promise<GhostPost> {
	return set(
		"mobiledoc.cards",
		await getHighlightedCards(post.mobiledoc.cards),
		post
	);
}

export async function processPost(post: GhostPost): Promise<GhostPost> {
	return await highlightCodeCards(
		await optimizeImageCards(await getBlurFeatureImage(post))
	);
}
