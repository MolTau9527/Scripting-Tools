import { fetch } from "scripting";
import { QbConfigData } from '../pages/SettingsPage';

export interface QbData {
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

interface QbTransferInfo {
  dl_info_speed: number;
  dl_info_data: number;
  up_info_speed: number;
  up_info_data: number;
}

interface QbTorrentInfo {
  state: string;
}

export const STORAGE_KEY = 'qbitConfig';
export const SESSION_KEY = 'qbitSession';
export const HISTORY_KEY = 'qbitHistory';
export const MAX_HISTORY_POINTS = 10;
export const DEFAULT_REFRESH_MINUTES = 0.5;

const extractSID = (setCookie: string | null): string | null =>
  setCookie?.match(/SID=([^;]+)/)?.[1] ?? null;

const loginQb = async (config: QbConfigData): Promise<string | null> => {
  try {
    const response = await fetch(`${config.url}/api/v2/auth/login`, {
      method: 'POST',
      body: `username=${encodeURIComponent(config.username)}&password=${encodeURIComponent(config.password)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if ((await response.text()) !== 'Ok.') return null;
    return extractSID(response.headers.get('set-cookie') || response.headers.get('Set-Cookie'));
  } catch {
    return null;
  }
};

const getOrRefreshSession = async (config: QbConfigData): Promise<string | null> => {
  let sid = Storage.get<string>(SESSION_KEY);
  if (!sid) {
    sid = await loginQb(config);
    if (sid) Storage.set(SESSION_KEY, sid);
  }
  return sid;
};

const fetchWithAuth = async (config: QbConfigData, url: string) => {
  let sid = await getOrRefreshSession(config);
  if (!sid) throw new Error('登录失败');

  let response = await fetch(url, { headers: { 'Cookie': `SID=${sid}` } });

  if (response.status === 403) {
    Storage.remove(SESSION_KEY);
    sid = await loginQb(config);
    if (!sid) throw new Error('重新登录失败');
    Storage.set(SESSION_KEY, sid);
    response = await fetch(url, { headers: { 'Cookie': `SID=${sid}` } });
    if (!response.ok) throw new Error('获取数据失败');
  }

  return response;
};

const isDownloading = (state: string) => state.includes('downloading') || state === 'stalledDL';
const isUploading = (state: string) => state.includes('uploading') || state === 'stalledUP' || state.includes('seeding');

export const fetchQbData = async (config: QbConfigData): Promise<QbData | null> => {
  try {
    const baseUrl = config.url;
    const [transferRes, torrentsRes, versionRes] = await Promise.all([
      fetchWithAuth(config, `${baseUrl}/api/v2/transfer/info`),
      fetchWithAuth(config, `${baseUrl}/api/v2/torrents/info`),
      fetchWithAuth(config, `${baseUrl}/api/v2/app/version`),
    ]);

    const [transfer, torrents, version]: [QbTransferInfo, QbTorrentInfo[], string] = await Promise.all([
      transferRes.json(),
      torrentsRes.json(),
      versionRes.text(),
    ]);

    return {
      upload: transfer.up_info_data || 0,
      download: transfer.dl_info_data || 0,
      seeds: torrents.length,
      uploadRate: transfer.up_info_speed || 0,
      downloadRate: transfer.dl_info_speed || 0,
      version: version || 'Unknown',
      downloadingSeeds: torrents.filter(t => isDownloading(t.state)).length,
      uploadingSeeds: torrents.filter(t => isUploading(t.state)).length,
    };
  } catch {
    return null;
  }
};
