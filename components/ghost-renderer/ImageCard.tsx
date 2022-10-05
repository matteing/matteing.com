import { ImageFigure } from "../PostFigure";

export interface ImageCardPayload {
	src: string;
	width: number;
	height: number;
	caption: string;
	cardWidth: "" | "wide" | "full";
	blurDataURL?: string;
}

function getClassForImageCard(payload: ImageCardPayload) {
	switch (payload.cardWidth) {
		case "wide":
			return "";
		default:
			return "p-6 md:p-6 lg:p-16";
	}
}
export default function ImageCard({ payload }: { payload: ImageCardPayload }) {
	if (payload.width !== undefined && payload.height !== undefined) {
		return (
			<div
				className={
					payload.cardWidth === ""
						? "text-base lg:my-24 lg:scale-110"
						: ""
				}
			>
				<ImageFigure
					className={getClassForImageCard(payload)}
					objectFit={
						payload.cardWidth === "wide" ? "cover" : "contain"
					}
					alt={payload.caption}
					width={payload.width}
					height={payload.height}
					placeholder={
						payload.blurDataURL !== undefined ? "blur" : undefined
					}
					blurDataURL={payload.blurDataURL}
					src={payload.src}
				/>
			</div>
		);
	} else {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={payload.src} alt={payload.caption} />;
	}
}
