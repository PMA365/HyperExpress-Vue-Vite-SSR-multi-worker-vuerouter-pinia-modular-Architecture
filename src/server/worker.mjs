// import { parentPort } from "worker_threads";

// const isProduction = process.env.NODE_ENV === "production";
// const templateHtml = isProduction
// 	? await fs.readFile("./dist/client/index.html", "utf-8")
// 	: "";
// parentPort.on("message", (message) => {
// 	console.log("parentPort on  log");

// 	// catch data from main thread
// 	const url = message.data.url;
// 	const ,LA = message.data.clonedVite;
// 	const vite = message.data.clonedVite;
// 	console.log(message);
// 	// const [url, vite, isProduction] = message;
// 	console.log(url);
// 	console.log(vite);

// 	// console.log(req);
// 	// console.log(isProduction);
// 	// creating the html server side rendering
// 	try {
// 		/** @type {string} */
// 		let template;
// 		/** @type {import('./src/entry-server.ts').render} */
// 		let render;
// 		if (!isProduction) {
// 			// Always read fresh template in development
// 			template = fs.readFile("./index.html", "utf-8");
// 			// template = await vite.transformIndexHtml(url, template);
// 			// render = (await vite.ssrLoadModule("/src/client/entry-server.js")).render;
// 		} else {
// 			template = templateHtml;
// 			/** @type {any} */
// 			render = import("../../dist/server/entry-server.js").render;
// 		}

// 		const rendered = render(url);

// 		const html = template
// 			.replace(`<!--app-head-->`, rendered.head ?? "")
// 			.replace(`<!--app-html-->`, rendered.html ?? "");

// 		// res.status(200);
// 		// res.header("content-type", "text/html");
// 		// res.send(html);
// 		message = html;
// 	} catch (e) {
// 		/**
// 		 * @type {Error}
// 		 */
// 		const err = e;
// 		// vite?.ssrFixStacktrace(err);
// 		console.log(err.stack);
// 		message = "";
// 	}
// 	console.log("message", message);
// 	// the message would be the whole html we need to show to user
// 	parentPort.postMessage(message);
// });
// Import necessary modules
import fs from "node:fs/promises";
import { parentPort } from "worker_threads";
import { renderToString as _renderToString } from "vue/server-renderer";
import { createSSRApp } from "vue";
// Add this import at the top
import { createPinia } from "pinia";
import { initializeModuleStores } from "../client/store/loader.js";
// Constants - moved to top for better V8 property access
const isProduction = process.env.NODE_ENV === "production";

// Cache component imports
const moduleCache = new Map();
/**
 * Initialize Vite server for server-side rendering.
 * This function is called at worker startup.
 */
let vite;
let template;
const initVite = async () => {
	// Import Vite server module
	const { createServer } = await import("vite");
	// Set base URL for Vite server
	const base = process.env.BASE || "/";

	// Create Vite server instance
	vite = await createServer({
		server: { middlewareMode: true },
		appType: "custom",
		base,
		optimizeDeps: {
			include: ["vue", "vue-router", "@vueuse/core"], // Add more common deps
			esbuildOptions: {
				target: "esnext",
			},
		},
		build: {
			target: "esnext",
			minify: "esbuild",
			rollupOptions: {
				output: {
					manualChunks: {
						"vue-vendor": ["vue", "vue-router"],
					},
				},
			},
		},
		ssr: {
			// Optimize SSR dependencies
			noExternal: ["vue-router"],
		},
	});

	return vite;
};
// Call this at worker startup
initVite().catch((err) => {
	console.error("Failed to initialize Vite:", err);
	process.exit(1);
});

/**
 * Retrieve a cached component by path.
 * @param {string} path - Path to the component
 * @returns {Promise<import('vue').DefineComponent>} - Cached component
 */
async function getComponent(path) {
	// if (moduleCache.has(path)) {
	// 	return moduleCache.get(path);
	// }
	const cached = moduleCache.get(path);
	if (cached) return cached;

	// const module = await vite.ssrLoadModule(path);

	// moduleCache.set(path, module);

	// return module;
	// Load and cache the module
	try {
		const module = await vite.ssrLoadModule(path);
		moduleCache.set(path, module);
		return module;
	} catch (error) {
		console.error(`Failed to load component ${path}:`, error);
		throw error;
	}
}

const render = async (url) => {
	// Get cached components
	const { default: App } = await getComponent("/src/client/App.vue");
	const { createRouter } = await getComponent("/src/client/router/router.js");

	const app = createSSRApp(App);
	const router = createRouter();
	app.use(router);

	// Create and use Pinia
	const pinia = createPinia();
	app.use(pinia); //pinia

	// Initialize all module stores
	initializeModuleStores();

	try {
		// Use Promise.all for parallel operations
		await Promise.all([router.push(url), router.isReady()]);

		const ctx = {};
		const html = await _renderToString(app, ctx);

		// Get initial state for hydration
		const initialState = JSON.stringify(pinia.state.value);
		// Help garbage collection
		app._container = null;
		// Return both HTML and state
		return { html, head: "", initialState };
	} catch (error) {
		console.error(`Error rendering ${url}:`, error);
		throw error;
	}
};
// let viteInstance;
// import { createViteServer } from "./vite-loader.mjs";
// async function getVite() {
// 	if (!viteInstance) {
// 		viteInstance = await createViteServer();
// 	}
// 	return viteInstance;
// }
// Cached production assets

