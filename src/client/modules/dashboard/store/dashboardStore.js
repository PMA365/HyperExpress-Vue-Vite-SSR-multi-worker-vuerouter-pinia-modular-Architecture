import { defineStore } from "pinia";

export const addDashBoardStore = defineStore("dashboardStore", {
	state: () => {
		return {
			items: [],
		};
	},
});
