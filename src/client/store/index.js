import { createPinia } from "pinia";
import { initializeModuleStores } from "./loader";

// Create the Pinia instance
export const pinia = createPinia();

/**
 * Setup all stores for the application
 * This should be called during app initialization
 * @param {import('vue').App} app - Vue application instance
 */
export function setupStore(app) {
	// Register Pinia with the app
	app.use(pinia);

	// Initialize all module stores
	const stores = initializeModuleStores();
	console.debug(`Initialized ${stores.length} stores`);

	return {
		pinia,
		stores,
	};
}

/**
 * Get a specific store by ID
 * @param {string} storeId - The ID of the store to retrieve
 * @returns {Object|null} The store instance or null if not found
 */
export function getStoreById(storeId) {
	try {
		// This leverages Pinia's built-in store retrieval
		return pinia._s.get(storeId) || null;
	} catch (error) {
		console.error(`Failed to get store "${storeId}":`, error);
		return null;
	}
}

// Export a default object for easier imports
export default {
	pinia,
	setupStore,
	getStoreById,
};
