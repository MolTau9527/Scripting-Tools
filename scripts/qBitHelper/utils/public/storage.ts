import { ClientData, HistoryPoint } from './types';

export const STORAGE_KEY = 'qbitConfig';
export const HISTORY_KEY = 'qbitHistory';
export const MAX_HISTORY_POINTS = 10;
export const DEFAULT_REFRESH_MINUTES = 0.5;

export const updateHistory = (data: ClientData): HistoryPoint[] => {
  const history = Storage.get<HistoryPoint[]>(HISTORY_KEY) || [];
  const newHistory = [...history, {
    timestamp: Date.now(),
    uploadRate: data.uploadRate,
    downloadRate: data.downloadRate
  }].slice(-MAX_HISTORY_POINTS);
  Storage.set(HISTORY_KEY, newHistory);
  return newHistory;
};
