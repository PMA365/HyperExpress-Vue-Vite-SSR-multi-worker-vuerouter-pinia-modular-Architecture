import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"; // for recognising .vue format files

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		sentryVitePlugin({
			org: "freelancer-0vv",
			project: "hyperexpress-vite-ssr",
		}),
	],

	build: {
		sourcemap: true,
	},
	ssr: {
		noExternal: ["some-dependency"], // Prevent listed dependencies from being externalized for SSR
		external: ["another-dependency"], // Externalize the given dependencies and their transitive dependencies for SSR
		target: "node", // Set the target for the SSR build to a node environment
		// You can also set ssr.target to 'webworker' for Web Worker environments
	},
});
