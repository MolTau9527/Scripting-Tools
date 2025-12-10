import { ConfigData } from '../pages/SettingsPage';
import { ClientData } from './public/types';
import { fetchQbData, clearQbSession } from './qb';
import { fetchTrData, clearTrSession } from './tr';

// Re-export client-specific exports
export { fetchQbData, QB_SESSION_KEY } from './qb';
export { fetchTrData, TR_SESSION_KEY } from './tr';

// Unified data fetch function that works with both qBittorrent and Transmission
export const fetchData = async (config: ConfigData): Promise<ClientData | null> => {
  if (config.clientType === 'tr') {
    return fetchTrData(config);
  }
  return fetchQbData(config);
};

// Clear session for the current client type
export const clearSession = (clientType?: 'qb' | 'tr') => {
  if (clientType === 'tr') {
    clearTrSession();
  } else {
    clearQbSession();
  }
};
