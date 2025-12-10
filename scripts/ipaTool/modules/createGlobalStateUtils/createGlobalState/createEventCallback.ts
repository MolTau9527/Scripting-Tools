import { MutableRefObject, Dispatch } from "scripting";

/**
 * 创建事件回调函数，用于监听状态变化
 * @param cache 缓存对象
 * @param key 缓存键
 * @param selectors 依赖项记录
 * @param preciseUpdate 自定义等于更新规则 默认关闭 使用精准更新兜底
 * @returns 事件回调函数
 */
export const createEventCallback = (
  cache: Map<symbol, any>,
  key: symbol,
  selectors: MutableRefObject<Record<string, any>>,
  preciseUpdateOff: boolean,
  dispatch: Dispatch<any>
) => {
  return (action: Dispatch<any>) => {
    const nextState = cache.get(key);
    if (typeof nextState !== "object") return dispatch(null);
    if (nextState instanceof Promise) {
      action === dispatch && action(nextState.then(action).catch(action));
      return;
    }

    if (!preciseUpdateOff) return dispatch(null);
    for (let [key, value] of Object.entries(selectors.current)) {
      if (Object.hasOwn(nextState, key) && nextState[key] !== value)
        return dispatch(null);
    }
  };
};
