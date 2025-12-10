/**
 * 文件：scripts/ipaTool/utils/loginHistoryStorage.ts
 * 说明：历史登录账号信息存储工具
 */

import { AppConfig } from "../constants/AppConfig";

/**
 * 账户历史记录接口
 */
export interface AccountHistory {
  account: string;
  username: string;
  password: string;
  lastLogin: string;
  storeFront: string;
  isActive?: boolean;
}

/**
 * 历史登录账号列表
 */
type LoginHistory = AccountHistory[];

/**
 * 获取所有历史登录账号
 */
export const getAll = (): LoginHistory => {
  return Storage.get<LoginHistory>(AppConfig.storageKeys.loginHistory) ?? [];
};

/**
 * 保存历史登录账号列表
 */
const save = (history: LoginHistory) => {
  Storage.set<LoginHistory>(AppConfig.storageKeys.loginHistory, history);
};

/**
 * 新增历史登录账号
 * @param account 账号信息
 */
export const add = (account: AccountHistory) => {
  const history = getAll();

  if (account.isActive) {
    history.forEach(item => {
      if (item.isActive) delete item.isActive;
    });
  }

  const index = history.findIndex(item => item.account === account.account);
  if (index > -1) {
    history[index] = account;
  } else {
    history.push(account);
  }

  save(history);
};

/**
 * 获取当前使用的账户信息
 * @returns 当前激活的账户信息，如果没有则返回 undefined
 */
export const getActive = (): AccountHistory | undefined => {
  const history = getAll();
  return history.find(item => item.isActive);
};

/**
 * 修改账户属性
 * @param account 账户标识（用于查找）
 * @param updates 要更新的字段
 */
export const update = (
  account: string,
  cb: (account?: AccountHistory) => void
) => {
  const history = getAll();
  const accountItem = history.find(item => item.account === account);
  cb(accountItem);
  save(history);
};
