// const Module = () => import("./Module.vue");
// // import vuejs pages
// const Home = () => import("./views/Home.vue");

// const moduleRouter = () => ({
// 	path: "/",
// 	name: "home-module",
// 	component: Module,
// 	/**
// 	 * Module-level guard: called before entering the route.
// 	 *
// 	 * @param {Object} to - The target route object.
// 	 * @param {Object} from - The current route object.
// 	 * @param {Function} next - The function to call to proceed with the route transition.
// 	 */
// 	beforeEnter: (to, from, next) => {
// 		// Module-level guard
// 		next();
// 	},
// 	children: [
// 		{
// 			path: "/",
// 			name: "Home",
// 			component: Home,
// 			meta: {
// 				title: "Home Page",
// 				requiresAuth: false,
// 			},
// 		},
// 	],
// });
// export default (router) => {
// 	router.addRoutes([moduleRouter]);
// };

const Home = () => import("./views/Home.vue");

export const moduleRoute = [
	{
		path: "/",
		name: "Home",
		component: Home,
		meta: {
			title: "Home Page",
			description: "This is the home page",
			requiresAuth: false,
		},
	},
];
// const module = {
// 	// ... other properties ...
// 	route: moduleRoute,
// };

// export function createRouter() {
// 	const router = createRouter({
// 		history: createWebHistory(),
// 		routes,
// 	});

// return router;
// }

// export default { createRouter };
/** @param {import("vue-router").Router} router */
// export default (router) => {
// 	// Add each route individually
// 	moduleRoute.forEach((route) => router.addRoute(route));
// };
export default { moduleRoute };
