export interface ACGApiResponse {
  url: string;
  width: number;
  height: number;
  ratio: string;
}

export interface ACGConfig {
  imageId: string;
  refreshInterval: string;
  isAutoRefreshing: number;
}
