const Home = () => import("./views/index.vue");
const Module = () => import("./Module.vue");
const Product = () => import("./views/Product.vue");
export const moduleRoute = [
	{
		path: "/products",
		name: "products-module",
		component: Module,
		children: [
			{
				path: "/",
				name: "products",
				component: Home,
			},

			{
				path: ":id",
				name: "product",
				component: Product,
			},
		],
	},
];
