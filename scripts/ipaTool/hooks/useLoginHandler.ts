import { useRef } from "scripting";
import { updateLoginForm } from "../pages/Settings/Login";
import type { ToastType } from "../components/Toast";

export const useLoginHandler = (
  login: (appleId: string, password: string, code: string) => Promise<void>,
  showToast: (type: ToastType, message: string) => void
) => {

  const isLoggingInRef = useRef(false);

  const handleLogin = async (
    account: string,
    password: string,
    captcha = "",
    setShowCaptcha: (state: boolean) => void
  ) => {
    if (isLoggingInRef.current) return;

    try {
      if (!account || !password) {
        throw new Error("请输入用户名、密码");
      }

      isLoggingInRef.current = true;
      showToast("loading", "正在登录...");
      await login(account, password, captcha);

      showToast("success", "登录成功！");
      setTimeout(() => setShowCaptcha(false), 1000);
    } catch (error: any) {
      const isCaptcha:boolean = error.message.includes("MZFinance.BadLogin.Configurator_message")

      if (isCaptcha) {
         showToast("info", "请输入验证码")
         setShowCaptcha(isCaptcha);
      } else {
         showToast("error", error.message.replace(",,", "\n"));
         console.error("登录失败:", error.message);     
      }
      
    } finally {
      updateLoginForm({ captcha: "" });
      isLoggingInRef.current = false;
    }
  };

  return { handleLogin };
};
