import { config } from "../../package.json";
import { getLocaleID, getString } from "../utils/locale";


export function registerPrefsWindow() {
	Zotero.PreferencePanes.register({
		pluginID: config.addonID,
		src: rootURI + "chrome/content/preferences.xhtml",
		label: getString("prefs-title"),
		image: `chrome://${config.addonRef}/content/icons/favicon.svg`,
	});
}

export async function registerPrefsScripts(_window: Window) {
	addon.data.prefs.window = _window
	buildPrefsUI()
	bindPrefEvents()
}

async function buildPrefsUI() {
	const doc = addon.data.prefs.window?.document;
	if (!doc) return;

	const renderLock = ztoolkit.getGlobal("Zotero").Promise.defer();
	await renderLock.promise;
}

function bindPrefEvents() {

}