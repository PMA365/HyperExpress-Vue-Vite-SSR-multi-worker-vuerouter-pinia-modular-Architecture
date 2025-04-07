import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { createRouter } from "./router/router.js"; // importing router
import App from "../client/App.vue";
import { initializeModuleStores } from "./store/loader";
// import { registerModules } from "./register-modules";

// import homeModule from "./modules/home/index.js";
// try {
// 	registerModules({
// 		home: homeModule,
// 	});
// } catch (error) {
// 	console.error("Error registering modules:", error);
// }

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
	const app = createSSRApp(App);

	// const router = createRouter();
	// Setup store with all registered modules
	// const { pinia } = setupStore(app);
	const pinia = createPinia();
	const router = createRouter();
	// Register Pinia
	app.use(pinia);
	// Register router
	app.use(router);

	// Initialize all module stores
	initializeModuleStores();

	return { app, router, pinia };
}
// Mount app when running in browser
if (typeof window !== "undefined") {
	const { app, pinia } = createApp();

	// Hydrate state if available
	// @ts-ignore
	if (window.__INITIAL_STATE__) {
		// @ts-ignore
		pinia.state.value = JSON.parse(window.__INITIAL_STATE__);
	}

	// Wait for router to be ready before mounting
	app.mount("#app");
}
