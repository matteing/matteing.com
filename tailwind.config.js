/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
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
	plugins: [],
};
