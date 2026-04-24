import { fetch, AbortSignal } from "scripting";
import {
  CACHE_PREFIX,
  MAX_CACHE_FILES,
  FETCH_TIMEOUT_MS,
  inferImageExt,
} from "./utils";

/**
 * 获取缓存目录（使用 App Group 共享目录，widget 进程可访问）。
 */
export function getCacheDir(): string {
  return FileManager.appGroupDocumentsDirectory;
}

interface CacheEntry {
  name: string;
  path: string;
  /**
   * 仅使用 stat 结果统一排序（秒）；stat 失败时为 -1，
   * 不混杂文件名中的毫秒时间戳，避免量纲混用导致排序错乱。
   */
  mtime: number;
}

function listCacheFiles(): CacheEntry[] {
  const dir = getCacheDir();
  if (!dir || !FileManager.existsSync(dir)) return [];
  let files: string[];
  try {
    files = FileManager.readDirectorySync(dir) ?? [];
  } catch {
    return [];
  }
  return files
    .filter((f) => f.startsWith(CACHE_PREFIX) && !f.endsWith(".json"))
    .map<CacheEntry>((f) => {
      const path = `${dir}/${f}`;
      let mtime = -1;
      try {
        const stat = FileManager.statSync(path);
        const t = stat.modificationDate || stat.creationDate || 0;
        if (t > 0) mtime = t;
      } catch {
        // 保留 mtime=-1，排序时退化到末尾
      }
      return { name: f, path, mtime };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

/**
 * 清理旧的缓存文件，只保留最新的 MAX_CACHE_FILES 张（含刚下载的那张）。
 * 应在下载成功后再调用，避免下载失败时缓存被提前减少。
 */
export async function cleanOldCache(): Promise<void> {
  try {
    const entries = listCacheFiles();
    for (let i = MAX_CACHE_FILES; i < entries.length; i++) {
      try {
        await FileManager.remove(entries[i].path);
        console.log("已清理旧缓存:", entries[i].name);
      } catch {
        // 忽略单次删除失败
      }
    }
  } catch (error) {
    console.error("清理缓存失败:", error);
  }
}

/**
 * 返回最近一张缓存图片路径；无缓存则 null。
 */
export function getLatestCachedImage(): string | null {
  const entries = listCacheFiles();
  return entries.length > 0 ? entries[0].path : null;
}

/**
 * 下载图片并保存到本地缓存。
 * @param url 图片URL
 * @returns 本地文件路径，失败返回 null
 */
export async function downloadAndSaveImage(
  url: string
): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const data = Data.fromArrayBuffer(buffer);
    if (!data) {
      throw new Error("图片数据无效");
    }

    const ext = inferImageExt(url);
    const fileName = `${CACHE_PREFIX}${Date.now()}.${ext}`;
    const filePath = `${getCacheDir()}/${fileName}`;

    await FileManager.writeAsData(filePath, data);
    console.log("图片已保存:", filePath);
    return filePath;
  } catch (error) {
    console.error("下载保存图片失败:", error);
    return null;
  }
}

/**
 * 加载图片：下载成功后再清理旧缓存（保留最新 MAX_CACHE_FILES 张）。
 * 下载失败时不抛错也不清理，由调用方决定是否回退。
 */
export async function loadAndCacheImage(
  imageUrl: string
): Promise<string | null> {
  const filePath = await downloadAndSaveImage(imageUrl);
  if (filePath) {
    await cleanOldCache();
  }
  return filePath;
}
