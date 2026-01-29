import { ClientData, HistoryPoint, ClientType, MultiClientConfig, ClientConfig } from './types';

// 统一存储 key
export const QBIT_HELPER_DATA_KEY = 'qbitHelperData';

export const MAX_HISTORY_POINTS = 10;
export const DEFAULT_REFRESH_MINUTES = 5;
export const CACHE_DURATION = 30 * 60 * 1000; // 30分钟，确保切换客户端时有缓存可用
export const CLIENT_COUNT = 3;

// 配置数据结构
export interface ConfigData {
  url: string;
  username: string;
  password: string;
  refreshMinutes?: number;
  clientType?: ClientType;
  clientIndex?: number;
}

// 客户端数据缓存结构
export interface ClientDataCache {
  [key: string]: {
    data: ClientData;
    timestamp: number;
  };
}

// 统一的存储数据结构
export interface QbitHelperData {
  // 当前激活的配置
  config: ConfigData | null;
  // 历史数据点
  history: HistoryPoint[];
  // 按客户端分组的历史数据点
  historyByClient: Record<string, HistoryPoint[]>;
  // 客户端数据缓存
  cache: ClientDataCache;
  // 多客户端配置
  multiClient: MultiClientConfig;
}

// 默认的多客户端配置
export const getDefaultMultiConfig = (): MultiClientConfig => ({
  qb: Array(CLIENT_COUNT).fill(null),
  tr: Array(CLIENT_COUNT).fill(null),
  activeClient: { type: 'qb', index: 0 }
});

// 默认的存储数据
const getDefaultData = (): QbitHelperData => ({
  config: null,
  history: [],
  historyByClient: {},
  cache: {},
  multiClient: getDefaultMultiConfig()
});

// 获取统一存储数据
export const getQbitHelperData = (): QbitHelperData => {
  const saved = Storage.get<QbitHelperData>(QBIT_HELPER_DATA_KEY);
  if (saved) {
    const historyByClient = saved.historyByClient || {};
    if (!saved.historyByClient && saved.history?.length) {
      const fallbackKey = getCacheKey(saved.config?.clientType ?? 'qb', saved.config?.clientIndex ?? 0);
      historyByClient[fallbackKey] = saved.history;
    }
    // 确保 multiClient 结构完整
    return {
      config: saved.config || null,
      history: saved.history || [],
      historyByClient,
      cache: saved.cache || {},
      multiClient: {
        qb: saved.multiClient?.qb?.length === CLIENT_COUNT
          ? saved.multiClient.qb
          : Array(CLIENT_COUNT).fill(null).map((_, i) => saved.multiClient?.qb?.[i] || null),
        tr: saved.multiClient?.tr?.length === CLIENT_COUNT
          ? saved.multiClient.tr
          : Array(CLIENT_COUNT).fill(null).map((_, i) => saved.multiClient?.tr?.[i] || null),
        activeClient: saved.multiClient?.activeClient || { type: 'qb', index: 0 }
      }
    };
  }

  // 返回默认数据
  return getDefaultData();
};

// 保存统一存储数据
export const setQbitHelperData = (data: QbitHelperData): void => {
  Storage.set(QBIT_HELPER_DATA_KEY, data);
};

// ========== 便捷方法 ==========

// 生成缓存 key
export const getCacheKey = (type: ClientType, index: number) => `${type}_${index}`;

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

  data.history = newHistory;
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
