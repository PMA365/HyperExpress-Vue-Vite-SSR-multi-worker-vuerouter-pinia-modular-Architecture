import { renderToString } from "vue/server-renderer";
import { createApp } from "./main.js";

/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {string} _url
 * @returns {Promise<{ html: string, state: string }>}
 */
export async function render(_url) {
	const { app, pinia } = createApp();

	// passing SSR context object which will be available via useSSRContext()
	// @vitejs/plugin-vue injects code into a component's setup() that registers
	// itself on ctx.modules. After the render, ctx.modules would contain all the
	// components that have been instantiated during this render call.
	const ctx = {};
	const html = await renderToString(app, ctx);

	pinia.state.value = {};
	// Initialize the Pinia store on the server-side
	if (typeof window === "undefined") {
		console.log("🚀 ~ render ~ window:", typeof window);
		// Server-side code
		console.log("initiate pinia server side");
		pinia.state.value = {};
	}
	// Serialize Pinia state
	const state = JSON.stringify(pinia.state.value);
	// Return both HTML and state
	return { html, state };
}
