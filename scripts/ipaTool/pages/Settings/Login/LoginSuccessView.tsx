/**
 * File: pages/Settings/Login/LoginSuccessView.tsx
 *
 * 登录成功页面组件（纯展示）
 */

import { VStack, HStack, Button, Text, Image, Spacer, ZStack } from "scripting";
import { updateLoginForm } from "./LoginFormCard";
import { useAuth } from "../../../hooks/useAuth";
import { storeIdToCode, countryCodeToFlag } from "../../../utils/countries";
import BackgroundDecorations from "../../../components/BackgroundDecorations";
import { useIconAnimation } from "../../../hooks";

import {
  FontStyles,
  Colors,
  Spacing,
  BorderRadius,
} from "../../../constants/designTokens";

export const LoginSuccessView = () => {
  const { logout, authState } = useAuth();
  const { username, storeFront } = authState;

  // 图标动画（在 -40 基础上移动）
  const iconAnimation = useIconAnimation(5, 1, -40);

  return (
    <ZStack>
      {/* 背景装饰圆圈 */}
      <BackgroundDecorations />

      {/* 主内容 */}
      <VStack alignment="center">
        <Spacer minLength={60} />

        {/* 成功图标 */}
        <Image
          systemName="checkmark.circle.fill"
          font={100}
          foregroundStyle={Colors.status.success}
          {...iconAnimation}
        />

        {/* 成功标题 */}
        <VStack spacing={Spacing.sm} alignment="center">
          <Text {...FontStyles.pageTitle} foregroundStyle={Colors.text.primary}>
            登录成功
          </Text>
          <Text {...FontStyles.body} foregroundStyle={Colors.text.secondary}>
            欢迎回来，{username}
          </Text>
        </VStack>

        <Spacer minLength={40} />

        {/* 用户信息卡片 */}
        <VStack
          spacing={Spacing.md}
          padding={Spacing.lg}
          background={Colors.background.secondary}
          clipShape={{ type: "rect", cornerRadius: BorderRadius.lg }}
          frame={{ width: 300 }}
        >
          <HStack spacing={Spacing.md}>
            <Image
              systemName="person.crop.circle.fill"
              font={50}
              foregroundStyle={Colors.status.info}
            />
            <VStack spacing={Spacing.xs} alignment="leading">
              <Text
                {...FontStyles.sectionTitle}
                foregroundStyle={Colors.text.primary}
              >
                {username} {countryCodeToFlag(storeIdToCode(storeFront)!)}
              </Text>
              <Text
                {...FontStyles.caption}
                foregroundStyle={Colors.text.tertiary}
              >
                最后登录: {new Date().toLocaleDateString("zh-CN")}
              </Text>
            </VStack>
          </HStack>
        </VStack>
        <Spacer minLength={40} />
        {/* 退出登录按钮 */}
        <Button
          buttonStyle="bordered"
          controlSize="large"
          action={() => {
            // 清除登陆信息
            updateLoginForm({ password: "", captcha: "" });
            //退出登陆
            logout();
          }}
        >
          <Text {...FontStyles.body} foregroundStyle={Colors.status.error}>
            退出登录
          </Text>
        </Button>

        <Spacer minLength={60} />
      </VStack>
    </ZStack>
  );
};
