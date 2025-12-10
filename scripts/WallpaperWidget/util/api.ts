import { fetch } from "scripting";
import { ACGApiResponse } from "./types";

const API_BASE_URL = "https://www.loliapi.com/acg/pc/";

export const fetchACGImage = async (id: number): Promise<string> => {
  const url = `${API_BASE_URL}?id=${id}&type=json`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`网络请求失败,状态码: ${response.status}`);
  }

  const data: ACGApiResponse = await response.json();

  if (!data.url || data.url.length === 0) {
    throw new Error("服务器返回的图片 URL 无效");
  }

  return data.url;
};
