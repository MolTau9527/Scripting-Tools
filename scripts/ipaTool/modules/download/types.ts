// 下载任务相关类型定义

import { DownloadTask } from "./DownloadTask";

/**
 * 下载任务状态
 */
export type DownloadStatus =
  | "pending"
  | "downloading"
  | "completed"
  | "cancelled"
  | "queued"
  | "failed"
  | "deleted"
  | "fetching";

/**
 *
 *  Progress
 */
export interface Progress {
  downloaded: number;
  total: number;
  percent: number;
}

/**
 * 下载进度回调函数类型
 * @param downloadedSize 已下载大小（单位：字节）
 * @param totalSize 总大小（单位：字节）
 * @param progress 下载进度（单位：%）
 */
export type DownloadProgressCallback = ({
  downloaded,
  total,
  percent,
}: Progress) => void;

/**
 * 下载任务完成回调函数类型
 * @param status 最终状态
 */
export type DownloadTaskEndCallback = (status: "completed") => void;

/**
 * 下载失败错误类型
 */
export type DownloadFailedError = Error & {
  status: DownloadStatus | undefined;
};

/**
 * 下载任务失败回调函数类型
 * @param status 最终状态
 */
export type DownloadTaskFailedCallback = (
  status: Omit<DownloadStatus, "completed">,
  err: DownloadFailedError
) => void;

/**
 * 下载任务最终完成回调函数类型（无论成功或失败）
 * @param status 最终状态
 */
export type DownloadTaskFinallyCallback = (
  status: DownloadStatus,
  task: DownloadTask
) => void;

/**
 * 下载开始前回调函数类型
 * @param status 当前状态
 */
export type DownloadTaskStartCallback = DownloadTaskFinallyCallback;

/**
 * 下载任务配置选项
 */
export interface DownloadTaskOptions {
  /** 下载链接 */
  url: string;
  /** 文件名称 */
  name: string;
  /** 目标目录 */
  folder: string;
  /** 文件ID */
  id: number | string;
  /** 文件总大小 */
  totalSize?: number;
}
