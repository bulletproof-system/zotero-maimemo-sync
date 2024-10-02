import { getLocaleID } from "../utils/locale";
import EventEmitter from "./eventEmitter";

class Error extends EventEmitter {
	constructor() {
		super();
	}

	handle(error: string) {
		ztoolkit.log('error: ', error);
		this.emit("throw", getLocaleID(error));
	}

}

const error = new Error();
export default error;