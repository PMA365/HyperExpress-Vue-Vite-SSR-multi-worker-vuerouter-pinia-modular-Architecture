import {
	createMemoryHistory,
	createRouter as _createRouter,
	createWebHistory,
} from "vue-router";

import { moduleRoute as homeModuleRoutes } from "../modules/home/router.js";
import { moduleRoute as productsModuleRoutes } from "../modules/products/router.js";
/**
 * @type {import("vue-router").RouteRecordRaw[]} routes
 */
const routes = [
	{
		path: "/404",
		name: "NotFound",
		component: () => import("../modules/404/views/NotFound.vue"),
		meta: {
			title: "404 ",
			description: "This is the 404 page",
		},
	},
	{
		path: "/:catchAll(.*)",
		redirect: "/404",
	},
];
routes.push(...homeModuleRoutes);
routes.push(...productsModuleRoutes);

export function createRouter() {
	// console.log("routes inside createRouter");
	// console.log(routes);

	return _createRouter({
		history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
		routes: routes,
	});
}

export default { createRouter };
