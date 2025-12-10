import { type Dispatch, type Middleware } from "../types";

/**
 * 应用中间件到 dispatch 函数
 * @param middlewares 中间件数组
 * @returns 增强的 dispatch 函数
 */
export const applyMiddleware =
  <T extends Dispatch>(
    ...middlewares: (Middleware<T> | [Middleware<T>, ...any[]])[]
  ) =>
  (baseDispatch: T) =>
    middlewares
      .map(mw => {
        if (Array.isArray(mw)) {
          const fn = mw.shift();
          return (next: T) => fn?.(...[next, ...mw]);
        }

        return mw;
      })
      .reduceRight((next, mw) => mw?.(next as T), baseDispatch) as (
      param: Parameters<T>[0]
    ) => void;
