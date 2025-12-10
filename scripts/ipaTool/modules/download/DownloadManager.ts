import { DownloadTask } from "./DownloadTask";
import type { DownloadTaskOptions, DownloadStatus } from "./types";
import { Notification } from "scripting";
import { BackgroundManager } from "../BackgroundManager";

/**
 * 下载管理器配置选项
 */
export interface DownloadManagerOptions {
  /** 最大任务数量 */
  maxTaskCount?: number;
  /** 最大同时下载数量 */
  maxDownloadingCount?: number;
}

/**
 * 下载管理器
 * 负责管理下载任务的生命周期、并发限制等
 */
export class DownloadManager {
  private backgroundManager = new BackgroundManager();
  private tasks: Set<DownloadTask> = new Set();
  maxTaskCount: number;
  maxDownloadingCount: number;

  /**
   * 获取当前任务总数
   */
  get taskCount(): number {
    return this.tasks.size;
  }

  /**
   * 获取当前正在下载的任务数量
   */
  get downloadingCount(): number {
    return [...this.tasks].filter(task =>
      ["downloading", "fetching"].includes(task.status)
    ).length;
  }

  constructor({
    maxTaskCount = Number.MAX_SAFE_INTEGER,
    maxDownloadingCount = Number.MAX_SAFE_INTEGER,
  }: DownloadManagerOptions = {}) {
    this.maxTaskCount = maxTaskCount;
    this.maxDownloadingCount = maxDownloadingCount;
  }

  /**
   * 创建新任务（不自动启动）
   * @param options 下载任务配置
   * @returns 创建的任务实例
   */
  createTask(options: DownloadTaskOptions): DownloadTask {
    if (!this.canAddTask()) {
      const title = `最多只能添加 ${this.maxTaskCount} 个任务`;
      Notification.schedule({ title });
      throw new Error(title);
    }

    const task = new DownloadTask(options)
      .onStart(() => {
        if (!this.canStartDownload()) {
          const title = `最多只能同时下载 ${this.maxDownloadingCount} 个任务`;
          // Notification.schedule({ title });
          throw Object.assign(new Error(title), { status: "queued" });
        }

        // BackgroundKeeper.keepAlive();
        this.backgroundManager.setActive(true);
      })
      .onFinally(() => {
        if (this.canStartDownload()) {
          const pendingTasks = this.getTasksByStatus("queued");
          const availableSlots =
            this.maxDownloadingCount - this.downloadingCount;
          pendingTasks.slice(0, availableSlots).forEach(task => task.start());
        }
        if (!this.getTasksByStatus("downloading").length) {
          // BackgroundKeeper.stopKeepAlive();
          this.backgroundManager.setActive(false);
        }
      })
      .onRemove(() => {
        this.tasks.delete(task);
      });

    // 检查当前所有任务ID，没有这个ID才添加到任务队列 否则返回已存在任务
    const existingTask = this.findTaskById(task.id);

    if (existingTask) return existingTask;
    this.addTask(task);
    return task;
  }

  /**
   * 批量创建任务
   * @param options 任务配置数组
   * @returns 创建的任务实例数组
   */
  createTasks(options: DownloadTaskOptions[]): DownloadTask[] {
    return options.map(option => this.createTask(option));
  }

  /**
   * 获取所有任务列表,如果没有任务则从配置初始化任务
   * @param options 可选的初始化任务配置(用于 App 重启后恢复)
   * @returns 任务实例数组 或空数组
   */
  getTasks(options?: DownloadTaskOptions[]): DownloadTask[] | [] {
    // 如果已有任务，直接返回
    if (this.tasks.size > 0) {
      return [...this.tasks];
    }

    // 如果提供了初始化任务数组，批量创建任务
    if (options && options.length > 0) {
      return this.createTasks(options);
    }

    return [];
  }

  /**
   * 检查是否可以添加新任务
   */
  canAddTask(): boolean {
    return this.taskCount < this.maxTaskCount;
  }

  /**
   * 添加任务
   */
  addTask(task: DownloadTask): void {
    if (!this.canAddTask()) {
      throw new Error(`最多只能添加 ${this.maxTaskCount} 个任务`);
    }
    this.tasks.add(task);
  }

  /**
   * 检查是否可以开始新的下载
   */
  canStartDownload(): boolean {
    return this.downloadingCount < this.maxDownloadingCount;
  }

  /**
   * 根据ID查找任务
   * @param id 任务ID
   * @returns 找到的任务或undefined
   */
  findTaskById(id: number | string | undefined): DownloadTask | undefined {
    if (!id) return;
    return [...this.tasks].find(task => task.id === id);
  }

  /**
   * 获取指定状态的任务
   * @param status 任务状态
   * @returns 符合条件的任务数组
   */
  getTasksByStatus(status: DownloadStatus | "all"): DownloadTask[] {
    return [...this.tasks].filter(
      task => task.status === status || status === "all"
    );
  }

  /**
   * 清空所有任务
   */
  clearAllTasks(): void {
    // 清除所有正在下载的任务
    this.getTasksByStatus("all").forEach(task => task.remove());
    this.tasks.clear();
  }

  /**
   * 取消所有正在下载的任务
   */
  cancelAllTasks(): void {
    this.getTasksByStatus("downloading").forEach(task => task.cancel());
  }

  /**
   * 更新限制配置
   * @param limits 新的限制配置
   */
  updateLimits(limits: DownloadManagerOptions): void {
    if (limits.maxTaskCount !== undefined) {
      this.maxTaskCount = limits.maxTaskCount;
    }
    if (limits.maxDownloadingCount !== undefined) {
      this.maxDownloadingCount = limits.maxDownloadingCount;
    }
  }

  /**
   * 获取当前限制配置
   */
  getLimits(): { maxTaskCount: number; maxDownloadingCount: number } {
    return {
      maxTaskCount: this.maxTaskCount,
      maxDownloadingCount: this.maxDownloadingCount,
    };
  }
}
