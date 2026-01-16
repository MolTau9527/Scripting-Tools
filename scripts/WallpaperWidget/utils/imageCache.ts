import { fetch } from "scripting";

// 声明全局对象
declare const FileManager: {
  appGroupDocumentsDirectory: string;
  readDirectorySync(path: string): string[];
  existsSync(path: string): boolean;
  remove(path: string): Promise<void>;
  writeAsData(path: string, data: Data): Promise<void>;
};

declare const Data: {
  fromArrayBuffer(buffer: ArrayBuffer): Data;
};

// 缓存配置
const CACHE_PREFIX = "acg_wallpaper_";
const MAX_CACHE_FILES = 3;

/**
 * 获取缓存目录（使用 App Group 共享目录）
 */
export function getCacheDir(): string {
  return FileManager.appGroupDocumentsDirectory;
}

/**
 * 清理旧的缓存文件，只保留最新的几张
 */
export async function cleanOldCache(): Promise<void> {
  try {
    const cacheDir = getCacheDir();
    if (!cacheDir || !FileManager.existsSync(cacheDir)) return;

    const files = FileManager.readDirectorySync(cacheDir);
    if (!files) return;

    // 筛选出本脚本的缓存文件
    const cacheFiles = files
      .filter(f => f.startsWith(CACHE_PREFIX))
      .map(f => ({
        name: f,
        path: `${cacheDir}/${f}`,
        timestamp: parseInt(f.replace(CACHE_PREFIX, "").split(".")[0]) || 0
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // 删除超出数量限制的旧文件
    for (let i = MAX_CACHE_FILES; i < cacheFiles.length; i++) {
      try {
        await FileManager.remove(cacheFiles[i].path);
        console.log("已清理旧缓存:", cacheFiles[i].name);
      } catch (e) {
        // 忽略删除失败
      }
    }
  } catch (error) {
    console.error("清理缓存失败:", error);
  }
}

/**
 * 下载图片并保存到本地缓存
 * @param url 图片URL
 * @returns 本地文件路径，失败返回 null
 */
export async function downloadAndSaveImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const data = Data.fromArrayBuffer(buffer);

    // 生成唯一文件名
    const ext = url.includes(".png") ? "png" : "jpg";
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
 * 加载图片：先清理旧缓存，再下载新图片
 * @param imageUrl 图片URL
 * @returns 本地文件路径，失败返回 null
 */
export async function loadAndCacheImage(imageUrl: string): Promise<string | null> {
  await cleanOldCache();
  return downloadAndSaveImage(imageUrl);
}
