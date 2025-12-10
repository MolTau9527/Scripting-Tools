import { AbortController, Path, fetch } from "scripting";
import { EventBus } from "../EventBus";

import type {
  DownloadTaskStartCallback,
  DownloadStatus,
  DownloadProgressCallback,
  DownloadTaskEndCallback,
  DownloadTaskFailedCallback,
  DownloadTaskFinallyCallback,
  DownloadTaskOptions,
  DownloadFailedError,
} from "./types";

export class DownloadTask {
  private bus = new EventBus();
  downloadedSize: number = 0;
  status: DownloadStatus = "pending";
  id: number | string;
  totalSize?: number;
  url: string;
  name: string;
  folder: string;

  /**
   * 初始化下载请求
   * @param options 下载任务配置选项
   */
  constructor(options: Omit<DownloadTaskOptions, "totalSize">);
  /**
   * 断点续传初始化下载请求
   * @param options 下载任务配置选项
   */
  constructor(options: Required<DownloadTaskOptions>);

  constructor(options: DownloadTaskOptions) {
    this.id = options.id ?? Date.now();
    this.totalSize = options.totalSize;
    this.url = options.url;
    this.name = options.name;
    this.folder = options.folder;
  }

  /**
   * 下载逻辑
   * @returns 下载任务实例
   */
  start(isRun = true): this {
    if (!isRun) return this;

    if (this.status === "downloading") {
      this.cancel();
      return this;
    }

    const controller = new AbortController();
    Promise.try(async () => {
      this.bus.emit("downloadStart", this.status);
      this.downloadedSize = await this.appSize();
      const resp = await fetch(this.url, {
        signal: controller.signal,
        headers: { Range: `bytes=${this.downloadedSize}-` },
      });
      this.totalSize ??= Number(resp.headers.get("content-length"));
      this.status = "downloading";
      this.bus.emit("downloadStatusChange", "downloading");

      const filePath = await this.#appFilePath();

      // 验证响应状态码
      if (!resp.ok) {
        throw new Error(`下载错误 HTTP ${resp.status}`);
      }

      // 验证 Range 请求成功
      if (this.downloadedSize > 0 && resp.status !== 206) {
        throw new Error("断点续传请求失败, 请删除下载文件后重新下载");
      }

      for await (const chunk of resp.body) {
        if (this.status !== "downloading") {
          throw Object.assign(new Error("下载已暂停"), { status: this.status });
        }
        await FileManager.appendData(filePath, chunk);
        this.downloadedSize += chunk.size;
        this.bus.emit("downloadProgress", {
          downloaded: this.downloadedSize,
          total: this.totalSize,
          percent: Number((this.downloadedSize / this.totalSize).toFixed(2)),
        });
      }

      this.status = "completed";
    })
      .then(() => {
        this.bus.emit("downloadEnd", this.status);
      })
      .catch((err: DownloadFailedError) => {
        this.status = err.status ?? "failed";
        controller?.abort?.();
        this.bus.emit("downloadFailed", this.status, err);
        console.log("下载任务失败：", err.toString());
      })
      .finally(() => {
        this.bus.emit("downloadStatusChange", this.status);
        this.bus.emit("downloadFinally", this.status, this);
      });

    return this;
  }

  /**
   * 取消下载任务
   */
  cancel(): void {
    if (this.status !== "downloading") return;
    this.status = "cancelled";
    this.bus.emit("downloadCancel", "cancelled");
    console.log("取消下载任务", this.name);
  }

