// docs.sentry.io/platforms/javascript/guides/node/install/esm/
// Require this first!
import "./instrument.mjs";

// This snippet contains an intentional error and can be used as a test to
// make sure that everything's working as expected.
// try {
// 	foo();
// } catch (e) {
// 	Sentry.captureException(e);
// }
// import fs from "node:fs/promises";
import HyperExpress from "hyper-express";
import LiveDirectory from "live-directory";
import { fileURLToPath } from "node:url";
import { Worker } from "worker_threads";

import { dirname, join } from "node:path";

import * as Sentry from "@sentry/node";

import { registerModules } from "../client/register-modules.js";
import homeModule from "../client/modules/home/index.js";
try {
	registerModules({
		home: homeModule,
	});
} catch (error) {
	console.error("Error registering modules:", error);
}

// test sentry working
// try {
// 	console.log("sentry error");
// 	foo();
// } catch (e) {
// 	Sentry.captureException(e);
// }

// import { File } from "node:buffer";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// workers pool setup :
const NUM_WORKERS = 4;
const workers = [];

let currentWorker = 0;

// When creating workers, add error handling
for (let i = 0; i < NUM_WORKERS; i++) {
	const worker = new Worker(join(__dirname, "worker.mjs"), { type: "module" });
	worker.setMaxListeners(0); // Remove the limit on listeners

	// Handle worker crashes
	worker.on("error", (err) => {
		console.error(`Worker ${i} crashed:`, err);
		// Replace the crashed worker
		const newWorker = new Worker(join(__dirname, "worker.mjs"), {
			type: "module",
		});
		newWorker.setMaxListeners(0);
		workers[i] = newWorker;
	});

	workers.push(worker);
}

////////////
// let LiveAssets;

// all of this code is working in the main Thread
// blocking any other requests from resolving untill all of this work is done
// because its happening in the main thread making it async even just delayed in case sth
// else happens in the main thread first and it pushes it back to the back of the queue.
// so you can only have one of these things running at a time.
// so we should use workers
// Serve HTML
export async function main() {
	const isProduction = process.env.NODE_ENV === "production";

	// // Cached production assets
	// const templateHtml = isProduction
	// 	? await fs.readFile("./dist/client/index.html", "utf-8")
	// 	: "";

	const base = process.env.BASE || "/";
	/**
	 * @type {ViteDevServer}
	 */
	let vite;
	/**
	 * @type {LiveDirectory}
	 */

	const server = new HyperExpress.Server({
		max_body_length: 1024 * 1024, // 1MB max body size
		trust_proxy: true,
		fast_abort: true, // Abort requests when client disconnects
		fast_close: true, // Close connections faster
		// uWebSockets.js options
		open_socket_ping_interval: 30, // Ping interval in seconds
		close_socket_on_error: true,
		max_lifetime: 60 * 30, // 30 minutes max connection lifetime
		max_payload_length: 16 * 1024 * 1024, // 16MB max WebSocket message size
		// Auatoclose doesn't work properly (at least with development server) -> close in clean exit handler.
		auto_close: false,
	});

	// setup vite dev server
	if (!isProduction) {
		const { createServer } = await import("vite");

		/** @type {import('vite').ViteDevServer} */
		vite = await createServer({
			/** @type {import('vite').ViteDevServerOptions */
			server: { middlewareMode: true },
			appType: "custom",
			base,
		});

		/** @type {any} */
		server.use(vite.middlewares);
	} else {
		const { createLiveDirectory, staticMiddleware } = await import(
			"./serve-static.js"
		);
		LiveAssets = createLiveDirectory("./dist/client");
		server.use(staticMiddleware(LiveAssets));
	}

	// Serve HTML
	server.get("*", async (req, res) => {
		// const worker = new Worker(join(__dirname, "worker.mjs"), {
		// 	type: "module",
		// });
		const worker = workers[currentWorker];
		currentWorker = (currentWorker + 1) % NUM_WORKERS;

		//To improve the request-response matching, consider adding a unique ID to each request:
		const requestId = Date.now() + Math.random().toString(36).substring(2, 15);

		// To prevent hanging requests if a worker fails to respond:
		// Set a timeout to handle cases where the worker doesn't respond
		const timeoutId = setTimeout(() => {
			worker.removeListener("message", messageHandler);
			res.status(500).send("Request timed out");
			console.error(`Worker request ${requestId} timed out`);
		}, 180000); // 30 second timeout 30000 ms
		// we get the html message from the workers and send it to user
		/**
		 *
		 * @param {string} html
		 */
		const messageHandler = (event) => {
			// Only process messages for this specific request
			if (event.requestId !== requestId) return;

			// Clear the timeout since we got a response
			clearTimeout(timeoutId);

			if (event.type === "rendered") {
				const html = event.html;
				res.status(200);
				res.header("content-type", "text/html");
				res.send(html);
			} else if (event.type === "error") {
				const err = event.err;
				vite?.ssrFixStacktrace(err);
				console.log(err.stack);
				res.status(500).end(err.stack);
			}
			// Remove the listener after processing
			worker.removeListener("message", messageHandler);
		};
		// when workers done its job and send its data to main thread
		worker.on("message", messageHandler);
		// Error handling for workers
		worker.on("error", (err) => {
			console.error("Worker error:", err);
			res.status(500).send("Server error");
			// Potentially restart the worker
		});
		// start the worker
		const url = req.originalUrl.replace(base, "");
		// const url = req.originalUrl || req.url;//martinez
		worker.postMessage({ type: "render", url, requestId, isProduction });
	});
	// Set up the exit handle
	const { setupExitHandlers } = await import("./exitHandler.mjs");
	setupExitHandlers(workers);
	// Example of a long-running process
	console.log("Application is running. Press Ctrl+C to exit.");

	return server;
}

// Exit handler
/**
 * @type {(code: number | null | undefined, signal: NodeJS.Signals | null) => true | void}
 */
// const unload = onExit(
// 	/** @type {number | null | undefined} */
// 	(
// 		_code,
// 		/** @type {NodeJS.Signals | null} */
// 		signal
// 	) => {
// 		console.log("\nExit with signal", signal);

// 		if (LiveAssets) {
// 			// Typo remains in the npm package, but corrected on GitHub.
// 			LiveAssets.destory();
// 		}

// 		const exited = server.close();

// 		if (exited) {
// 			console.log("Server was closed.");
// 		} else {
// 			console.warn("There was a problem while closing server.");
// 		}

// 		unload();

// 		return exited || undefined;
// 	},
// 	{
// 		/** @type {boolean} */
// 		alwaysLast: true,
// 	}
// );

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const port = process.env.PORT ? Number(process.env.PORT) : 5173;
	const server = await main();
	// Start http server
	await server.listen(port, () => {
		console.log(`Server started at http://localhost:${port}`);
	});
}
