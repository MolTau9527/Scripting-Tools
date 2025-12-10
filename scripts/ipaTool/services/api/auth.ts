/**
 * 文件：scripts/ipaTool/services/api/auth.ts
 * 说明：用户认证相关 API
 */

import { fetch } from "scripting";
import { debounce } from "../../utils";
import { getApiBaseUrl } from "./connection";
import type { LoginResponse, ResetResponse } from "../../types/appStore";

/**
 * 登录请求参数
 */
export interface LoginParams {
  appleId: string;
  password: string;
  code: string;
}

/**
 * 用户登录
 * @param params 登录参数（用户名、密码、验证码）
 * @returns Promise<LoginResponse["data"]> 登录数据（账户 用户名 时间戳 商店地区代码）
 */
export const apiLogin = debounce(async (params: LoginParams) => {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result: LoginResponse = await response.json();

  if (!result.success || !result.data || result.error) {
    throw new Error(result.error || "登录失败，请检查用户名和密码");
  }

  const {
    loginData: {
      storeFront,
      accountInfo: {
        appleId: account,
        address: { firstName, lastName },
      },
    },
  } = result.data;
  const username = `${firstName} ${lastName}`;
  return { account, username, storeFront, lastLogin: result.timestamp };
}, 300);

/**
 * 重置登录状态和 GUID 缓存
 * @returns Promise<ResetResponse> 重置结果
 */
export const apiReset = async () => {
  const response = await fetch(`${getApiBaseUrl()}/auth/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result: ResetResponse = await response.json();

  if (!result.success || !result.data || result.error) {
    throw new Error(result.error || "重置失败");
  }

  return result.data;
};
