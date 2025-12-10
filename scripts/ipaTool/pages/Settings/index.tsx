/**
 * File: pages/Settings/index.tsx
 *
 * 设置页面 - iOS 风格登录
 * 简洁优雅的登录界面
 */

import {
  NavigationStack,
  NavigationLink,
  Image,
  ScrollView,
  VStack,
  ZStack,
  Spacer,
  useState,
  useEffect,
} from "scripting";

import { Spacing } from "../../constants/designTokens";
import { useAuth } from "../../hooks/useAuth";
import { useLoginToast } from "../../hooks/useLoginToast";
import { useLoginHandler } from "../../hooks/useLoginHandler";
import CloseButton from "../../components/CloseButton";
import { BackgroundDecorations } from "../../components/BackgroundDecorations";
import ConfigView from "./Config";
import {
  LoginFormCard,
  QuickLoginList,
  LoginSuccessView,
  LoginFooter,
} from "./Login";

/**
 * 设置页面组件
 */
export const SettingsView = () => {
  const { authState, login } = useAuth();
  const { isLoggedIn } = authState;
  const { toastConfig, showToast } = useLoginToast();
  const { handleLogin } = useLoginHandler(login, showToast);
  const [scroll, setScroll] = useState(isLoggedIn);

  useEffect(() => {
    withAnimation(() => setScroll(isLoggedIn));
  }, [isLoggedIn]);

  return (
    <NavigationStack>
      <ScrollView
        navigationTitle="账户"
        navigationBarTitleDisplayMode="automatic"
        toast={toastConfig}
        toolbar={{
          topBarLeading: <CloseButton />,
          topBarTrailing: (
            <NavigationLink destination={<ConfigView />}>
              <Image systemName="gear" />
            </NavigationLink>
          ),
        }}
      >
        {!scroll ? (
          <ZStack>
            <BackgroundDecorations offset={{ x: 0, y: -140 }} />
            <VStack
              frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
              spacing={Spacing.xl}
              padding={Spacing.lg}
              transition={Transition.pushFrom("top")}
            >
              <Spacer />
              <LoginFormCard onLogin={handleLogin} />
              <QuickLoginList />
              <LoginFooter />
              <Spacer />
            </VStack>
          </ZStack>
        ) : (
          <VStack
            spacing={Spacing.xl}
            padding={Spacing.lg}
            frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
            transition={Transition.pushFrom("bottom")}
          >
            <LoginSuccessView />
          </VStack>
        )}
      </ScrollView>
    </NavigationStack>
  );
};

export default SettingsView;
