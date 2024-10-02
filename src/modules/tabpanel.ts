import { watch } from "vue";
import { config } from "../../package.json";
import { getNotepadsApi } from "../api";
import { getLocaleID, getString } from "../utils/locale";
import { notepads, UpdateMode } from "./notepads";
import { TagElementProps } from "zotero-plugin-toolkit/dist/tools/ui";
import { listeners } from "process";
import error from "./error";

export async function registerTabpanel() {
	const tabpanel = await (await fetch(`chrome://${config.addonRef}/content/tabpanel.xhtml`)).text()
	let destroy: Function[] = [];
	Zotero.ItemPaneManager.registerSection({
		paneID: "maimemo-sync",
		pluginID: config.addonID,
		sidenav: {
			icon: `chrome://${config.addonRef}/content/icons/favicon.svg`,
			l10nID: getLocaleID("tabpanel-sidenav"),
		},
		header: {
			icon: `chrome://${config.addonRef}/content/icons/favicon.svg`,
			l10nID: getLocaleID("tabpanel-header"),
		},
		bodyXHTML: tabpanel,
		onRender: async ({ body }) => {
			destroy = await registerTabpanelScripts(body)
		},
		onDestroy: () => {
			destroy.forEach(f => f())
		}
	})
}


export async function registerTabpanelScripts(body: HTMLDivElement) {
	const res = []

	res.push(await buildErrorlist(body));
	res.push(await buildNotepadList(body));
	res.push(await buildRefreshButton(body));
	res.push(await buildModeRadio(body));
	res.push(await buildColorFilter(body));
	res.push(await buildSyncButton(body));
	return res;
}


function getId(id: string) {
	return `zotero-tabpanel-${config.addonRef}-${id}`
}

async function buildErrorlist(body: HTMLDivElement) {
	const errorlist = body.querySelector('#' + getId("error-list"))! as XULMenuElement
	function buildErrorItem(e: string) {
		const text = ztoolkit.UI.appendElement({
			tag: "div",
			namespace: "html",
			attributes: {
				"class": "error fade-in",
			},
			children: [
				{
					tag: "svg",
					namespace: "svg",
					attributes: {
						"xmlns": "http://www.w3.org/2000/svg",
						"width": "24",
						"height": "24",
						"viewBox": "0 0 24 24",
						"fill": "#F56C6C",
					},
					children: [{
						tag: "path",
						namespace: "svg",
						attributes: {
							d: "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"
						}
					}],
				},
				{
					tag: "span",
					namespace: "html",
					attributes: {
						"class": "error-message",
						"data-l10n-id": e,
					},
				},
				{
					tag: "div",
					namespace: "html",
					attributes: {
						style: "flex-grow: 1"
					}
				},
				{
					tag: "svg",
					namespace: "svg",
					attributes: {
						"xmlns": "http://www.w3.org/2000/svg",
						"width": "24",
						"height": "24",
						"viewBox": "0 0 24 24",
						"fill": "#F56C6C",
					},
					children: [{
						tag: "path",
						namespace: "svg",
						attributes: {
							d: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
						}
					}],
					listeners: [{
						type: "click",
						listener: () => text.remove()
					}]
				}
			]
		}, errorlist) as HTMLElement
		setTimeout(() => {
			text.classList.remove("fade-in")
			text.classList.add("fade-out")
			setTimeout(() => text.remove(), 500)
		}, 5000)
	}
	error.on('throw', buildErrorItem)
	return async () => {
		error.off('throw', buildErrorItem)
	}
}

async function buildNotepadList(body: HTMLDivElement) {
	const menulist = body.querySelector('#' + getId("notepads-list"))! as XULMenuElement
	function setActiveChild(id: string | null) {
		if (id !== null) {
			menulist.firstChild?.childNodes.forEach(node => {
				const e = node as XULElement
				if (e.getAttribute("value") === id) {
					e.setAttribute("selected", "true")
					menulist.setAttribute("value", id)
					menulist.setAttribute("label", e.getAttribute("label")!)
				} else {
					e.removeAttribute("selected")
				}
			})
		} else {
			menulist.removeAttribute("value")
			menulist.setAttribute("label", getString("notepad-select-placeholder"))
		}
	}
	function buildNotepadItem() {
		menulist.childNodes.forEach(node => node.remove())
		const children = new Array<TagElementProps>()
		notepads.inner.forEach(notepad => children.push({
			tag: "menuitem",
			namespace: "xul",
			attributes: {
				label: notepad.inner.title,
				value: notepad.inner.id,
			},
		}))
		ztoolkit.UI.appendElement({
			tag: "menupopup",
			namespace: "xul",
			children,
		}, menulist)
		setActiveChild(notepads.target.value);
	}
	notepads.on("sync", buildNotepadItem);
	notepads.on("change", setActiveChild);
	menulist.addEventListener("command", e => {
		const id = (e.target as XULElement).getAttribute("value")
		notepads.setTarget(id)
	})
	await notepads.sync();
	return async () => {
		notepads.off("sync", buildNotepadItem);
		notepads.off("change", setActiveChild);
	}
}

