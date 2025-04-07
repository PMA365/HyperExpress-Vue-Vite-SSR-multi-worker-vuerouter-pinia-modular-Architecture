import { defineStore } from "pinia";

export const useHomeStore = defineStore("homeStore", {
	state: () => ({
		title: "Home Module",
		/** @type {string[]} items */
		items: [],
	}),
	getters: {
		/**
		 * @typedef {Object} HomeState
		 * @property {string} title
		 * @property {string[]} items
		 * @param {HomeState} state
		 * @returns {number}
		 */
		itemCount: (state) => state.items.length,
	},
	actions: {
		async fetchItems() {
			// Simulate API call
			const response = await new Promise((resolve) => {
				setTimeout(() => {
					resolve(["Item 1", "Item 2", "Item 3"]);
				}, 500);
			});

			this.items = response;
		},
	},
});
export default function registerStore() {
	return useHomeStore;
}