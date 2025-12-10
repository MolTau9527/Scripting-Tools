import { useReducer, useEffect, useRef, useMemo } from "scripting";
import { createGlobalDispatch } from "./createGlobalDispatch";
import { enhanceAsyncState } from "./enhanceAsyncState";
import { createEventCallback } from "./createEventCallback";
import { createProxyState } from "./createProxyState";
import { initializeCache } from "../utils/PersistentCache";
import { EventBus } from "../../EventBus";
import {
  type AsyncState,
  type Reducer,
  type InferDispatch,
  type GlobalStateConfig,
} from "../types";

//创建事件总线实例;
const bus = new EventBus();
/**
 * 创建全局状态管理 Hook
 *
 * 提供跨组件的状态共享和管理能力，支持持久化存储和自动重置功能
 *
 * @template State 状态数据类型
 * @template R Reducer 函数类型，用于状态更新逻辑
 *
 * @param reducer 状态更新函数，接收当前状态和 action，返回新状态
 * @param initialState 初始状态值
 * @param config 配置选项（storageKey 和 autoReset 只能二选一）
 * @param config.storageKey 可选 默认 不开启  持久化存储的键名，设置后状态会自动保存到本地存储
 * @param config.autoReset 可选，默认 false，当没有组件订阅时是否自动重置状态到初始值
 *
 * @returns 返回一个特殊的对象，它既是函数又有属性：
 *   - 作为函数调用：useGlobalState() 返回 [状态, 派发函数, 异步状态] 三元组
 *   - 作为对象访问：useGlobalState.resetState() 重置状态到初始值（不触发组件更新）
 *   - 作为对象访问：useGlobalState.setState(newState | updater) 直接设置状态（不触发组件更新）
 *
 * @example
 * ```typescript
 * const useCounter = createGlobalState(counterReducer, { count: 0 });
 *
 * //在组件中作为 Hook 使用（会触发组件更新）
 * const [state, dispatch, asyncState] = useCounter();
 *
 * //特殊场景的功能 谨慎使用
 * // 重置状态到初始值（不会触发组件更新）
 * useCounter.resetState(); // 只能重置到初始状态
 *
 * // 直接设置状态（不会触发组件更新）
 * useCounter.setState({ count: 5 }); // 直接设置新状态
 * useCounter.setState(prev => ({ count: prev.count + 1 })); // 基于当前状态更新
 * ```
 */
export function createGlobalState<State, R extends Reducer<State, any>>(
  reducer: R,
  initialState: State,
  {
    storageKey,
    autoReset = false,
    preciseUpdateOff = true,
  } = {} as GlobalStateConfig
): (() => [State, InferDispatch<R, State>, AsyncState]) & {
  resetState: () => void;
  setState: (input: State | ((state: State) => State)) => void;
} {
  // 创建唯一的事件标识符
  const key = Symbol(`reducer-key`);
  // 初始化缓存
  const cache = initializeCache(storageKey, key, initialState);
  // 重置状态方法，支持可选参数
  const resetState = () => {
    cache.set(key, initialState);
  };
  // 设置状态方法，支持外部设置状态
  const setState = (input: State | ((state: State) => State)) => {
    const state = cache.get(key);
    if (!state) return;
    if (typeof input === "function") {
      cache.set(key, (input as (state: State) => State)(state));
    } else {
      cache.set(key, input);
    }
  };

  const useHook = () => {
    const selectors = useRef({});
    const [state, dispatch] = useReducer(() => cache.get(key), cache.get(key));
    // 订阅和取消订阅事件总线
    useEffect(() => {
      const cb = createEventCallback(
        cache,
        key,
        selectors,
        preciseUpdateOff,
        dispatch
      );

      bus.on(key, cb);
      return () => {
        selectors.current = null as any;
        bus.off(key, cb);
        autoReset && (bus.hasEvent(key) || resetState());
      };
    }, []);

    // 创建全局派发函数
    const globalDispatch = useMemo(
      () => createGlobalDispatch(reducer, key, bus, cache, dispatch),
      []
    );

    return [
      // 代理状态对象用于收集依赖
      createProxyState(state, selectors),
      // 全局派发函数
      globalDispatch,
      // 使用 enhanceAsyncState 函数增强状态
      enhanceAsyncState(state),
    ] as [State, InferDispatch<R, State>, AsyncState];
  };

  return Object.assign(useHook, { resetState, setState });
}
