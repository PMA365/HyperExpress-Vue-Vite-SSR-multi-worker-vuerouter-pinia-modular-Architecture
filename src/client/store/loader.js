import { markRaw } from "vue";

// This will be populated with module store registrations
/** @type {Function[]} */
const moduleStores = [];

// Track initialized stores to prevent duplicates
const initializedStores = new Set();
// Map to associate store setup functions with their names
const storeNames = new Map();

/**
 * Register a module's store setup function
 * @param {string} name  Name of the module
 * @param {Function} storeSetup - Function that sets up and returns a store

 */
export function registerModuleStore(name, storeSetup) {
	if (typeof storeSetup !== "function") {
		console.error("Store setup must be a function");
		return;
	}
	// Check if this name is already registered
	if (initializedStores.has(name)) {
		console.warn(`A store with name "${name}" is already registered`);
		return;
	}

	// Store the name association
	storeNames.set(storeSetup, name);

	// Prevent duplicate registrations
	if (!moduleStores.includes(storeSetup)) {
		moduleStores.push(storeSetup);
		initializedStores.add(name);
		console.debug(
			`Store "${name}" registered, total stores: ${moduleStores.length}`
		);
	}
}
/**
 * Initialize all registered stores
 * @returns {import('pinia').Store[]}
 */
export function initializeModuleStores() {
	// console.debug(`Initializing ${moduleStores.length} module stores`);

	return moduleStores
		.map((setupFn) => {
			try {
				const store = setupFn();

				// Track initialized store by name to prevent duplicates
				const storeName = store.$id;
				if (initializedStores.has(storeName)) {
					console.warn(`Store "${storeName}" was already initialized`);
				} else {
					initializedStores.add(storeName);
				}

				return markRaw(store);
			} catch (error) {
				console.error("Failed to initialize store:", error);
				return null;
			}
		})
		.filter(Boolean); // Remove any null entries from failed initializations
}

/**
 * Reset all store registrations (useful for testing)
 */
export function resetStoreRegistrations() {
	moduleStores.length = 0;
	initializedStores.clear();
	console.debug("Store registrations have been reset");
}

/**
 * Get the count of registered stores
 * @returns {number} Number of registered stores
 */
export function getRegisteredStoreCount() {
	return moduleStores.length;
}
