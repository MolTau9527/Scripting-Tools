import {
  ClientData,
  HistoryPoint,
  ClientType,
  MultiClientConfig,
  ClientConfig,
  ConfigData,
  QbitHelperData,
} from './types';

// 统一存储 key
export const QBIT_HELPER_DATA_KEY = 'qbitHelperData';

export const MAX_HISTORY_POINTS = 10;
export const DEFAULT_REFRESH_MINUTES = 5;
export const CACHE_DURATION = 30 * 60 * 1000; // 30分钟，确保切换客户端时有缓存可用
export const CLIENT_COUNT = 3;

// 默认的多客户端配置
export const getDefaultMultiConfig = (): MultiClientConfig => ({
  qb: Array(CLIENT_COUNT).fill(null),
  tr: Array(CLIENT_COUNT).fill(null),
  activeClient: { type: 'qb', index: 0 }
});

// 默认的存储数据
const getDefaultData = (): QbitHelperData => ({
  config: null,
  historyByClient: {},
  cache: {},
  multiClient: getDefaultMultiConfig()
});

// 旧版本数据结构（包含已废弃的 history 字段），仅用于读取迁移
interface LegacyQbitHelperData extends QbitHelperData {
  history?: HistoryPoint[];
}

// 获取统一存储数据（防御式：Storage 损坏 / 类型错位不会出现崩溃，而是回退默认值）
export const getQbitHelperData = (): QbitHelperData => {
  try {
    const saved = Storage.get<LegacyQbitHelperData>(QBIT_HELPER_DATA_KEY);
    if (!saved || typeof saved !== 'object') return getDefaultData();

    // 兼容旧数据：若只有 history 而无 historyByClient，迁移到 historyByClient
    const rawHistory = saved.historyByClient;
    const historyByClient: Record<string, HistoryPoint[]> =
      rawHistory && typeof rawHistory === 'object' && !Array.isArray(rawHistory) ? { ...rawHistory } : {};
    if (!saved.historyByClient && Array.isArray(saved.history) && saved.history.length) {
      const fallbackKey = getCacheKey(saved.config?.clientType ?? 'qb', saved.config?.clientIndex ?? 0);
      historyByClient[fallbackKey] = saved.history;
    }

    const rawCache = saved.cache;
    const cache = rawCache && typeof rawCache === 'object' && !Array.isArray(rawCache) ? rawCache : {};

    const rawMulti = saved.multiClient;
    const multi = rawMulti && typeof rawMulti === 'object' ? rawMulti : undefined;

    // 确保 multiClient 结构完整
    return {
      config: saved.config || null,
      historyByClient,
      cache,
      multiClient: {
        qb: Array.isArray(multi?.qb) && multi!.qb.length === CLIENT_COUNT
          ? multi!.qb
          : Array(CLIENT_COUNT).fill(null).map((_, i) => (Array.isArray(multi?.qb) ? multi!.qb[i] : null) || null),
        tr: Array.isArray(multi?.tr) && multi!.tr.length === CLIENT_COUNT
          ? multi!.tr
          : Array(CLIENT_COUNT).fill(null).map((_, i) => (Array.isArray(multi?.tr) ? multi!.tr[i] : null) || null),
        activeClient: multi?.activeClient && typeof multi.activeClient === 'object'
          ? multi.activeClient
          : { type: 'qb', index: 0 }
      }
    };
  } catch (e) {
    console.log('[storage] getQbitHelperData failed, resetting to defaults:', e);
    return getDefaultData();
  }
};

// 保存统一存储数据
export const setQbitHelperData = (data: QbitHelperData): void => {
  Storage.set(QBIT_HELPER_DATA_KEY, data);
};

// ========== 便捷方法 ==========

// 生成缓存 key
export const getCacheKey = (type: ClientType, index: number) => `${type}_${index}`;

