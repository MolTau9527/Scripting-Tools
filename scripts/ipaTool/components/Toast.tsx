/**
 * File: components/Toast.tsx
 *
 * Toast 内容组件
 * 纯 UI 组件，只负责渲染 Toast 内容
 */

import { VStack, Text, Image, ProgressView } from "scripting"
import { FontStyles, Colors, Spacing } from "../constants/designTokens"

export type ToastType = "loading" | "success" | "error" | "info"

interface ToastProps {
  type: ToastType
  message: string
}

/**
 * Toast 内容组件
 * 根据类型显示不同的图标和文字
 */
export const Toast = ({ type, message }: ToastProps) => {
  return (
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
      {type === "info" && (
        <Image
          systemName="info.circle.fill"
          font={48}
          foregroundStyle={Colors.status.info}
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
  )
}
