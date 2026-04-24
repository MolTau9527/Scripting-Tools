export interface ClientData {
  upload: number;
  download: number;
  seeds: number;
  uploadRate: number;
  downloadRate: number;
  version?: string;
  downloadingSeeds: number;
  uploadingSeeds: number;
}

export interface HistoryPoint {
  timestamp: number;
  uploadRate: number;
  downloadRate: number;
}

export type ClientType = 'qb' | 'tr';

export interface ClientConfig {
  url: string;
  username: string;
  password: string;
  alias?: string;
  visible?: boolean;
}

export interface MultiClientConfig {
  qb: (ClientConfig | null)[];
  tr: (ClientConfig | null)[];
  activeClient?: { type: ClientType; index: number };
}

// 运行时配置（当前激活客户端的凭据 + 刷新策略）
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
  // 按客户端分组的历史数据点
  historyByClient: Record<string, HistoryPoint[]>;
  // 客户端数据缓存
  cache: ClientDataCache;
  // 多客户端配置
  multiClient: MultiClientConfig;
}
