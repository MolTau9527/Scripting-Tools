import { AppConfig } from "../constants/AppConfig";
import { createGlobalState } from "../modules/createGlobalStateUtils";
import type { InitState as appsState } from "./useAppsState";
import type { DownloadStatus } from "../modules/download";

const getTasksLoad = () =>
  Object.values(
    Storage.get<appsState>(AppConfig.storageKeys.downloadTasks) ?? {}
  );

type InitState = typeof initState;
const initState = { tasks: getTasksLoad() };

const useHook = createGlobalState(
  (state, action: (state: InitState) => InitState) => {
    return { ...state, ...action(state) };
  },
  initState
);

export const useDownloadCount = () => {
  const [state, dispatch] = useHook();

  const udpDateTasks = () => {
    dispatch(state => ({ ...state, tasks: getTasksLoad() }));
  };

  const filterTasks = (...statusList: DownloadStatus[]) => {
    if (!statusList.length) return state.tasks.reverse();
    return state.tasks
      .filter(({ status, down }) => statusList.includes(status) && down?.id)
      .reverse();
  };

  const downTask = () =>
    filterTasks("downloading", "cancelled", "queued", "failed");

  return {
    udpDateTasks,
    filterTasks,
    downTask,
  };
};