async function buildRefreshButton(body: HTMLDivElement) {
	const button = body.querySelector('#' + getId("refresh-button"))! as HTMLButtonElement
	button.addEventListener("click", () => notepads.sync())
	return async () => { }
}

async function buildModeRadio(body: HTMLDivElement) {
	const radio = body.querySelector('#' + getId("sync-mode"))! as XULElement
	return async () => { }
}

async function buildColorFilter(body: HTMLDivElement) {
	const filter = body.querySelector('#' + getId("color-filter"))! as HTMLDivElement
	const label = body.querySelector('#' + getId("color-filter-label"))! as HTMLElement
	const selector = new ztoolkit.LargePrefObject(
		`${config.prefsPrefix}.color-filter-key`,
		`${config.prefsPrefix}.color-filter-value`,
	)
	const colors = new Set<string>()
	function calcColors(ids: string[] | number[]) {
		colors.clear();
		ids.forEach(id => {
			const { annotationColor } = Zotero.Items.get(id)
			if (annotationColor) {
				colors.add(annotationColor)
				if (!selector.hasKey(annotationColor)) {
					selector.setValue(annotationColor, false);
				}
			}
		})
	}
	async function buildColorFilterItems() {
		label.setAttribute("hidden", colors.size === 0 ? "true" : "false")
		while (filter.firstChild) { filter.firstChild.remove() }
		let count = 0;
		colors.forEach(color => {
			count += selector.getValue(color) as boolean ? 1 : 0;
			const e = ztoolkit.UI.appendElement({
				tag: "button",
				namespace: "html",
				attributes: {
					class: selector.getValue(color) as boolean ? "color-filter-button selected" : "color-filter-button",
				},
				listeners: [{
					type: "click",
					listener: () => {
						const value = e.classList.toggle("selected");
						selector.setValue(color, value)
						count += value ? 1 : -1;
						filter.classList.toggle("all", count === 0)
					}
				}],
				children: [{
					tag: "svg",
					namespace: "svg",
					attributes: {
						xmlns: "http://www.w3.org/2000/svg",
						width: "16",
						height: "16",
						viewBox: "0 0 16 16",
						fill: "none",
					},
					children: [
						{
							tag: "path",
							namespace: "svg",
							attributes: {
								d: "M1 3C1 1.89543 1.89543 1 3 1H13C14.1046 1 15 1.89543 15 3V13C15 14.1046 14.1046 15 13 15H3C1.89543 15 1 14.1046 1 13V3Z",
								fill: color,
							}
						},
						{
							tag: "path",
							namespace: "svg",
							attributes: {
								d: "M1.5 3C1.5 2.17157 2.17157 1.5 3 1.5H13C13.8284 1.5 14.5 2.17157 14.5 3V13C14.5 13.8284 13.8284 14.5 13 14.5H3C2.17157 14.5 1.5 13.8284 1.5 13V3Z",
								stroke: "black",
								"stroke-opacity": "0.1"
							}
						}
					]
				}]
			}, filter) as HTMLElement
		})
		filter.classList.toggle("all", count === 0)
	}
	const observerId = Zotero.Notifier.registerObserver({
		notify: async (event, type, ids, extraData) => {
			if (["add", "modify", "delete"].includes(event) && type === "item") {
				const reader = await ztoolkit.Reader.getReader();
				if (!reader) return;
				calcColors(reader.annotationItemIDs)
			} else if (event == 'select' && type == 'tab') {
				const reader = await ztoolkit.Reader.getReader();
				if (!reader) return;
				calcColors(reader.annotationItemIDs)
			} else {
				return;
			}
			await buildColorFilterItems()
		}
	}, ["item", "tab"], getId("color-filter"))
	const reader = await ztoolkit.Reader.getReader();
	if (reader) {
		calcColors(reader.annotationItemIDs)
		await buildColorFilterItems()
	}

	return async () => {
		Zotero.Notifier.unregisterObserver(observerId)
	}
}

async function buildSyncButton(body: HTMLDivElement) {
	const radio = body.querySelector('#' + getId("sync-mode"))! as XULElement
	const button = body.querySelector('#' + getId("sync-button"))! as HTMLButtonElement
	const selector = new ztoolkit.LargePrefObject(
		`${config.prefsPrefix}.color-filter-key`,
		`${config.prefsPrefix}.color-filter-value`,
	)
	button.addEventListener("click", async () => {
		const mode = UpdateMode[radio.getAttribute("value")! as keyof typeof UpdateMode]
		const reader = await ztoolkit.Reader.getReader()
		if (!reader) return;
		const annotationTexts = reader.annotationItemIDs.map((id: number) => Zotero.Items.get(id))
			.filter((item: Zotero.Item) => selector.getValue(item.annotationColor))
			.map((item: Zotero.Item) => item.annotationText)
		// 没有过滤时选择所有注释
		if (annotationTexts.length == 0) {
			reader.annotationItemIDs.map((id: number) => Zotero.Items.get(id))
				.forEach((item: Zotero.Item) => annotationTexts.push(item.annotationText))
		}
		notepads.getTarget()?.update(mode, annotationTexts)
	})
	return async () => { }
}