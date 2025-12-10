/**
 * File: pages/Settings/Login/InputField.tsx
 *
 * 登录输入框组件
 * 支持普通输入和密码输入（可切换显示/隐藏）
 */

import { HStack, TextField, SecureField, Button, Image } from "scripting";
import { Colors, Spacing } from "../../../constants/designTokens";

// ========== 输入框配置类型 ==========
export interface InputFieldConfig {
  icon: string;
  prompt: string;
  value: string;
  onChanged: (value: string) => void;
  keyboardType?: "default" | "numberPad";
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

// ========== 统一样式配置 ==========
const inputStyles = {
  icon: {
    font: 18,
    foregroundStyle: Colors.text.secondary,
  },
  container: {
    padding: Spacing.md,
    spacing: Spacing.sm,
  },
  field: {
    title: "",
    textFieldStyle: "plain" as const,
  },
};

// ========== 输入框组件 ==========
export const InputField = ({
  icon,
  prompt,
  value,
  onChanged,
  keyboardType = "default",
  isPassword = false,
  showPassword = false,
  onTogglePassword,
}: InputFieldConfig) => (
  <HStack {...inputStyles.container}>
    <Image systemName={icon} {...inputStyles.icon} />
    {isPassword && !showPassword ? (
      <SecureField
        title=""
        prompt={prompt}
        value={value}
        onChanged={onChanged}
      />
    ) : (
      <TextField
        {...inputStyles.field}
        prompt={prompt}
        value={value}
        onChanged={onChanged}
        keyboardType={keyboardType}
        textInputAutocapitalization={
          icon === "person.fill" ? "never" : undefined
        }
      />
    )}
    {/* 清除按钮 - 只在有内容时显示 */}
    {value.length > 0 && (
      <Button action={() => onChanged("")} buttonStyle="plain">
        <Image
          systemName="xmark.circle.fill"
          font={18}
          foregroundStyle={Colors.text.tertiary}
        />
      </Button>
    )}
    {/* 密码切换按钮 */}
    {isPassword && onTogglePassword && (
      <Button action={onTogglePassword} buttonStyle="plain">
        <Image
          systemName={showPassword ? "eye.slash.fill" : "eye.fill"}
          font={18}
          foregroundStyle={Colors.status.info}
        />
      </Button>
    )}
  </HStack>
);
