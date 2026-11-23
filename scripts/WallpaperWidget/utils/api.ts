import { fetch, AbortSignal } from "scripting";
import { ACGApiResponse } from "./types";
import { FETCH_TIMEOUT_MS } from "./utils";

const API_BASE_URL = "https://www.loliapi.com/acg/pc/";

/** 主源连续失败后走的备用直链图源（直接返回图片，不用解析 JSON）。
 * 顺序是固定的：dmoe 在前——直连、无跳转；mwm 在后——要经过
 * t.mwm.moe → t.alcy.cc 两重跳转，图片代理跟不上、容易失败。 */
export const FALLBACK_IMAGE_URLS = [
  "https://www.dmoe.cc/random.php",
  "https://t.mwm.moe/pc/",
];

/** 按固定顺序取备用直链图源：第 1 次取 dmoe，第 2 次取 mwm。
 * 以前是随机抽，两次可能抽到同一个挂掉的源，白白浪费一次机会。 */
export const getFallbackImageUrl = (index = 0): string =>
  FALLBACK_IMAGE_URLS[index % FALLBACK_IMAGE_URLS.length];

/** 主源最多重试次数 */
const MAX_RETRIES = 3;

/**
 * 向 ACG 接口查询一张图片并返回图片 URL。
 * 带 {@link FETCH_TIMEOUT_MS} 超时，避免 widget 环境卡死。
 * 主源失败会重试 {@link MAX_RETRIES} 次，都失败则返回备用图源直链。
 */
export const fetchACGImage = async (id: number): Promise<string> => {
  const url = `${API_BASE_URL}?id=${id}&type=json`;

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
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
    } catch (error) {
      lastError = error;
      console.error(`主源第 ${attempt} 次失败:`, error);
    }
  }

  // 主源彻底失败，走备用图源：固定取第 1 个（dmoe，直连无跳转）
  console.error("主源全部失败，走备用图源:", lastError);
  return getFallbackImageUrl(0);
};
