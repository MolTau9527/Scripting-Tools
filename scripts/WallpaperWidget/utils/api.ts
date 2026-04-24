import { fetch, AbortSignal } from "scripting";
import { ACGApiResponse } from "./types";
import { FETCH_TIMEOUT_MS } from "./utils";

const API_BASE_URL = "https://www.loliapi.com/acg/pc/";

/**
 * 向 ACG 接口查询一张图片并返回图片 URL。
 * 带 {@link FETCH_TIMEOUT_MS} 超时，避免 widget 环境卡死。
 */
export const fetchACGImage = async (id: number): Promise<string> => {
  const url = `${API_BASE_URL}?id=${id}&type=json`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`网络请求失败,状态码: ${response.status}`);
  }

  const data: ACGApiResponse = await response.json();
  if (!data.url || data.url.length === 0) {
    throw new Error("服务器返回的图片 URL 无效");
  }
  return data.url;
};