  /**
   * 删除下载任务
   */
  remove(): void {
    this.status = "deleted";
    this.#appFilePath().then(filePath => {
      FileManager.remove(filePath);
      this.bus.emit("downloadRemove", "deleted");
      console.log("删除下载任务", this.name);
    });
  }

  /**
   * 清理任务资源（清空所有事件监听器）
   * 通常在任务从管理器中移除时调用
   */
  dispose(): void {
    this.bus.clear();
  }

  /**
   * 获取应用安装包文件路径
   * @returns 应用安装包存件路径
   */
  async #appFilePath(): Promise<string> {
    const dir = Path.join(FileManager.documentsDirectory, this.folder);
    await FileManager.createDirectory(dir, true);
    return Path.join(dir, `${this.id}-${this.name}`);
  }

  /**
   * 获取应用安装包大小
   * @returns 应用安装包大小（单位：字节）
   */
  async appSize(): Promise<number> {
    try {
      const stat = await FileManager.stat(await this.#appFilePath());
      return stat.size;
    } catch {
      return 0;
    }
  }

  /**
   * 注册下载取消hook
   * @param cb 下载取消回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onCancel(cb: (status: "pending") => void): this {
    this.bus.on("downloadCancel", cb);
    return this;
  }

  /**
   * 移除下载取消hook
   * @param cb 下载取消回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offCancel(cb: (status: "pending") => void): this {
    this.bus.off("downloadCancel", cb);
    return this;
  }

  /**
   * 注册下载删除hook
   * @param cb 下载删除回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onRemove(cb: (status: "deleted") => void): this {
    this.bus.on("downloadRemove", cb);
    return this;
  }

  /**
   * 移除下载删除hook
   * @param cb 下载删除回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offRemove(cb: (status: "deleted") => void): this {
    this.bus.off("downloadRemove", cb);
    return this;
  }

  /**
   * 下载执行前的hook
   * @param cb 下载开始前回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onStart(cb: DownloadTaskStartCallback): this {
    this.bus.on("downloadStart", cb);
    return this;
  }

  /**
   * 移除下载执行前的hook
   * @param cb 下载开始前回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offStart(cb: DownloadTaskStartCallback): this {
    this.bus.off("downloadStart", cb);
    return this;
  }

  /**
   * 注册下载进度hook
   * @param cb 下载进度回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onProgress(cb: DownloadProgressCallback): this {
    this.bus.on("downloadProgress", cb);
    return this;
  }

  /**
   * 移除下载进度hook
   * @param cb 下载进度回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offProgress(cb: DownloadProgressCallback): this {
    this.bus.off("downloadProgress", cb);
    return this;
  }

  /**
   * 注册下载任务完成hook
   * @param cb 下载（成功）回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onEnd(cb: DownloadTaskEndCallback): this {
    this.bus.on("downloadEnd", cb);
    return this;
  }

  /**
   * 移除下载任务完成hook
   * @param cb 下载（成功）回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offEnd(cb: DownloadTaskEndCallback): this {
    this.bus.off("downloadEnd", cb);
    return this;
  }

  /**
   * 注册下载任务失败hook
   * @param cb 下载（失败）回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onFailed(cb: DownloadTaskFailedCallback): this {
    this.bus.on("downloadFailed", cb);
    return this;
  }

  /**
   * 移除下载任务失败hook
   * @param cb 下载（失败）回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offFailed(cb: DownloadTaskFailedCallback): this {
    this.bus.off("downloadFailed", cb);
    return this;
  }

  /**
   * 注册下载任务完成（无论成功或失败）hook
   * @param cb 下载（完成）回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onFinally(cb: DownloadTaskFinallyCallback): this {
    this.bus.on("downloadFinally", cb);
    return this;
  }

  /**
   * 移除下载任务完成（无论成功或失败）hook
   * @param cb 下载（完成）回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offFinally(cb: DownloadTaskFinallyCallback): this {
    this.bus.off("downloadFinally", cb);
    return this;
  }

  /**
   * 监听任务状态变化
   * @param cb 任务状态变化回调函数
   * @returns 返回当前实例，支持链式调用
   */
  onStatusChange(cb: (status: DownloadStatus) => void): this {
    this.bus.on("downloadStatusChange", cb);
    return this;
  }

  /**
   * 移除任务状态变化hook
   * @param cb 任务状态变化回调函数
   * @returns 返回当前实例，支持链式调用
   */
  offStatusChange(cb: (status: DownloadStatus) => void): this {
    this.bus.off("downloadStatusChange", cb);
    return this;
  }
}
