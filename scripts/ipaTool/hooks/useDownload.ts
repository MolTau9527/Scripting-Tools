import { useAppsState } from "./useAppsState";
import type { DownloadTaskState } from "../hooks/useAppsState";
import { DownloadManager } from "../modules/download";
import { authorizeApp, sendNotification } from "../utils";
import { AppConfig, onConfigChange } from "../constants/AppConfig";
import { useDownloadCount } from "./useDownloadCount";
import { useAppsFilesState } from "./useAppsFilesState";

// 全局下载管理器实例
export const downloadManager = new DownloadManager(AppConfig.download);

//实时响应配置
onConfigChange((key, value) => {
  Object.assign(downloadManager, value);
}, "download");

/**
 * 下载管理 Hook
 * 专注于下载任务的创建、启动和管理
 * 依赖 useAppsState 进行状态管理
 *
 * ═══════════════════════════════════════
 */
export const useDownload = (id: number) => {
  const { udpDateTasks } = useDownloadCount();
  const { get, setStatus, setProgress, remove } = useAppsState(id);
  const [, AppsFilesDispatch] = useAppsFilesState();

  const startDownload = (down: DownloadTaskState["down"], isRun = true) => {
    const task = downloadManager.findTaskById(id);
    if (task) return task.start(isRun);

    return downloadManager
      .createTask({ ...down, name: `${down?.name}.zip` })
      .onProgress(setProgress)
      .onStatusChange(setStatus)
      .onStatusChange(udpDateTasks)
      .onRemove(remove)
      .onRemove(udpDateTasks)
      .onEnd(() => authorizeApp(down))
      .onFinally((status, task) => {
        const appName = task.name.replace("zip", "ipa");
        if (status === "completed") {
          sendNotification("downloadSuccess", `${appName} 下载完成 ✅`);
          setTimeout(removeTask, 0);
        }
        AppsFilesDispatch({ type: "udpDate" });
      })
      .onFailed((status, error) => {
        if (status === "failed") {
          sendNotification("downloadFailed", `${error.message} ❌`);
        }
      })
      .start(isRun);
  };

  const removeTask = () => {
    const existingTask = downloadManager.findTaskById(id);
    const task = existingTask ?? startDownload(get("down"), false);
    task?.remove();
  };

  return {
    startDownload,
    removeTask,
  };
};
