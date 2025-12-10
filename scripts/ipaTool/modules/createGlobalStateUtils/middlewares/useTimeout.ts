import { type Dispatch } from "../types";

// 超时中间件
export const useTimeout = <T extends Dispatch>(
  next: T,
  timeout?: number,
  onTimeout?: <S>(state: S) => S
) => {
  return (action: Parameters<T>[0]) => {
    return timeout || onTimeout
      ? next(action, { timeout, onTimeout })
      : next(action);
  };
};
