import {
  type Action,
  type Reducer,
  type Dispatch,
  type ActionOrValue,
} from "../types";
import { EventBus } from "../../EventBus";

/**
 * 创建全局派发函数
 * @template State 状态类型
 * @template A Action类型，必须扩展自Action接口
 * @param reducer Reducer函数，用于计算新状态
 * @param key 缓存键，用于在缓存中存储和检索状态
 * @param bus 事件总线实例，用于通知状态变化
 * @param cache 缓存对象，用于存储状态
 * @returns 全局派发函数
 */
export const createGlobalDispatch = <State, A extends Action = Action>(
  reducer: Reducer<State, A>,
  key: symbol,
  bus: EventBus,
  cache: Map<symbol, any>,
  dispatch: Dispatch<A, State>
): Dispatch<A, State> => {
  const globalDispatch: Dispatch<A, State> = (
    action?: ActionOrValue<A, State>,
    timeoutConfig?: { timeout?: number; onTimeout?: (state: State) => State }
  ) => {
    try {
      const state = cache.get(key);
      const newState =
        state instanceof Promise
          ? state.then(res => reducer(res, action))
          : reducer(state, action);

      let timer: number;
      if (newState instanceof Promise) {
        (timeoutConfig
          ? Promise.race([
              newState,
              new Promise(
                resolve =>
                  (timer = setTimeout(() => {
                    timeoutConfig.onTimeout ??= (state: State) => {
                      console.error("状态更新超时");
                      return state;
                    };
                    resolve(timeoutConfig.onTimeout(state));
                  }, timeoutConfig.timeout ?? 5000))
              ),
            ])
          : newState
        )
          .then(res => {
            cache.set(key, res);
            bus.emit(key);
          })
          .catch((error: Error) => {
            cache.set(key, error);
            bus.emit(key);
            console.error(error, error.stack);
          })
          .finally(() => {
            clearTimeout(timer);
          });
      }

      cache.set(key, newState);
      bus.emit(key, dispatch);
      return newState;
    } catch (error) {
      cache.set(key, error);
      bus.emit(key);
      console.error(error, (error as any).stack);
      return error?.toString();
    }
  };

  return globalDispatch;
};
