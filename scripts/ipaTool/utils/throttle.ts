// File: scripts/ipaTool/utils/throttle.ts

/**
 * 创建一个节流函数，在指定的时间间隔内最多调用一次 func。
 * @param func 要节流的函数。
 * @param wait 需要节流的毫秒数。
 * @returns 返回一个新的节流函数。
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  let lastTime: number | null = null;
  let timeout: any = null;

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (lastTime === null) {
      lastTime = now;
    }

    const remaining = wait - (now - lastTime);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastTime = now;
      return func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
};