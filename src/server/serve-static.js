import fs from "node:fs/promises";
import LiveDirectory from "live-directory";
import { MiddlewareNext, Request, Response } from "hyper-express";

/**
 *
 * @param {string} path
 * @type {string} path
 * @returns {LiveDirectory}
 */
export const createLiveDirectory = (path) =>
	new LiveDirectory(path, {
		// Optional: Configure filters to ignore or include certain files, names, extensions etc etc.
		filter: {
			keep: {
				// Something like below can be used to only serve images, css, js, json files aka. most common web assets ONLY
				extensions: ["css", "js", "json", "png", "jpg", "jpeg", "svg"],
			},
			/**
			 *
			 * @param {string} path
			 * @returns {string}
			 */
			ignore: (path) => {
				return path.startsWith(".");
			},
		},

		// Customize how LiveDirectory caches content under the hood.
		cache: {
			// The parameters below can be tuned to control the total size of the cache and the type of files which will be cached based on file size
			// For example, the below configuration (default) should cache most <1 MB assets but will not cache any larger assets that may use a lot of memory
			max_file_count: 250, // Files will only be cached up to 250 MB of memory usage
			max_file_size: 1024 * 1024, // All files under 1 MB will be cached
		},
	});
/**
 *
 * @param {LiveDirectory} directory
 *
 * @returns {MiddlewareNext}
 */
export const staticMiddleware = (directory) => {
	/**
	 * The middleware function that serves static files.
	 *
	 * @async
	 * @param {Request} request - The incoming request object.
	 * @param {Response} response - The outgoing response object.
	 * @param {MiddlewareNext} next - The next middleware function in the chain.
	 * @returns {Promise<void>} A promise that resolves when the middleware function has completed.
	 */
	return async (request, response, next) => {
		const file = directory.get(request.path);

		// Bypass if no file was passed.
		if (typeof file === "undefined") {
			next();
			return;
		}

		const fileParts = file.path.split(".");
		const extension = fileParts[fileParts.length - 1];

		// Retrieve the file content and serve it depending on the type of content available for this file.
		const content = file.content;
		if (content instanceof Buffer) {
			// Set appropriate mime-type and serve file content Buffer as response body (This means that the file content was cached in memory).
			response.type(extension).send(content);
		} else {
			// Set the type, read the file and send / stream the content as the response body (This means that the file content was NOT cached in memory).

			if (extension === "js") {
				// LiveDirectory examples suggest to always stream the content, but it won't work in Vite+Vue SSR mode for js files.
				const fromFile = await fs.readFile(file.path, "utf8");
				response.type(extension).send(fromFile);
			} else {
				response.type(extension).stream(file.stream());
			}
		}
		next();
	};
};
