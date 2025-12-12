// 文件：scripts/ipaTool/constants/appConfig.ts
// 说明：全局业务配置，供各模块与 Hook 使用（不包含样式）
// 注意：如果要新增样式，请在 designTokens.ts 中定义
import { deepProxy } from "../utils/deepProxy";
import { EventBus } from "../modules/EventBus";
import type { DeepMutable } from "../types/utils";

// 下载配置存储键（独立于配置对象外）
const DOWNLOAD_CONFIG_STORAGE_KEY = "download_config";
const bus = new EventBus();

// 下载相关配置
export const defaultConfig = Object.freeze({
  // 下载任务配置
  download: Object.freeze({
    maxTaskCount: 10,
    maxDownloadingCount: 3,
  }),

  // 文件夹路径
  file: Object.freeze({
    folder: "app-temp",
  }),

  // IPA 封装配置
  ipa: Object.freeze({
    disableUpdateCheck: false, // 免更新：禁止 App Store 检测更新
  }),

  // 通知配置
  notification: Object.freeze({
    downloadSuccess: true, // 下载成功通知开关
    downloadFailed: true, // 下载失败通知开关
    serverNotification: true, // 服务通知开关
  }),

  // 全局存储键统一管理（供 useAppsState 使用）
  storageKeys: Object.freeze({
    downloadTasks: "download_tasks",
    ipaMediaInfo: "ipa_media_info",
    loginHistory: "login_history",
  }),
});

// ============ 类型定义 ============
export type AppConfigType = DeepMutable<typeof defaultConfig>;
export type ConfigKey = keyof AppConfigType;
export type ConfigValue<K extends ConfigKey> = AppConfigType[K];

// 从存储加载配置，并与默认配置合并（确保新增配置项生效）
const storedConfig = Storage.get<AppConfigType>(DOWNLOAD_CONFIG_STORAGE_KEY);
const defaultConfigCopy: AppConfigType = JSON.parse(JSON.stringify(defaultConfig));

let config: AppConfigType;
if (!storedConfig) {
  config = defaultConfigCopy;
} else {
  // 合并配置：默认值 + 存储值（存储值优先）
  config = { ...defaultConfigCopy };
  for (const key of Object.keys(defaultConfigCopy) as ConfigKey[]) {
    if (storedConfig[key] !== undefined) {
      (config as any)[key] = { ...defaultConfigCopy[key], ...storedConfig[key] };
    }
  }
}
Storage.set(DOWNLOAD_CONFIG_STORAGE_KEY, config);

/**
 * 全局应用配置对象（响应式）
 * 使用 deepProxy 包装，实现配置修改时的自动持久化和事件通知
 *
 * @description
 * - 配置修改后自动保存到本地存储
 * - 通过 EventBus 发送配置变化事件，支持订阅监听
 * - 可在任何模块中直接修改，变化会立即生效
 */
export const AppConfig = deepProxy(config as AppConfigType, {
  set: (target, key, value, oldValue) => {
    // 自动持久化：配置变化时保存到本地存储
    Storage.set(DOWNLOAD_CONFIG_STORAGE_KEY, config);
    // 发送事件：通知订阅者配置已变化，便于其他模块响应
    bus.emit(DOWNLOAD_CONFIG_STORAGE_KEY, key, value, oldValue);
  },
});

// ============ 函数重载定义 ============

/**
 * 订阅特定配置项的变化（有类型推导）
 * @param callback 配置变化时的回调函数
 * @param keyFilter 要监听的配置键
 * @returns 返回取消订阅的函数
 *
 * @example
 * // 监听下载配置的变化，newValue 和 oldValue 有完整类型提示
 * const unsubscribe = onConfigChange((key, newValue, oldValue) => {
 *   console.log(newValue.maxTaskCount); // ✅ 类型提示: number
 * }, 'download');
 */
export function onConfigChange<K extends ConfigKey>(
  callback: (
    key: K,
    newValue: ConfigValue<K>,
    oldValue: ConfigValue<K>
  ) => void,
  keyFilter: K
): () => void;

/**
 * 订阅所有配置变化（联合类型）
 * @param callback 配置变化时的回调函数
 * @returns 返回取消订阅的函数
 *
 * @example
 * // 监听所有配置变化
 * const unsubscribe = onConfigChange((key, newValue, oldValue) => {
 *   if (key === 'download') {
 *     console.log(newValue.maxTaskCount); // ✅ 类型收窄后有提示
 *   }
 * });
 */
export function onConfigChange(
  callback: (
    key: ConfigKey,
    newValue: AppConfigType[ConfigKey],
    oldValue: AppConfigType[ConfigKey]
  ) => void
): () => void;

// ============ 实现 ============
export function onConfigChange(
  callback: (key: any, newValue: any, oldValue: any) => void,
  keyFilter?: ConfigKey
): () => void {
  const handler = (key: string | symbol, newValue: any, oldValue: any) => {
    // 如果指定了 keyFilter，只触发匹配的配置变化
    if (keyFilter === undefined || key === keyFilter) {
      callback(key, newValue, oldValue);
    }
  };

  bus.on(DOWNLOAD_CONFIG_STORAGE_KEY, handler);

  // 返回取消订阅的函数
  return () => {
    bus.off(DOWNLOAD_CONFIG_STORAGE_KEY, handler);
  };
}

/**
 * 重置配置到默认值
 * 将所有配置项恢复为 defaultConfig 中的默认值
 * 会触发配置变化事件，并自动保存到本地存储
 */
export const resetConfig = () => {
  // 深拷贝默认配置，避免引用冻结对象
  const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));

  Object.keys(defaultConfigCopy).forEach(key => {
    (AppConfig as any)[key] = defaultConfigCopy[key];
  });
};
