// import registerRoutes from "./router";
import moduleStore from "./store/homeStore.js"; // catche our module store
// import { registerModuleStore } from "../../store/loader";
import moduleRouter from "./router.js";
export default {
	// Export the store directly
	store: moduleStore,

	// Export the router directly
	router: moduleRouter,
};
