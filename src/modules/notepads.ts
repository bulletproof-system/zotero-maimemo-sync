import { MaiMemo } from "../../typings/maimemo";
import { getNotepadApi, getNotepadsApi, updateNotepadApi } from "../api";
import { getString } from "../utils/locale";
import { clearPref, getPref, setPref } from "../utils/prefs";
import { Ref, ref, watch } from "vue";
import EventEmitter from "./eventEmitter";
import error from "./error";

export class Notepads extends EventEmitter {
	target: Ref<string | null> = ref(null);
	inner: Map<string, Notepad> = new Map;


	constructor() {
		super();
		this.target.value = getPref("notepads.target") as string ?? null;
		watch(this.target, (newValue, oldValue) => {
			if (newValue === oldValue) return;
			if (this.target.value) {
				setPref("notepads.target", this.target.value);
			} else {
				clearPref("notepads.target");
			}
			this.emit("change", newValue);
		});
	}

	async sync() {
		try {
			const notepads = await getNotepadsApi()
			if (notepads.length > 0) {
				if (!notepads.find(n => n.id === this.target.value))
					this.target.value = notepads[0].id;
			} else {
				this.target.value = null;
			}
			this.inner.clear();
			for (const notepad of notepads) {
				this.inner.set(notepad.id, new Notepad(notepad));
			}
			this.emit("sync");
		} catch (e) {
			error.handle("error-notepads-sync")
		}
	}

	setTarget(id: string | null) {
		if (id && this.inner.has(id)) {
			this.target.value = id;
		} else {
			this.target.value = null;
		}
	}

	getTarget() {
		if (!this.target.value) return null;
		return this.inner.get(this.target.value) ?? null;
	}
}

export const notepads = new Notepads();

export enum UpdateMode {
	Append = "append",
	Overwrite = "overwrite"
}

export class Notepad {
	inner: MaiMemo.BriefNotepad | MaiMemo.Notepad;

	constructor(briefNoteapad: MaiMemo.BriefNotepad) {
		this.inner = briefNoteapad;
	}

	async load() {
		try {
			this.inner = await getNotepadApi(this.inner.id);
		} catch (e) {
			error.handle("error-notepads-load")
		}
	}

	async save() {
		try {
			this.inner = await updateNotepadApi(this.inner.id, this.inner as MaiMemo.Notepad);
		} catch (e) {
			error.handle("error-notepads-save")
		}
	}

	async update(mode: UpdateMode, data: string[]) {
		await this.load();
		data.forEach(line => line.trim());
		switch (mode) {
			case UpdateMode.Append:
				this.append(data);
				break;
			case UpdateMode.Overwrite:
				this.overwrite(data);
				break;
			default:
				ztoolkit.log("Unknown update mode", mode);
				return;
		}
		await this.save();
	}

	/** 追加 */
	private append(data: string[]) {
		const inner = this.inner as MaiMemo.Notepad;
		const olddata = inner.content.split("\n")
			.map(line => line.trim())
			.filter(line => line !== "" && line !== "//");
		const set = new Set(olddata);
		inner.content = "//\n"
		inner.content += olddata.join("\n") + "\n"
		inner.content += data.filter(line => !set.has(line)).join("\n");
	}

	/** 覆盖 */
	private overwrite(data: string[]) {
		const inner = this.inner as MaiMemo.Notepad;
		inner.content = "//\n" + data.join("\n");
	}
}