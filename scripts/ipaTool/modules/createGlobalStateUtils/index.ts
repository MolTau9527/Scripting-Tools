// 主入口文件 - 统一导出 useGlobalReducer 和中间件
export { createGlobalState } from "./createGlobalState";
export { EventBus } from "../EventBus";
export * from "./types";

//TODO: 添加中间件导出
export * from "./middlewares";
