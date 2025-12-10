import { type Dispatch } from "../types";

/**
 * 日志中间件 - 记录 action 派发和状态变化
 * @param label 日志标签，用于区分不同的日志来源
 * @returns 中间件函数
 */
export const useLogger =
  <T extends Dispatch>(next: T, label = "logger", prevState = "") =>
  (action: Parameters<T>[0]) => {
    const timer = Date.now();

    // 安全地获取 action type
    const actionType = action.type ? String(action.type) : "Unknown";

    console.log(`🚀 ${label} - Action: ${actionType}`);
    console.log("📤 Action:", action);
    console.log("📊 Previous State:", prevState);

    // 执行 action
    const result = next(action);

    // // 获取执行后状态
    const nextState = result;
    // 抽取打印日志的公共函数
    const logStateAndTime = (state: unknown) => {
      const executionTime = Date.now() - timer;
      console.log("📊 Next State:", state);
      console.log("⏱️ Execution Time:", `${executionTime}ms`);
      console.log("---");
    };

    if (nextState instanceof Promise) {
      nextState.then(logStateAndTime);
    } else {
      logStateAndTime(nextState);
    }

    return result;
  };
