// exitHandler.js
function onExit(signal) {
	console.log(`Received ${signal}. Cleaning up...`);
	// Perform your cleanup logic here
	// cleaning workers
	// workers.forEach((worker) => worker.terminate());
	process.exit(0);
}
function setupExitHandlers(workers = []) {
	const cleanup = () => {
		console.log("Received SIGINT. Cleaning up...");

		// Terminate all workers
		if (workers && workers.length) {
			console.log(`Terminating ${workers.length} workers...`);
			workers.forEach((worker) => {
				try {
					worker.terminate();
				} catch (err) {
					console.error("Error terminating worker:", err);
				}
			});
		}

		// Other cleanup code...

		process.exit(0);
	};
	// Set up signal handlers
	process.on("SIGINT", () => onExit("SIGINT"));
	process.on("SIGTERM", () => onExit("SIGTERM"));

	// Optional: handle uncaught exceptions
	process.on("uncaughtException", (err) => {
		console.error("Uncaught exception:", err);
		cleanup();
	});
}
export { onExit, setupExitHandlers };
