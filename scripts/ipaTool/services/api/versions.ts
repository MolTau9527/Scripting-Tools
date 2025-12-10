import {
  type AppVersions3rdData,
  type AppVersionListData,
} from "../../types/appStore";
import { debounce } from "../../utils";
import { fetch } from "scripting";
import { getApiBaseUrl } from "./connection";

/**
 * 获取应用版本列表
 * 合并官方和三放数据源的应用版本列表，
 * 返回一个包含所有版本的数组
 * @param appId 应用 ID
 * @returns 应用版本列表数据 格式为 [版本ID, 版本号][]
 */
export const apiGetAppVersionList = debounce(async (appId: number) => {
  const response = await fetch(`${getApiBaseUrl()}/apps/${appId}/versions`);

  const { success, data, error } =
    (await response.json()) as AppVersionListData;

  if (!success || !data || error) {
    throw new Error(error || "获取应用版本列表失败");
  }

  return data.data;
}, 300);

/**
 * 获取应用版本列表
 * 三方数据源
 * @param appId 应用 ID
 * @param selset 要查询的接口名称 Timbrd'|'Bilin' 默认竞速接口
 * @returns 应用版本列表数据 格式为 [版本ID, 版本号][]
 */
export const apiGetAppVersions3rd = debounce(
  async (appId: number, selset?: "Timbrd" | "Bilin") => {
    const query = selset ? `selset=${selset}` : "";
    const response = await fetch(
      `https://apple-api.com/apps/${appId}/versions/legacy?${query}`
    );

    const { success, data, error } =
      (await response.json()) as AppVersions3rdData;
    if (!success || !data || error) {
      throw new Error(error || "获取应用版本列表失败, 三方数据源");
    }
    return data.data;
  },
  300
);
