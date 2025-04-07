import { useHomeStore } from "./homeStore";
import registerRoutes from "../router";
import registerStore from "./homeStore";
import { registerModuleStore } from "../../../store/loader";

export default {
	// Initialize or register module-specific store logic here
	// const homeStore = useHomeStore();

	// // You could do initial setup here if needed
	// // For example, prefetch data that should be available immediately

	// return {
	// 	homeStore,
	// };
	registerModule(router) {
		// Register routes
		registerRoutes(router);

		// Register store on Main store
		registerModuleStore(registerStore);
	},
};
