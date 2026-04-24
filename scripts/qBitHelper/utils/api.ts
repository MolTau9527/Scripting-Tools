import { ConfigData, ClientType } from './public/types';
import { ClientData } from './public/types';
import { fetchQbData, clearQbSession } from './qb/api';
import { fetchTrData, clearTrSession } from './tr/api';

// 统一的客户端数据获取（按 clientType 调度）
export const fetchData = async (config: ConfigData): Promise<ClientData | null> =>
  config.clientType === 'tr' ? fetchTrData(config) : fetchQbData(config);

// 清除对应客户端的 session（切换 / 重置时用）
export const clearSession = (clientType?: ClientType) => {
  if (clientType === 'tr') clearTrSession();
  else clearQbSession();
};
