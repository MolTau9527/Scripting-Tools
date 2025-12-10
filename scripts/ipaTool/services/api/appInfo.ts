import { fetch } from "scripting";
import { debounce } from "../../utils";
import type { AppinfoResponse } from "../../types/appStore";
import { getApiBaseUrl } from "./connection";

// 获取应用下载信息
export const apiGetAppInfo = debounce(async (id: number, appVerId?: number) => {
  const query = appVerId ? `appVerId=${appVerId}` : "";
  const response = await fetch(`${getApiBaseUrl()}/apps/${id}?${query}`);
  const { success, data, error } = (await response.json()) as AppinfoResponse;

  if (!success || !data || error) {
    throw new Error(error || "获取应用下载信息失败, 官方数据源");
  }
  return data;
}, 300);
