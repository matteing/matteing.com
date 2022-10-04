/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
	darkMode: "class",
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./posts/**/*.mdx",
	],
	theme: {
		fontSize: {
			xs: defaultTheme.fontSize.sm,
			sm: defaultTheme.fontSize.base,
			base: defaultTheme.fontSize.lg,
			lg: defaultTheme.fontSize.xl,
			xl: defaultTheme.fontSize["2xl"],
			"2xl": defaultTheme.fontSize["3xl"],
			"3xl": defaultTheme.fontSize["4xl"],
			"4xl": defaultTheme.fontSize["5xl"],
			"5xl": defaultTheme.fontSize["6xl"],
			"6xl": defaultTheme.fontSize["7xl"],
			"7xl": defaultTheme.fontSize["8xl"],
			"8xl": defaultTheme.fontSize["9xl"],
			"9xl": ["10rem", { lineHeight: "1" }],
		},
		extend: {
			colors: {
				gray: {
					50: "#f7f3f2",
					100: "#e5e0df",
					200: "#cac5c4",
					300: "#ada8a8",
					400: "#8f8b8b",
					500: "#726e6e",
					600: "#565151",
					700: "#3c3838",
					800: "#272525",
					900: "#171414",
				},
			},
			fontFamily: {
				sans: ["Inter var", ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/line-clamp"),
	],
};
