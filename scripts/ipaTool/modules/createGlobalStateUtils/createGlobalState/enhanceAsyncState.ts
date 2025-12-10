import { AsyncState, AsyncStatus } from "../types";
import { createComponent } from "./createComponent";

/**
 * 为异步状态添加属性
 * @template State 原始状态类型
 * @param state 原始异步状态
 * @returns 添加了新属性的异步状态
 */
export function enhanceAsyncState<State>(state: State): AsyncState {
  const isReady = !(state instanceof Promise);
  const status: AsyncStatus = isReady
    ? state instanceof Error
      ? "rejected"
      : "fulfilled"
    : "pending";

  return {
    isReady,
    status,
    AsyncComponent: createComponent(status, state),
  };
}