// 客户端图标本地缓存路径（供 Widget 与设置页共用）
export const getIconPath = (type: ClientType) =>
  `${FileManager.documentsDirectory}/qbit_${type}_icon.png`;

// 获取缓存的客户端数据
export const getCachedClientData = (type: ClientType, index: number): ClientData | null => {
  const data = getQbitHelperData();
  const cached = data.cache[getCacheKey(type, index)];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// 保存客户端数据到缓存
export const setCachedClientData = (type: ClientType, index: number, clientData: ClientData) => {
  const data = getQbitHelperData();
  data.cache[getCacheKey(type, index)] = { data: clientData, timestamp: Date.now() };
  setQbitHelperData(data);
};

// 批量保存多个客户端数据到缓存（原子写，避免并行竞态）
export interface CacheBatchEntry {
  type: ClientType;
  index: number;
  data: ClientData;
}

export const setCachedClientDataBatch = (entries: CacheBatchEntry[]) => {
  if (entries.length === 0) return;
  const data = getQbitHelperData();
  const now = Date.now();
  for (const e of entries) {
    data.cache[getCacheKey(e.type, e.index)] = { data: e.data, timestamp: now };
  }
  setQbitHelperData(data);
};

// 更新历史记录
export const updateHistory = (clientData: ClientData, clientKey?: string): HistoryPoint[] => {
  const data = getQbitHelperData();
  const key = clientKey ?? getCacheKey(data.config?.clientType ?? 'qb', data.config?.clientIndex ?? 0);
  const newHistory = [
    ...(data.historyByClient[key] || []),
    {
      timestamp: Date.now(),
      uploadRate: clientData.uploadRate,
      downloadRate: clientData.downloadRate
    }
  ].slice(-MAX_HISTORY_POINTS);

  data.historyByClient[key] = newHistory;
  setQbitHelperData(data);
  return newHistory;
};

// 获取配置
export const getConfig = (): ConfigData | null => {
  return getQbitHelperData().config;
};

// 保存配置
export const setConfig = (config: ConfigData): void => {
  const data = getQbitHelperData();
  data.config = config;
  setQbitHelperData(data);
};

// 获取多客户端配置
export const getMultiClientConfig = (): MultiClientConfig => {
  return getQbitHelperData().multiClient;
};

// 保存多客户端配置
export const setMultiClientConfig = (multiClient: MultiClientConfig): void => {
  const data = getQbitHelperData();
  data.multiClient = multiClient;
  setQbitHelperData(data);
};

// 更新单个客户端配置
export const updateClientConfig = (type: ClientType, index: number, config: ClientConfig): void => {
  const data = getQbitHelperData();
  data.multiClient[type][index] = config;
  setQbitHelperData(data);
};

// 合并 setter：切换激活客户端时一次读、一次写
// 替代 setConfig + setMultiClientConfig 两次读写
export const setActiveClientIndex = (type: ClientType, index: number): void => {
  const data = getQbitHelperData();
  const prev = data.config;
  data.config = {
    url: prev?.url ?? '',
    username: prev?.username ?? '',
    password: prev?.password ?? '',
    refreshMinutes: prev?.refreshMinutes ?? DEFAULT_REFRESH_MINUTES,
    clientType: type,
    clientIndex: index,
  };
  data.multiClient = { ...data.multiClient, activeClient: { type, index } };
  setQbitHelperData(data);
};

// 重置单个客户端配置
export const resetClientConfig = (type: ClientType, index: number): void => {
  const data = getQbitHelperData();
  data.multiClient[type][index] = null;
  // 如果重置的是当前激活的客户端，切换到默认
  if (data.multiClient.activeClient?.type === type && data.multiClient.activeClient?.index === index) {
    data.multiClient.activeClient = { type: 'qb', index: 0 };
  }
  setQbitHelperData(data);
};

// 重置所有配置
export const resetAllConfig = (): void => {
  setQbitHelperData(getDefaultData());
};