// const templateHtml = isProduction
// 	? await fs.readFile("./dist/client/index.html", "utf-8")
// 	: "";
// Add a render cache
//For highly dynamic content, you might want to decrease it or even disable caching entirely.

async function renderHtml(url) {
	// Check cache first

	let renderedURLtoVuejs;

	try {
		/** @type {string} */
		// 1. Get template
		// let template = await getTemplate(url);
		// let template;
		if (!isProduction) {
			template = await fs.readFile("./index.html", "utf-8");
			if (vite) {
				template = await vite.transformIndexHtml(url, template);
			}
		} else {
			template = await fs.readFile("./dist/client/index.html", "utf-8");
		}
		// if (cachedItem && cachedItem.html == undefined) {
		// 	template = await getTemplate(url);
		// } else {
		// 	template = cachedItem.html;
		// }
		/** @type {import('./entry-server.js').render} */

		//  1. loading the index.html file the foundation of the html server side rendering
		// // const template = await fs.readFile(" ./index.html", "utf-8");
		// if (!isProduction) {
		// 	// Always read fresh template in development
		// 	template = await fs.readFile("./index.html", "utf-8");
		// 	template = await vite.transformIndexHtml(url, template);
		// 	/** @type {import('./entry-server.js').render} */
		// } else {
		// 	template = templateHtml;
		// }

		renderedURLtoVuejs = await render(url); // returns html

		// cody suggestion
		// renderCache.set(cacheKey, {
		// 	renderedURLtoVuejs,
		// 	timestamp: Date.now(),
		// });
		//  2. Apply Vite HTML transforms. This injects the Vite HMR client,
		//    and also applies HTML transforms from Vite plugins, e.g. global
		//    preambles from @vitejs/plugin-react
		// const transformedTemplate = await vite.transformIndexHtml(url, template);
		// const render = (await vite.ssrLoadModule("/src/client/entry-server.js"))
		// 	.render;
		//const renderedHtml = await renderToString(url);//
		// 3. Rendering url specefic vuejs file to html
		// in khate ke error mide TypeError: Optional transferList argument must be an iterable
		// at file:///C:/Users/hp%202570p/Documents/MyProjects/hyperVite2/hyper-express-vite-vue/src/server/worker.mjs:102:24
		// const { default: App } = await vite.ssrLoadModule("/src/client/App.vue");
		// const { createRouter } = await vite.ssrLoadModule(
		// 	"/src/client/router/router.js"
		// );

		// const app = createSSRApp(App);
		// const router = createRouter();

		// app.use(router);

		// router.push(url);
		// await router.isReady();
		// const ctx = {};
		// const renderedURLtoVuejs = await _renderToString(app, ctx);

		// 4. Replace the placeholders in the index.html
		const html = template
			.replace(`<!--app-head-->`, renderedURLtoVuejs.head ?? "")
			.replace(`<!--app-html-->`, renderedURLtoVuejs.html ?? "")
			// Add this line to inject the state
			.replace(
				`<!--pinia-state-->`,
				JSON.stringify(renderedURLtoVuejs.state ?? {})
			);
		// console.log("worker html created");
		// await vite.close();

		return html;
	} catch (error) {
		console.log("worker renderHtml error");
		console.log(error);
	}
}

// Improve message handling
// const requestCount = 0;
// const MAX_REQUESTS_PER_WORKER = 100; // Recycle worker after this many requests

// // Monitor memory usage
// setInterval(() => {
// 	const memoryUsage = process.memoryUsage();
// 	const memoryThresholdMB = 1024; // 1GB threshold

// 	if (memoryUsage.heapUsed / 1024 / 1024 > memoryThresholdMB) {
// 		console.warn("Worker memory threshold exceeded, notifying main thread");
// 		parentPort.postMessage({ type: "memory_warning" });
// 	}
// }, 30000);

parentPort.on("message", async (data) => {
	// requestCount++;

	// // Check if worker should be recycled
	// if (requestCount >= MAX_REQUESTS_PER_WORKER) {
	// 	parentPort.postMessage({
	// 		type: "recycle_worker",
	// 		message: "Worker reached maximum request count",
	// 	});
	// 	return;
	// }

	const { type, url, requestId, isProductionBool } = data;

	if (type === "render") {
		try {
			const html = await renderHtml(url, isProductionBool);
			parentPort.postMessage({
				type: "rendered",
				html,
				requestId,
				// timestamp: Date.now(),
			});
		} catch (err) {
			console.error(`Render error for ${url}:`, err);
			parentPort.postMessage({
				type: "error",
				message: err.message,
				stack: err.stack,
				requestId,
			});
		}
	}
});

// Add cache size limits and cleanup
// function limitCacheSize(cache, maxSize = 100) {
// 	if (cache.size > maxSize) {
// 		// Remove oldest entries
// 		const keysToDelete = Array.from(cache.keys()).slice(
// 			0,
// 			Math.floor(cache.size / 2)
// 		);

// 		keysToDelete.forEach((key) => cache.delete(key));
// 	}
// }

// // Call periodically or when adding new items
// setInterval(() => {
// 	limitCacheSize(renderCache);
// 	limitCacheSize(componentCache);
// }, 300000); // Every 5 minutes
