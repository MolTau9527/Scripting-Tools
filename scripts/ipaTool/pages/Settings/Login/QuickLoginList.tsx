/**
 * File: pages/Settings/Login/QuickLoginList.tsx
 *
 * 快速登录列表组件（自治组件）
 */

import {
  VStack,
  HStack,
  Button,
  Text,
  Image,
  Spacer,
  Divider,
  ScrollView,
} from "scripting";
import {
  FontStyles,
  Colors,
  Spacing,
  BorderRadius,
} from "../../../constants/designTokens";
import { updateLoginForm } from "./LoginFormCard";
import { useAuth } from "../../../hooks";

export const QuickLoginList = () => {
  const { accountHistory } = useAuth();
  if (accountHistory.length === 0) return <></>;

  return (
    <VStack spacing={Spacing.md} padding={{ top: Spacing.lg }}>
      <Text {...FontStyles.caption} foregroundStyle={Colors.text.secondary}>
        快速登录
      </Text>

      <VStack
        spacing={0}
        background={Colors.background.secondary}
        clipShape={{ type: "rect", cornerRadius: BorderRadius.lg }}
        frame={{ maxHeight: 78 * 3 }}
      >
        <ScrollView>
          {accountHistory.map((account, index) => (
            <VStack key={account.username} spacing={0}>
              <Button
                action={() =>
                  updateLoginForm({
                    username: account.account,
                    password: account.password,
                    captcha: "",
                  })
                }
                buttonStyle="plain"
              >
                <HStack padding={Spacing.md} spacing={Spacing.md}>
                  {/* 头像 */}
                  <Image
                    systemName="person.crop.circle.fill"
                    font={40}
                    foregroundStyle={Colors.text.secondary}
                  />

                  {/* 账户信息 */}
                  <VStack spacing={Spacing.xxs} alignment="leading">
                    <Text
                      {...FontStyles.body}
                      foregroundStyle={Colors.text.primary}
                    >
                      {account.username}
                    </Text>
                    <Text
                      {...FontStyles.caption}
                      foregroundStyle={Colors.text.tertiary}
                    >
                      上次登录: {account.lastLogin}
                    </Text>
                  </VStack>

                  <Spacer />

                  {/* 箭头 */}
                  <Image
                    systemName="chevron.right"
                    font={14}
                    foregroundStyle={Colors.text.tertiary}
                  />
                </HStack>
              </Button>

              {/* 分隔线 */}
              {index < accountHistory.length - 1 && (
                <Divider padding={{ leading: 68 }} />
              )}
            </VStack>
          ))}
        </ScrollView>
      </VStack>
    </VStack>
  );
};
