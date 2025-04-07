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

	// Serialize Pinia state
	const state = JSON.stringify(pinia.state.value);
	// Return both HTML and state
	return { html, state };
}
