import { createGlobalState } from "../modules/createGlobalStateUtils";

// 1. 清晰地定义 Tab 枚举并导出
export const Tab = {
  Search: 0,
  Download: 1,
  Files: 2,
  Settings: 3,
} as const;

// 3. 定义精确的值联合类型
type TabValue = (typeof Tab)[keyof typeof Tab];

// 2. 定义初始状态
const initialState = {
  ...Tab,
  selected: 0,
};

// 4. 使用清晰的类型和初始状态
export const useHook = createGlobalState((state, action: TabValue) => {
  return { ...state, selected: action };
}, initialState);

export const useTabs = () => {
  const [tab, setTab] = useHook();
  const nonReactiveTab: typeof tab = Object.create(
    {},
    Object.getOwnPropertyDescriptors(tab)
  );
  return [tab, setTab, nonReactiveTab] as const;
};
