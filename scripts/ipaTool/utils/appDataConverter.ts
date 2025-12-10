/**
 * File: utils/appDataConverter.ts
 *
 * 应用数据转换工具
 * 将不同 API 返回的数据统一转换为 AppSearchSuccess 格式
 */

import type { AppSearchSuccess, AppinfoResponse } from "../types/appStore";

/**
 * 将 AppInfo 数据转换为 AppSearchSuccess
 * 缺失的字段用空字符串或 0 填充
 */
export const toSearchApp = (
  data: AppinfoResponse["data"]
): AppSearchSuccess[] => {
  return [
    {
      id: data.appInfo.appId,
      name: data.appInfo.name,
      description: "", // AppInfo 不提供描述
      icon: data.appInfo.icon, // AppInfo 不提供图标 URL
      category: "", // AppInfo 不提供分类
      version: data.appInfo.displayVersion,
      size: data.appInfo.fileSize,
      price: "????", // AppInfo 不提供价格信息，默认免费
      userRatingCount: 0, // AppInfo 不提供评分人数
      minimumOsVersion: data.appInfo.minimumOsVersion, // AppInfo 不提供系统版本要求
      currency: data.appInfo.currency,
    },
  ];
};
