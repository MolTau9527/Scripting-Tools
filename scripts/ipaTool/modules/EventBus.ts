/**
 * 事件总线类，用于在应用程序中进行事件的发布和订阅
 * @class EventBus
 */
export class EventBus {
  events: Record<string | symbol, Set<(...args: any[]) => void>> = {};

  on(eventName: string | symbol, cb: (...args: any[]) => void): this {
    (this.events[eventName] ??= new Set()).add(cb);
    return this;
  }

  emit(eventName: string | symbol, ...args: any[]): this {
    this.events[eventName]?.forEach(cb => cb(...args));
    return this;
  }

  off(eventName: string | symbol, cb: (...args: any[]) => void): this {
    this.events[eventName]?.delete(cb);
    if (!this.events[eventName]?.size) delete this.events[eventName];
    return this;
  }

  once(eventName: string | symbol, cb: (...args: any[]) => void): this {
    const handler = (...args: any[]) => {
      cb(...args);
      this.off(eventName, handler);
    };

    this.on(eventName, handler);
    return this;
  }

  hasEvent(eventName: string | symbol): boolean {
    return Object.hasOwn(this.events, eventName);
  }

  clear(eventName?: string | symbol): void {
    if (eventName !== undefined) {
      this.events[eventName]?.clear();
      delete this.events[eventName];
    } else {
      Object.values(this.events).forEach(set => set.clear());
      this.events = {};
    }
  }
}
