import Renderer, { Mobiledoc } from "@bustle/mobiledoc-vdom-renderer";
import { createElement } from "react";
import Prose from "../../components/Prose";
import ImageCard from "../../components/ghost-renderer/ImageCard";
import { MobiledocGetter } from "../../types";
import CodeCard from "../../components/ghost-renderer/CodeCard";
import EmbedCard from "../../components/ghost-renderer/EmbedCard";
import UnknownCard from "../../components/ghost-renderer/UnknownCard";

const cards: { [key: string]: MobiledocGetter } = {
	image: ({ payload, key }) => <ImageCard key={key} payload={payload} />,
	code: ({ payload, key }) => <CodeCard key={key} payload={payload} />,
	embed: ({ payload, key }) => <EmbedCard key={key} payload={payload} />,
	hr: ({ key }) => <hr key={key} />,
};

const render = Renderer({
	createElement,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getCardComponent: (type) => {
		const getter = cards[type];
		if (!getter) return <UnknownCard />;
		return getter;
	},
	getAtomComponent: () => "span",
});

export default function GhostRenderer({ mobiledoc }: { mobiledoc: Mobiledoc }) {
	return <Prose>{render(mobiledoc)}</Prose>;
}
