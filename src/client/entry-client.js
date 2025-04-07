import "./style.css";
import { createApp } from "./main.js";

const { app, router, pinia } = createApp();

// Hydrate state if available
// @ts-ignore
if (window.__PINIA_STATE__) {
	try {
		// @ts-ignore
		pinia.state.value = JSON.parse(window.__PINIA_STATE__);
	} catch (e) {
		console.error("Error hydrating state:", e);
	}
}
// Wait for the router to be ready before mounting
router.isReady().then(() => {
	// Mount the app
	app.mount("#app");
});
// app.mount("#app");
