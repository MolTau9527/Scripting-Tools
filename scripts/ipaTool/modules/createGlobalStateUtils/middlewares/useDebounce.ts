import { type Dispatch } from "../types";

/**
 * 防抖中间件 - 防止频繁的 action 派发
 * @param delay 防抖延迟时间（毫秒），默认 300ms
 * @param leading 是否在首次调用时执行防抖，默认 true
 * @returns 中间件函数
 */

export const useDebounce = <T extends Dispatch>(
  next: T,
  delay = 300,
  immediate = false
) => {
  let timer: number;
  let hasExecuted = false;

  return (action: Parameters<T>[0]) => {
    const callNow = immediate && !hasExecuted;

    clearTimeout(timer);

    if (callNow) {
      hasExecuted = true;
      return next(action);
    }

    timer = setTimeout(() => {
      hasExecuted = false;
      next(action);
    }, delay);
  };
};
