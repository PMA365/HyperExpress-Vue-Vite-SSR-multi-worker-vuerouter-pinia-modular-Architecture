import { defineStore } from "pinia";

export const useHomeStore = defineStore("homeStore", {
	state: () => ({
		title: "Home Module",
		/** @type {string[]} items */
		items: ["Hello", "from", "pinia", "store"],
		// Add these state properties to track loading status
		loading: false,
		loaded: false,
		/** @type {Error | null} error */
		error: null,
	}),
	getters: {
		/**
		 * @typedef {Object} HomeState
		 * @property {string} title
		 * @property {string[]} items
		 * @param {HomeState} state
		 * @property {boolean} loading
		 * @property {boolean} loaded
		 * @property {Error|null} error
		 * @returns {number}
		 */
		itemCount: (state) => state.items.length,
	},
	actions: {
		async fetchItems() {
			// Guard 1: Prevent duplicate requests while loading
			if (this.loading) {
				console.log("Already fetching items, request skipped");
				return;
			}
			// Guard 2: Skip if data is already loaded (optional, remove if you always want fresh data)
			if (this.loaded && this.items.length > 0) {
				console.log("Items already loaded, using cached data");
				return;
			}
			// Set loading state
			this.loading = true;
			this.error = null;
			// Simulate API call
			try {
				const response = await new Promise((resolve) => {
					setTimeout(() => {
						resolve(["Item 1", "Item 2", "Item 3"]);
					}, 500);
				});

				this.items = response;
				this.loaded = true;
			} catch (error) {
				// Handle errors properly
				/**
				 * @type {Error|null}
				 */
				const safeError = error instanceof Error ? error : null;
				console.error("Error fetching items:", error);
				this.error = safeError;
			} finally {
				this.loading = false;
			}
		},
		// Add a method to force refresh if needed
		async refreshItems() {
			// Reset loaded state to force a new fetch
			this.loaded = false;
			return this.fetchItems();
		},
	},
});
export default function registerStore() {
	return useHomeStore;
}
