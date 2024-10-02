import { getPref } from "../utils/prefs";
import { MaiMemo } from "../../typings/maimemo";
import error from "../modules/error";
import { getString } from "../utils/locale";

interface CustomResponse<T = any> {
	data?: T;
	errors: {
		code: string,
		msg: string,
		info: string,
	}[];
	success: boolean;
}

export function getNotepadsApi(): Promise<MaiMemo.BriefNotepad[]>;
export function getNotepadsApi(limit: number, offset: number): Promise<MaiMemo.BriefNotepad[]>;
export async function getNotepadsApi(limit?: number, offset?: number) {
	if (limit !== undefined && offset !== undefined) {
		const xhr = await Zotero.HTTP.request(
			"GET",
			`https://open.maimemo.com/open/api/v1/notepads?limit=${limit}&offset=${offset}`,
			{
				headers: {
					Authorization: `Bearer ${getPref("token")}`
				},
				successCodes: false,
			}
		)
		ztoolkit.log(xhr)
		if (xhr.status === 401) error.handle("error-token")
		if (xhr.status !== 200) throw new Error(xhr.statusText);
		return JSON.parse(xhr.responseText).data.notepads;
	} else {
		limit = 10, offset = 0;
		let notepads: MaiMemo.BriefNotepad[] = [];
		while (true) {
			const res = await getNotepadsApi(limit, offset);
			notepads = notepads.concat(res);
			if (res.length !== 10) break;
			offset += 10;
		}
		return notepads;
	}
}


export async function getNotepadApi(id: string): Promise<MaiMemo.Notepad> {
	const xhr = await Zotero.HTTP.request(
		"GET",
		`https://open.maimemo.com/open/api/v1/notepads/${id}`,
		{
			headers: {
				Authorization: `Bearer ${getPref("token")}`
			},
			successCodes: false,
		}
	)
	if (xhr.status === 401) error.handle(getString("error-token"))
	if (xhr.status !== 200) throw new Error(xhr.statusText);
	return JSON.parse(xhr.responseText).data.notepad;
}

type UpdatedNotepadFields = Pick<MaiMemo.Notepad, 'status' | 'content' | 'title' | 'brief' | 'tags'>;
export async function updateNotepadApi(id: string, notepad: UpdatedNotepadFields): Promise<MaiMemo.Notepad> {
	const { status, content, title, brief, tags } = notepad; // 解构所需字段
	const xhr = await Zotero.HTTP.request(
		"POST",
		`https://open.maimemo.com/open/api/v1/notepads/${id}`,
		{
			headers: {
				Authorization: `Bearer ${getPref("token")}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				notepad: {
					status,
					content,
					title,
					brief,
					tags,
				}
			}),
			successCodes: false,
		}
	)
	if (xhr.status === 401) error.handle(getString("error-token"))
	if (xhr.status !== 201) throw new Error(xhr.statusText);
	return JSON.parse(xhr.responseText).data.notepad;
}