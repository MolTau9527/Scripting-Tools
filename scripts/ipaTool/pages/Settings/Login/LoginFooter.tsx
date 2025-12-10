/**
 * File: pages/Settings/Login/LoginFooter.tsx
 *
 * 登录页底部说明组件（纯展示）
 */

import { VStack, Text } from "scripting";
import { FontStyles, Colors, Spacing } from "../../../constants/designTokens";

interface LoginFooterProps {
  message?: string;
}

export const LoginFooter = ({ message }: LoginFooterProps) => {
  const defaultMessage =
    "登录即表示您同意我们的\n服务条款和隐私政策\n本服务不会收集你的帐号密码等敏感信息";

  return (
    <VStack alignment="center" padding={{ top: Spacing.xl }}>
      <Text
        {...FontStyles.caption}
        foregroundStyle={Colors.text.tertiary}
        multilineTextAlignment="center"
      >
        {message || defaultMessage}
      </Text>
    </VStack>
  );
};
