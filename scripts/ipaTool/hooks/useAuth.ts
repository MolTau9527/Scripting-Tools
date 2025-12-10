import { createGlobalState } from "../modules/createGlobalStateUtils";
import { apiLogin } from "../services/api/auth";
import { add, getActive, update, getAll } from "../utils/loginHistoryStorage";

const init = {
  isLoggedIn: false,
  account: "",
  username: "",
  password: "",
  storeFront: "",
  lastLogin: "",
};

const loadAuthState = getActive();
if (loadAuthState) {
  Object.assign(init, loadAuthState, { isLoggedIn: true });
}

type Init = typeof init;

const useHook = createGlobalState(
  (state, action: (state: Init) => Init) => {
    return { ...state, ...action(state) };
  },
  init,
  {
    preciseUpdateOff: false,
  }
);

/**
 * 简单的全局登录状态管理 Hook
 * 提供登录状态检查、登录和登出功能
 * @returns 返回登录状态和相关操作方法
 */
export const useAuth = () => {
  const [state, dispatch] = useHook();
  const accountHistory = getAll();

  const login = async (appleId: string, password: string, code: string) => {
    const data = await apiLogin({ appleId, password, code });
    add({ ...data, password, isActive: true });
    dispatch(state => ({ ...state, ...getActive(), isLoggedIn: true }));
  };

  const logout = () => {
    update(state.account, account => {
      if (!account) return;
      delete account.isActive;
    });
    dispatch(() => ({
      isLoggedIn: false,
      account: "",
      username: "",
      password: "",
      storeFront: "",
      lastLogin: "",
    }));
  };

  return {
    authState: state,
    accountHistory,
    login,
    logout,
  };
};
