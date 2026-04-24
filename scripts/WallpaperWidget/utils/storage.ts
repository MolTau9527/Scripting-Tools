import { Path } from "scripting";
import { ACGConfig } from "./types";
import { CONFIG_FILE_NAME } from "./utils";

const CONFIG_FILE = Path.join(
  FileManager.appGroupDocumentsDirectory,
  CONFIG_FILE_NAME
);

/**
 * 读取配置；返回 null 表示尚未写入或读取失败。
 * 兼容旧版 `isAutoRefreshing: 0 | 1`，统一归一化为 boolean。
 */
export const loadConfig = (): ACGConfig | null => {
  try {
    if (!FileManager.existsSync(CONFIG_FILE)) {
      return null;
    }
    const configStr = FileManager.readAsStringSync(CONFIG_FILE);
    if (!configStr) {
      return null;
    }
    const raw = JSON.parse(configStr) as {
      imageId?: unknown;
      refreshInterval?: unknown;
      isAutoRefreshing?: unknown;
    };
    return {
      // 历史版本可能把 imageId / refreshInterval 存成 number，统一转成字符串
      imageId: raw.imageId == null ? "" : String(raw.imageId),
      refreshInterval:
        raw.refreshInterval == null ? "" : String(raw.refreshInterval),
      // 兼容历史 0/1 数字与 "true"/"false" 字符串存储
      isAutoRefreshing:
        raw.isAutoRefreshing === true ||
        raw.isAutoRefreshing === 1 ||
        raw.isAutoRefreshing === "true" ||
        raw.isAutoRefreshing === "1",
    };
  } catch (error) {
    console.error("读取配置文件失败:", error);
    return null;
  }
};

export const saveConfig = (config: ACGConfig): void => {
  try {
    FileManager.writeAsStringSync(CONFIG_FILE, JSON.stringify(config));
  } catch (error) {
    console.error("保存配置失败:", error);
    throw error;
  }
};
