/**
 * File: utils/navigation.ts
 *
 * 全局导航工具模块
 * 提供应用级别的导航功能，如关闭应用等
 *
 * 注意：dismissApp 必须在根组件中通过 initDismissApp 初始化
 */

//导出关闭函数
export const dismissApp = {
  current: () => console.warn("dismiss 未初始化"),
};
