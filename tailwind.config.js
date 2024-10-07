import flowbitePlugin from "flowbite/plugin";

export default {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				// flowbite-svelte
				primary: {
					50: "#fffcea",
					100: "#fff5c5",
					200: "#ffec85",
					300: "#ffdb46",
					400: "#ffc81b",
					500: "#ffa600",
					600: "#e27d00",
					700: "#bb5602",
					800: "#984208",
					900: "#7c370b",
					950: "#481b00",
				},
			},
		},
	},

	plugins: [flowbitePlugin],
};
