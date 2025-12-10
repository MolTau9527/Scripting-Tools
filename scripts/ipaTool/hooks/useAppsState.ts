import { createGlobalState } from "../modules/createGlobalStateUtils";
import { throttle } from "../utils";
import { AppConfig } from "../constants/AppConfig";
import { removeFileIfNotExists } from "../utils/fileCleanup";

import type {
  DownloadTaskOptions,
  DownloadStatus,
  Progress,
} from "../modules/download";

export type DownloadTaskState = {
  down: DownloadTaskOptions & {
    sinf?: {
      type: "Buffer";
      data: number[];
    };
    displayVersion?: string;
    externalVersionId?: number;
    bundleId?: string;
    metadata?: string;
    icon?: string;
  };
  status: DownloadStatus;
  progress: Progress;
};
export type InitState = Record<number, DownloadTaskState>;

// 初始状态
const initState: InitState = {};

// 创建全局状态管理
export const useAppsHook = createGlobalState(
  (state: InitState, action: (prev: InitState) => InitState) => {
    return { ...state, ...action(state) };
  },
  initState,
  { storageKey: AppConfig.storageKeys.downloadTasks }
);

//启动时状态预处理
useAppsHook.setState(appsState => {
  if (!Object.keys(appsState)) return appsState;

  Object.keys(appsState).forEach(key => {
    const appState = appsState[Number(key)];
    switch (appState?.status) {
      case "downloading":
        appState.status = "cancelled";
        break;

      case "failed":
      case "queued":
      case "cancelled":
        break;

      default:
        delete appsState[Number(key)];
        break;
    }
    removeFileIfNotExists(appState?.down?.name);
  });

  return appsState;
});

/**
 * 应用状态管理 Hook
 * 专注于全局状态管理，提供状态的读取和更新方法
 */

export const useAppsState = (id: number) => {
  const [appsState, dispatch] = useAppsHook();

  const setStatus = (status: DownloadStatus) => {
    dispatch(prev => ({ [id]: { ...prev[id], status } }));
  };

  const setProgress = throttle((progress: Progress) => {
    dispatch(prev => ({ [id]: { ...prev[id], progress } }));
  }, 100);

  const getAppState = () => {
    return (Object.create({}, Object.getOwnPropertyDescriptors(appsState))?.[
      id
    ] ?? {}) as DownloadTaskState;
  };

  const setAppState = (prop: Partial<DownloadTaskState>) => {
    dispatch(prev => ({ [id]: { ...prev[id], ...prop } }));
  };

  const get = <K extends keyof DownloadTaskState>(key: K) => {
    return getAppState()[key];
  };

  const remove = () => {
    dispatch(prev => ({ ...prev, [id]: { status: "deleted" } as any }));
  };

  return {
    get appState() {
      return appsState?.[id] ?? {};
    },
    getAppState,
    setStatus,
    setProgress,
    setAppState,
    remove,
    get,
  };
};
