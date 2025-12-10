/**
 * 全局状态管理相关类型定义
 */
import { type VirtualNode } from "scripting";

/**
 * 异步状态的可能状态值
 */
export type AsyncStatus = "pending" | "fulfilled" | "rejected";

/**
 * 异步状态类型
 */
export type AsyncState = {
  isReady: boolean;
  status: AsyncStatus;
  AsyncComponent: (props: AsyncComponentProps) => VirtualNode;
};

/**
 * 异步组件属性类型
 */
export interface AsyncComponentProps {
  /**
   * 加载状态显示的内容
   */
  loading?: string | VirtualNode;
  /**
   * 成功状态下显示的子组件，如果不提供则显示默认内容
   */
  children?: VirtualNode;
  /**
   * 自定义错误显示组件
   */
  error?: (error: string | undefined) => VirtualNode;
}

/**
 * 基础Action类型
 * @template Type Action的类型标识符
 * @template TPayload Action的载荷数据类型
 */
export type Action<Type = string | symbol, TPayload = any> = {
  type: Type;
  payload?: TPayload;
  [key: string]: any;
};

/**
 * 通用的Action或值类型（使用条件类型强制展开）
 * @template Action Action类型
 * @template State 状态类型
 */
export type ActionOrValue<A, State> = A extends Action
  ? A | string | number | boolean | ((state: State) => State)
  : never;

/**
 * Reducer类型
 * @template State 状态类型
 * @template A Action类型，必须扩展自Action接口
 */
export type Reducer<State, A extends Action = Action> = (
  state: State,
  action?: ActionOrValue<A, State>
) => State | Promise<State>;

/**
 * 派发函数类型
 * @template A Action类型，必须扩展自Action接口
 */
export type Dispatch<A extends Action = any, State = any> = (
  action?: ActionOrValue<A, State>,
  timeoutConfig?: {
    timeout?: number;
    onTimeout?: <T>(state: T) => T;
  }
) => any;

/**
 * 辅助类型：根据reducer类型推断dispatch类型
 * @template R Reducer类型
 */
export type InferDispatch<R, State> = R extends (
  state: State,
  action: infer A
) => any
  ? A extends Action
    ? Dispatch<A, State>
    : (payload: Parameters<R>[1]) => void
  : () => void;

/**
 * 中间件类型
 * @template T Dispatch函数类型
 */
export type Middleware<T extends Dispatch> = (
  next: T,
  ...args: any[]
) => (action: Parameters<T>[0]) => void;

/**
 * 全局状态管理配置对象
 * @template Option 配置选项类型
 */
export interface GlobalStateConfig {
  storageKey?: string;
  autoReset?: boolean;
  preciseUpdateOff?: boolean;
}
