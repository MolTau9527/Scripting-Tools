import { createGlobalState } from "../../../../modules/createGlobalStateUtils";

const init: {
  [appId: number]: {
    bestChoice: string | number;
    internalVersion: number;
    displayVersion: string;
  };
} = {};

type Action = [number, [string | number, string]];
/**
 * 应用版本选择状态管理
 * 创建 appId → 选择的历史版本 的映射表
 * 将选择的历史版本同步到展示组件
 */
export const useAppVersionSelection = createGlobalState(
  (state, action: Action) => {
    const [appId, versionInfo] = action;
    const [internalVersion, displayVersion] = versionInfo;
    const bestChoice =
      displayVersion === "????" ? internalVersion : displayVersion;
    if (bestChoice === "暂无历史版本记录") return state;
    return {
      ...state,
      [appId]: {
        bestChoice,
        internalVersion: Number(internalVersion),
        displayVersion,
      },
    };
  },
  init,
  { autoReset: true }
);
