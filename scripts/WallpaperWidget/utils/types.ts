export interface ACGApiResponse {
  url: string;
  width: number;
  height: number;
  ratio: string;
}

export interface ACGConfig {
  /** 用户指定的图片 ID，字符串形式；空串或 "0" 表示随机 */
  imageId: string;
  /** 自动刷新间隔（秒），字符串形式 */
  refreshInterval: string;
  /** 是否启用自动刷新 */
  isAutoRefreshing: boolean;
}
