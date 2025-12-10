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
