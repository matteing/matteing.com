import { TweetFigure } from "../PostFigure";

interface EmbedCardPayload {
	type: string;
	html: string;
	url: string;
}

export default function EmbedCard({ payload }: { payload: EmbedCardPayload }) {
	switch (payload.type) {
		case "twitter":
			const id = payload.url.split("?")[0].split("/").at(-1);
			if (!id) return null;
			return <TweetFigure tweetId={id} />;
		case "video":
			return (
				<div className="yt-embed my-12">
					<div
						dangerouslySetInnerHTML={{ __html: payload.html }}
					></div>
				</div>
			);

		default:
			return (
				<div dangerouslySetInnerHTML={{ __html: payload.html }}></div>
			);
	}
}
