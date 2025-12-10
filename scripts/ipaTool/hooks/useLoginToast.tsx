/**
 * File: hooks/useLoginToast.ts
 *
 * Toast 状态管理 Hook
 * 封装 Toast 的显示逻辑、状态管理和配置
 */

import { useState, useCallback, useMemo } from "scripting";
import { Toast } from "../components/Toast";
import { Colors } from "../constants/designTokens";
import type { ToastType } from "../components/Toast";

/**
 * Toast 状态类型
 */
export type ToastState = {
  type: ToastType;
  message: string;
  show: boolean;
};

/**
 * Toast Hook 返回值类型
 */
export interface UseLoginToastReturn {
  toastConfig: {
    duration: number | null;
    position: "center";
    backgroundColor: typeof Colors.background.secondary;
    cornerRadius: number;
    shadowRadius: number;
    isPresented: boolean;
    onChanged: (value: boolean) => void;
    content: JSX.Element;
  };
  showToast: (type: ToastType, message: string) => void;
}

/**
 * Toast 状态管理 Hook
 * @returns 返回 toast 配置对象和显示方法
 */
export const useLoginToast = (): UseLoginToastReturn => {
  const [toast, setToast] = useState<ToastState>({
    type: "loading",
    message: "",
    show: false,
  });

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message, show: true });
  }, []);

  const toastConfig = useMemo(() => {
    return {
      duration: toast.type === "loading" ? 60 : 0.7,
      position: "center" as const,
      backgroundColor: Colors.background.secondary,
      cornerRadius: 16,
      shadowRadius: 8,
      isPresented: toast.show,
      onChanged: (show: boolean) => {
        setToast(prev => ({ ...prev, show }));
      },
      content: <Toast {...toast} />,
    };
  }, [toast]);

  return {
    toastConfig,
    showToast,
  };
};
