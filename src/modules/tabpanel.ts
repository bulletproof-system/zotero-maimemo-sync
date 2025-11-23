import { watch } from "vue";
import { config } from "../../package.json";
import { getNotepadsApi } from "../api";
import { getLocaleID, getString } from "../utils/locale";
import { notepads, UpdateMode as SyncMode } from "./notepads";
import { TagElementProps } from "zotero-plugin-toolkit/dist/tools/ui";
import { listeners } from "process";
import log from "./log";
import { getPref, setPref } from "../utils/prefs";

let destroy: Function[] = [];
export async function registerTabpanel() {
	const tabpanel = await (await fetch(`chrome://${config.addonRef}/content/tabpanel.xhtml`)).text()
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
			ztoolkit.log("Register tabpanel scripts");
			destroy.map(f => f());
			destroy = await registerTabpanelScripts(body)
		},
		onDestroy: async () => {
			ztoolkit.log("Unregister tabpanel scripts");
			destroy.map(f => f());
			destroy = [];
		}
	})
}


export async function registerTabpanelScripts(body: HTMLDivElement) {
	const res = []

	res.push(await buildErrorlist(body));
	res.push(await buildNotepadList(body));
	res.push(await buildRefreshButton(body));
	res.push(await buildSyncModeRadio(body));
	res.push(await buildSplitModeRadio(body));
	res.push(await buildColorFilter(body));
	res.push(await buildSyncButton(body));
	res.push(await buildExportButton(body));
	return res;
}


function getId(id: string) {
	return `zotero-tabpanel-${config.addonRef}-${id}`
}

