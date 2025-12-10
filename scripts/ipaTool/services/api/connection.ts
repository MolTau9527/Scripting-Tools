// 文件：scripts/ipaTool/services/api/connection.ts
// 说明：API 连接测试工具
import { fetch } from "scripting";
import { sendNotification } from "../../utils/notification";

/**
 * API 响应类型
 */
interface ApiResponse {
  success: boolean;
  data: any;
  message: string;
}

/**
 * API 根路径
 */
const API_BASE_URL = "https://apple-api.com";

/**
 * 测试 API 连接
 * 在应用启动时调用，检查 API 是否可用
 * @returns Promise<boolean> 连接是否成功
 */
export const testApiConnection = async () => {
  const timerId = setTimeout(() => {
    sendNotification("API 连接超时", `请检查是否安装api模块`);
  }, 5000);
  try {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${API_BASE_URL}`);
    }

    const result: ApiResponse = await response.json();

    if (result.success) {
      console.log("API 连接成功", API_BASE_URL);
      return;
    }

    throw new Error(`${result.message} ${API_BASE_URL}`);
  } catch (error: any) {
    console.error(error.toString());
    sendNotification(
      "API 连接失败",
      `${error.message} ${API_BASE_URL}\n请检查是否安装api模块`
    );
  } finally {
    clearTimeout(timerId);
  }
};

/**
 * 获取 API 根路径
 */
export const getApiBaseUrl = () => API_BASE_URL;
