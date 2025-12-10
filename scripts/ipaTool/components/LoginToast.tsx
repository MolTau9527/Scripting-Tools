/**
 * File: components/LoginToast.tsx
 *
 * Toast 组件（自包含样式配置）
 * 全局通用 Toast 组件，支持 loading、success、error 三种类型
 */

import { VStack, Text, Image, ProgressView } from "scripting";
import { FontStyles, Colors, Spacing } from "../constants/designTokens";

export type LoginToastType = "loading" | "success" | "error";

interface LoginToastProps {
  type: LoginToastType;
  message: string;
  isPresented: boolean;
  onChanged: (value: boolean) => void;
}

export type LoginToastState = {
  type: LoginToastType;
  message: string;
  show: boolean;
};

export const LoginToast = ({
  type,
  message,
  isPresented,
  onChanged,
}: LoginToastProps) => {
  // ========== Toast 静态配置 ==========
  const toastConfig = {
    duration: type === "loading" ? null : 0.7,
    position: "center" as const,
    backgroundColor: Colors.background.secondary,
    cornerRadius: 16,
    shadowRadius: 8,
  };

  return {
    ...toastConfig,
    isPresented,
    onChanged,
    content: (
      <VStack
        spacing={Spacing.sm}
        padding={Spacing.lg}
        frame={{ minWidth: 200 }}
        alignment="center"
      >
        {/* 根据类型显示不同的图标 */}
        {type === "loading" && (
          <ProgressView progressViewStyle="circular" controlSize="large" />
        )}
        {type === "success" && (
          <Image
            systemName="checkmark.circle.fill"
            font={48}
            foregroundStyle={Colors.status.success}
          />
        )}
        {type === "error" && (
          <Image
            systemName="xmark.circle.fill"
            font={48}
            foregroundStyle={Colors.status.error}
          />
        )}

        {/* 文字 */}
        <Text
          {...FontStyles.body}
          foregroundStyle={Colors.text.primary}
          multilineTextAlignment="center"
        >
          {message}
        </Text>
      </VStack>
    ),
  };
};
