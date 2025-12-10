/**
 * File: pages/Settings/Login/LoginFormCard.tsx
 *
 * 登录表单卡片组件（自治组件）
 * 管理自己的表单数据和 UI 状态
 */

import { VStack, Button, Text, Image, Divider, useState } from "scripting";
import {
  FontStyles,
  Colors,
  Spacing,
  BorderRadius,
} from "../../../constants/designTokens";
import { InputField } from "./InputField";
import { useIconAnimation } from "../../../hooks";

type FormData = Partial<typeof initialFormData>;

interface LoginFormCardProps {
  onLogin: (
    username: string,
    password: string,
    captcha: string,
    setShowCaptcha: (state: boolean) => void
  ) => void;
}

const initialFormData = {
  username: "",
  password: "",
  captcha: "",
};

// ========== 导出更新函数 ==========
let updateLoginFormData: ((data: FormData) => void) | null = null;

export const updateLoginForm = (data: FormData) => {
  updateLoginFormData?.(data);
};

export const LoginFormCard = ({ onLogin }: LoginFormCardProps) => {
  // ========== 组件内部状态（完全自治） ==========
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);

  // 注册更新函数（组件挂载后立即可用）
  updateLoginFormData = data => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // 图标动画
  const iconAnimation = useIconAnimation();

  return (
    <>
      {/* 顶部图标 */}
      <VStack alignment="center" spacing={Spacing.md}>
        <Image
          systemName="person.crop.circle.fill"
          font={80}
          foregroundStyle={Colors.status.info}
          {...iconAnimation}
        />
        <Text {...FontStyles.pageTitle} foregroundStyle={Colors.text.primary}>
          欢迎回来
        </Text>
      </VStack>

      {/* 登录表单卡片 */}
      <VStack
        key="login-form"
        spacing={0}
        background={Colors.background.secondary}
        clipShape={{ type: "rect", cornerRadius: BorderRadius.lg }}
      >
        <InputField
          icon="person.fill"
          prompt="用户名或邮箱"
          value={formData.username}
          onChanged={username => setFormData(prev => ({ ...prev, username }))}
        />

        <Divider />

        <InputField
          icon="lock.fill"
          prompt="密码"
          value={formData.password}
          onChanged={password => setFormData(prev => ({ ...prev, password }))}
          isPassword={true}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {showCaptcha && (
          <>
            <Divider />
            <InputField
              icon="shield.fill"
              prompt="验证码"
              value={formData.captcha}
              onChanged={captcha => setFormData(prev => ({ ...prev, captcha }))}
            />
          </>
        )}
      </VStack>
      {/* 登录按钮 */}
      <Button
        action={() =>
          onLogin(
            formData.username,
            formData.password,
            formData.captcha,
            setShowCaptcha
          )
        }
        buttonStyle="borderedProminent"
        controlSize="large"
      >
        <Text {...FontStyles.body}>登录</Text>
      </Button>
    </>
  );
};
