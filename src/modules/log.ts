import { getLocaleID } from "../utils/locale";
import EventEmitter from "./eventEmitter";

class Log extends EventEmitter {
	constructor() {
		super();
	}

	error(msg: string) {
		ztoolkit.log('error: ', msg);
		this.emit("error", getLocaleID(msg));
	}

	info(msg: string) {
		ztoolkit.log('info: ', msg);
		this.emit("info", getLocaleID(msg));
	}
}

const log = new Log();
export default log;