async function buildErrorlist(body: HTMLDivElement) {
	const errorlist = body.querySelector('#' + getId("msg-list"))! as XULMenuElement
	function buildErrorItem(msg: string) {
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
						"class": "message",
						"data-l10n-id": msg,
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
						listener: () => {
							text.classList.remove("fade-in")
							text.classList.add("fade-out")
							setTimeout(() => text.remove(), 500)
						}
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
	function buildInfoItem(msg: string) {
		const text = ztoolkit.UI.appendElement({
			tag: "div",
			namespace: "html",
			attributes: {
				"class": "info fade-in",
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
						"fill": "#4CAF50",
					},
					children: [{
						tag: "path",
						namespace: "svg",
						attributes: {
							d: "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
						}
					}],
				},
				{
					tag: "span",
					namespace: "html",
					attributes: {
						"class": "message",
						"data-l10n-id": msg,
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
						listener: () => {
							text.classList.remove("fade-in")
							text.classList.add("fade-out")
							setTimeout(() => text.remove(), 500)
						}
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
	log.on('info', buildInfoItem)
	log.on('error', buildErrorItem)
	return () => {
		log.off('info', buildInfoItem)
		log.off('error', buildErrorItem)
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
	const handleMenulistCommand = (e: Event) => {
		const id = (e.target as XULElement).getAttribute("value")
		notepads.setTarget(id)
	}
	menulist.addEventListener("command", handleMenulistCommand)
	await notepads.sync();
	return () => {
		notepads.off("sync", buildNotepadItem);
		notepads.off("change", setActiveChild);
		menulist.removeEventListener("command", handleMenulistCommand)
	}
}

async function buildRefreshButton(body: HTMLDivElement) {
	const button = body.querySelector('#' + getId("refresh-button"))! as HTMLButtonElement
	const handleRefreshClick = () => notepads.sync()
	button.addEventListener("click", handleRefreshClick)
	return () => {
		button.removeEventListener("click", handleRefreshClick)
	}
}

async function buildSyncModeRadio(body: HTMLDivElement) {
	const radio = body.querySelector('#' + getId("sync-mode"))! as XULElement
	const mode = getPref("sync-mode") as string
	radio.setAttribute("value", mode)
	radio.childNodes.forEach(node => {
		const e = node as XULElement
		if (e.getAttribute("value") === mode) {
			e.setAttribute("selected", "true")
			const child = e.firstChild! as XULElement
			child.setAttribute("selected", "true")
		} else {
			e.removeAttribute("selected")
			const child = e.firstChild! as XULElement
			child.removeAttribute("selected")
		}
	})
	const handleSyncModeCommand = (e: Event) => {
		const mode = (e.target as XULElement).getAttribute("value") as string
		setPref("sync-mode", mode)
	}
	radio.addEventListener("command", handleSyncModeCommand)
	return () => {
		radio.removeEventListener("command", handleSyncModeCommand)
	}
}

async function buildSplitModeRadio(body: HTMLDivElement) {
	const radio = body.querySelector('#' + getId("split-mode"))! as XULElement
	const mode = getPref("split-mode") as string
	ztoolkit.log("split-mode", mode)
	radio.setAttribute("value", mode)
	radio.childNodes.forEach(node => {
		const e = node as XULElement
		if (e.getAttribute("value") === mode) {
			e.setAttribute("selected", "true")
			const child = e.firstChild! as XULElement
			child.setAttribute("selected", "true")
		} else {
			e.removeAttribute("selected")
			const child = e.firstChild! as XULElement
			child.removeAttribute("selected")
		}
	})
	const handleSplitModeCommand = (e: Event) => {
		const mode = (e.target as XULElement).getAttribute("value") as string
		setPref("split-mode", mode)
	}
	radio.removeEventListener("command", handleSplitModeCommand)
	radio.addEventListener("command", handleSplitModeCommand)
	return () => {
		radio.removeEventListener("command", handleSplitModeCommand)
	}
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

	return () => {
		Zotero.Notifier.unregisterObserver(observerId)
	}
}

async function buildSyncButton(body: HTMLDivElement) {
	const radio = body.querySelector('#' + getId("sync-mode"))! as XULElement
	const button = body.querySelector('#' + getId("sync-button"))! as HTMLButtonElement
	const handleSyncClick = async () => {
		const mode = SyncMode[radio.getAttribute("value")! as keyof typeof SyncMode]
		notepads.getTarget()?.update(mode, await getText(body))
	}
	button.addEventListener("click", handleSyncClick)
	return () => {
		button.removeEventListener("click", handleSyncClick)
	}
}

async function buildExportButton(body: HTMLDivElement) {
	const button = body.querySelector('#' + getId("export-button"))! as HTMLButtonElement
	const handleExportClick = async () => {
		const res = (await new ztoolkit.FilePicker(
			getString("tabpanel-export"),
			"save",
			[[getString("tabpanel-export", "txt"), "*.txt"]],
			"notepad.txt",
		).open())
		if (res !== false) {
			const text = await getText(body)
			const nsIFile = Zotero.File.pathToFile(res)
			Zotero.File.putContents(nsIFile, text.join("\n"))
		}
	}
	button.addEventListener("click", handleExportClick)
	return () => {
		button.removeEventListener("click", handleExportClick)
	}
}

enum SplitMode {
	Annotation = "Annotation",
	Word = "Word",
}
async function getText(body: HTMLDivElement) {
	const radio = body.querySelector('#' + getId("split-mode"))! as XULElement
	const selector = new ztoolkit.LargePrefObject(
		`${config.prefsPrefix}.color-filter-key`,
		`${config.prefsPrefix}.color-filter-value`,
	)
	const mode = SplitMode[radio.getAttribute("value")! as keyof typeof SplitMode]
	const reader = await ztoolkit.Reader.getReader()
	if (!reader) return [];
	const annotationTexts = reader.annotationItemIDs.map((id: number) => Zotero.Items.get(id))
		.filter((item: Zotero.Item) => selector.getValue(item.annotationColor))
		.map((item: Zotero.Item) => item.annotationText)
	// 没有过滤时选择所有注释
	if (annotationTexts.length == 0) {
		reader.annotationItemIDs.map((id: number) => Zotero.Items.get(id))
			.forEach((item: Zotero.Item) => annotationTexts.push(item.annotationText))
	}
	const text: string[] = []
	annotationTexts.forEach((annotation) => {
		switch (mode) {
			case SplitMode.Annotation:
				text.push(annotation);
				break;
			case SplitMode.Word:
				text.push(...annotation.split(" "));
				break;
			default:
				ztoolkit.log("Unknown split mode: " + mode);
				return [];
		}
	}, []);
	return text;
}