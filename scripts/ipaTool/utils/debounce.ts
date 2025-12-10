interface DebounceOptions {
  immediate?: boolean; // 默认 false
  requestAbort?: () => void; // 请求中止函数
}

interface DebouncedFunction<F extends (...args: any[]) => any> {
  (...args: Parameters<F>): ReturnType<F> extends void
    ? void
    : ReturnType<F> extends Promise<infer U>
    ? Promise<U>
    : Promise<ReturnType<F>>;

  cancel: () => void;
  flush: () => ReturnType<F> | undefined;
}

/**
 * @param fn 要防抖的函数
 * @param delay 防抖延迟时间（毫秒），默认 300ms
 * @param options 防抖选项
 * @returns 防抖函数
 */
export function debounce<F extends (...args: any[]) => any>(
  fn: F,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFunction<F> {
  const { immediate = false, requestAbort } = options; // ✅ 默认 false 请求中止函数
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<F> | null = null;
  let lastResult: ReturnType<F> | undefined;

  const debounced = ((...args: Parameters<F>) => {
    if (timer) {
      clearTimeout(timer);
      requestAbort?.();
    }

    if (immediate && !timer) {
      // 立即执行一次
      lastResult = fn(...args);
      lastArgs = null;
      timer = setTimeout(() => {
        timer = null;
      }, delay);

      return typeof lastResult === "undefined"
        ? undefined
        : Promise.resolve(lastResult);
    }

    // 普通防抖：延迟执行
    lastArgs = args;
    return new Promise<ReturnType<F> | undefined>(resolve => {
      timer = setTimeout(() => {
        lastResult = fn(...args);
        resolve(lastResult);
        timer = null;
        lastArgs = null;
      }, delay);
    });
  }) as DebouncedFunction<F>;

  // 取消执行
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      requestAbort?.();
      timer = null;
      lastArgs = null;
    }
  };

  // 手动触发执行
  debounced.flush = () => {
    if (timer && lastArgs) {
      clearTimeout(timer);
      requestAbort?.();
      timer = null;
      lastResult = fn(...lastArgs);
      lastArgs = null;
      return lastResult;
    }
    return undefined;
  };

  return debounced;
}
