type EventCallback = (...args: any[]) => void;

export default class EventEmitter {
	private listeners: { [event: string]: EventCallback[] } = {};

	// 添加事件监听器
	public on(event: string, callback: EventCallback): void {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(callback);
	}

	// 发出事件
	public emit(event: string, ...args: any[]): void {
		const callbacks = this.listeners[event];
		if (callbacks) {
			callbacks.forEach(callback => callback(...args));
		}
	}

	// 移除事件监听器
	public off(event: string, callback: EventCallback): void {
		if (!this.listeners[event]) return;
		this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
	}
}
