import { ReactNode, useState } from "react";
import BoardLayout from "../components/layout/BoardLayout";
import { AnimatePresence, m } from "framer-motion";

const container = {
	hidden: {
		//scale: 0.95,
		borderRadius: "0.75rem",
	},
	show: {
		//scale: 1,
		borderRadius: "0px",
		transition: {
			delay: 2,
		},
	},
};

const iframe = {
	hidden: {
		filter: "blur(16px)",
	},
	show: {
		filter: "none",
		transition: {
			delay: 2,
		},
	},
};

function FigJam({ src }: { src: string }) {
	const [loading, setLoading] = useState(true);

	return (
		<AnimatePresence>
			<m.div
				variants={container}
				key={"iframe-container"}
				initial="hidden"
				animate={loading ? "hidden" : "show"}
				className="-z-1 fixed top-0 left-0 h-[100vh] w-[100vw] overflow-hidden border"
				onLoad={() => setLoading(false)}
			>
				{loading && (
					<m.svg
						transition={{ delay: 1 }}
						width="32"
						height="32"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g className="spinner_OSmW">
							<rect
								x="11"
								y="1"
								width="2"
								height="5"
								opacity=".14"
							/>
							<rect
								x="11"
								y="1"
								width="2"
								height="5"
								transform="rotate(30 12 12)"
								opacity=".29"
							/>
							<rect
								x="11"
								y="1"
								width="2"
								height="5"
								transform="rotate(60 12 12)"
								opacity=".43"
							/>
							<rect
								x="11"
								y="1"
								width="2"
								height="5"
								transform="rotate(90 12 12)"
								opacity=".57"
							/>
							<rect
								x="11"
								y="1"
								width="2"
								height="5"
								transform="rotate(120 12 12)"
								opacity=".71"
							/>
							<rect
								x="11"
								y="1"
								width="2"
								height="5"
								transform="rotate(150 12 12)"
								opacity=".86"
							/>
							<rect
								x="11"
								y="1"
								width="2"
								height="5"
								transform="rotate(180 12 12)"
							/>
						</g>
					</m.svg>
				)}
				<m.iframe
					key={"iframe"}
					variants={iframe}
					initial="hidden"
					animate={loading ? "hidden" : "show"}
					className="absolute top-[-10vh] h-[120vh] w-[112vw]"
					onLoad={() => setLoading(false)}
					src={src}
					allowFullScreen={false}
				></m.iframe>
			</m.div>
		</AnimatePresence>
	);
}

function Board() {
	return (
		<div>
			<FigJam src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F8zywdT1mcJEeD56SMQjZMa%2Fmatteing.com's-board%3Fnode-id%3D0%253A1%26t%3D1FwpGtZB1Ze2TDkR-1"></FigJam>
		</div>
	);
}

Board.getLayout = (element: ReactNode) => <BoardLayout>{element}</BoardLayout>;

export default Board;
