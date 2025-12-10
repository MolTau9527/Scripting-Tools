// 应用项搜索成功响应接口
export interface AppSearchSuccess {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  version: string;
  size: number;
  price: number | "Free" | "????"; // 应用价格
  averageUserRating?: number; // 应用评分，范围 0-5
  userRatingCount: number; // 评分人数
  minimumOsVersion: string; // 最低支持系统版本
  currency: string; // 货币单位
}

// 应用项搜索错误接口
export interface AppSearchError {
  name: "未找到应用";
  description: string;
}

// 应用项搜索响应联合类型
export type AppSearchResponse = AppSearchSuccess | AppSearchError;

// 类型守卫：判断是否为错误响应
export const isAppSearchError = (
  app: AppSearchResponse
): app is AppSearchSuccess => {
  return app.name !== "未找到应用";
};

// 搜索应用项参数接口
export interface SearchAppParams {
  term: string;
  country: string;
  entity: string;
  limit: number;
}

// 通用响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  timestamp: string;
  error: string | null;
}

// 应用版本项数据接口 - 数组形式 [版本ID, 版本号]
export type AppVersionItem = Array<[number | string, string]>;

// 提取公共的应用版本基础数据 - 用 type 也很好
type AppVersionBaseData = {
  appId: number; // 应用ID
  data: AppVersionItem; // 版本列表数组 [版本ID, 版本号]
  total: number; // 总版本数量
};

// 官方应用详情响应接口 - type 组合也很清晰
export type AppVersionListData = ApiResponse<
  AppVersionBaseData & {
    direction: "next" | "prev";
    count: number;
    appVerId: number;
  }
>;

// 三方应用版本列表数据接口 - 直接使用基础类型
export type AppVersions3rdData = ApiResponse<AppVersionBaseData>;

/**
 * app响应接口  (包含下载地址 和 sinf 数据)
 */
export type AppinfoResponse = ApiResponse<{
  appId: string;
  appInfo: {
    name: string;
    appId: number;
    url: string;
    sinf: {
      type: "Buffer";
      data: number[];
    };
    bundleId: string;
    displayVersion: string;
    buildVersion: string;
    externalVersionId: number;
    externalVersionIdList: number[];
    fileSize: number;
    uncompressedSize: string;
    metadata: string;
    icon: string;
    currency: string;
    minimumOsVersion: string;
  };
}>;

/**
 * 登录响应接口
 */
export type LoginResponse = ApiResponse<{
  loginData: {
    storeFront: string;
    accountInfo: {
      appleId: string;
      address: {
        firstName: string;
        lastName: string;
      };
    };
  };
}>;

/**
 *  重置登录状态和 GUID 缓存
 */

export type ResetResponse = ApiResponse<{
  success: boolean;
  message: string;
}>;
