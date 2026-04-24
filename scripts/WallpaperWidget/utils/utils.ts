// ===== 常量 =====

/** 随机 ID 上限 */
export const MAX_RANDOM_ID = 9999;
/** ID 最小值 */
export const MIN_ID = 1;
/** 自动刷新允许的最小间隔（秒） */
export const MIN_REFRESH_INTERVAL = 60;
/** 自动刷新允许的最大间隔（秒，1 小时），与 UI Picker 选项上限对齐 */
export const MAX_REFRESH_INTERVAL = 3600;
/** widget 兜底刷新间隔（秒） */
export const DEFAULT_REFRESH_SECONDS = 300;

/** 共享目录下 文件命名前缀，统一收敛 */
export const CACHE_PREFIX = "acg_wallpaper_";
/** 保留的最大缓存文件数 */
export const MAX_CACHE_FILES = 3;
/** 配置文件名，与缓存前缀同域保持一致 */
export const CONFIG_FILE_NAME = "acg_wallpaper_config.json";

/** 网络请求超时（毫秒） */
export const FETCH_TIMEOUT_MS = 8000;

// ===== 工具函数 =====

export const generateRandomId = (): number => {
  return Math.floor(Math.random() * MAX_RANDOM_ID) + MIN_ID;
};

/**
 * 校验图片 ID 输入。
 * 规则：空字符串视为 "随机"（valid=true，无 value）；否则必须是正整数。
 */
export const validateId = (
  id: string
): { valid: boolean; value?: number; error?: string } => {
  const trimmed = id.trim();

  if (!trimmed) {
    return { valid: true };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: "ID 必须是纯数字" };
  }
  const numValue = parseInt(trimmed, 10);
  if (numValue <= 0) {
    return { valid: false, error: "ID 必须大于 0" };
  }
  if (numValue > MAX_RANDOM_ID) {
    return { valid: false, error: `ID 不能超过 ${MAX_RANDOM_ID}` };
  }
  return { valid: true, value: numValue };
};

/**
 * 校验刷新间隔（秒）。
 * 空串表示未设置；否则必须是 >= MIN_REFRESH_INTERVAL 的整数。
 */
export const validateInterval = (
  interval: string
): { valid: boolean; value?: number; error?: string } => {
  const trimmed = interval.trim();

  if (!trimmed) {
    return { valid: true };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: "间隔必须是纯数字" };
  }
  const numValue = parseInt(trimmed, 10);
  if (numValue < MIN_REFRESH_INTERVAL) {
    return {
      valid: false,
      error: `间隔不能小于 ${MIN_REFRESH_INTERVAL} 秒`,
    };
  }
  if (numValue > MAX_REFRESH_INTERVAL) {
    return {
      valid: false,
      error: `间隔不能超过 ${MAX_REFRESH_INTERVAL} 秒`,
    };
  }
  return { valid: true, value: numValue };
};

/**
 * 从 URL 推断图片扩展名，失败回退到 "jpg"。
 * 实现：取 pathname（? 之前、# 之前），再看结尾。
 */
export const inferImageExt = (url: string): string => {
  const noHash = url.split("#")[0];
  const noQuery = noHash.split("?")[0];
  const pathname = noQuery.toLowerCase();
  const m = pathname.match(/\.(png|jpe?g|webp|gif)$/);
  if (!m) return "jpg";
  return m[1] === "jpeg" ? "jpg" : m[1];
};
