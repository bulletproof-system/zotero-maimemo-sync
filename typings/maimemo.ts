export namespace MaiMemo {
	/** https://open.maimemo.com/#/schemas/NotepadType */
	export enum NotepadType {
		FAVORITE = "FAVORITE",
		NOTEPAD = "NOTEPAD",
	}

	/** https://open.maimemo.com/#/schemas/NotepadStatus */
	export enum NotepadStatus {
		PUBLISHED = "PUBLISHED",
		UNPUBLISHED = "UNPUBLISHED",
		DELETED = "DELETED",
	}

	/** https://open.maimemo.com/#/schemas/BriefNotepad */
	export interface BriefNotepad {
		id: string,
		type: NotepadType,
		creator: string,
		status: NotepadStatus,
		title: string,
		brief: string,
		tags: string[],
		created_time: Date,
		updated_time: Date,
	}

	/** https://open.maimemo.com/#/schemas/NotepadParsedItem */
	export interface NotepadParsedItem {
		type: 'CHAPTER' | 'WORD',
		data: {
			chapter: string,
			word?: string,
		}
	}

	/** https://open.maimemo.com/#/schemas/Notepad */
	export interface Notepad extends BriefNotepad {
		content: string,
		list: NotepadParsedItem[],
	}

}