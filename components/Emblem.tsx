export default function Emblem({
	dimensionMult = 3,
	strokeWidth = 12,
}: {
	dimensionMult?: number;
	strokeWidth?: number;
}) {
	return (
		<svg
			width={103 * dimensionMult}
			height={53 * dimensionMult}
			viewBox="0 0 412 212"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M105.93 205.992C161.12 205.992 205.86 161.251 205.86 106.062C205.86 50.8719 161.12 6.1318 105.93 6.1318C50.7401 6.1318 6 50.8719 6 106.062C6 161.251 50.7401 205.992 105.93 205.992Z"
				stroke="currentColor"
				stroke-width={strokeWidth}
				stroke-miterlimit="10"
			/>
			<path
				d="M306.054 205.992C361.244 205.992 405.984 161.251 405.984 106.062C405.984 50.8719 361.244 6.1318 306.054 6.1318C250.865 6.1318 206.125 50.8719 206.125 106.062C206.125 161.251 250.865 205.992 306.054 205.992Z"
				stroke="currentColor"
				stroke-width={strokeWidth}
				stroke-miterlimit="10"
			/>
			<path
				d="M105.931 6.1318L205.86 106.062"
				stroke="currentColor"
				stroke-width={strokeWidth}
				stroke-miterlimit="10"
			/>
			<path
				d="M205.86 106.062L305.922 6"
				stroke="currentColor"
				stroke-width={strokeWidth}
				stroke-miterlimit="10"
			/>
			<path
				d="M205.86 106.062L305.922 206.124"
				stroke="currentColor"
				stroke-width={strokeWidth}
				stroke-miterlimit="10"
			/>
			<path
				d="M205.86 106.062L105.931 205.992"
				stroke="currentColor"
				stroke-width={strokeWidth}
				stroke-miterlimit="10"
			/>
		</svg>
	);
}
