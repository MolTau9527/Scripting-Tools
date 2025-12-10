/**
 * File: pages/Search/toast.ts
 *
 * Search 页面的 Toast 函数
 * 独立文件避免循环引用
 */

import type { ToastType } from "../../components/Toast";

/**
 * Toast 显示函数（供其他组件调用）
 * 在 SearchView 组件内部赋值，实现跨组件调用
 */
export const onSearchShowToast = {
  run: (type: ToastType, message: string) => {},
};
