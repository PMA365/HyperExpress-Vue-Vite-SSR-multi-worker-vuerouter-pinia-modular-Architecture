const moduleRoute = {
	path: "/auth",
	component: Module,
	children: [
		{
			path: "/login",
			component: Home,
		},

		{
			path: "/signup",
			component: Product,
		},
	],
};
export default (router) => {
	// Add each route individually
	moduleRoute.forEach((route) => router.addRoute(route));
};
