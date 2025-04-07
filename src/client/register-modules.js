import { registerModuleStore } from "./store/loader.js";
/**
 *
 * @param {*} name
 * @param {*} module
 */
const registerModule = (name, module) => {
	if (module.store) {
		registerModuleStore(name, module.store);
	}
};
/**
 *
 * @param {*} modules
 */
export const registerModules = (modules) => {
	Object.keys(modules).forEach((moduleKey) => {
		const module = modules[moduleKey];
		console.log("moduleRegi");
		console.log(modules);
		registerModule(moduleKey, module);
	});
};
