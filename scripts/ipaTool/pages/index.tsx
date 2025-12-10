/**
 * File: pages/index.tsx
 *
 * TabView 根组件
 * 管理应用的 Tab 导航，包括搜索、下载、文件和设置四个页面
 */
import { Label, TabView } from "scripting";

// 导入各个页面组件
import FilesView from "./Files";
import SearchView from "./Search";
import DownloadView from "./Download";
import SettingsView from "./Settings";
import { useTabs, useDownloadCount, useAppsFilesState } from "../hooks";

export default function TabViewApp() {
  const { downTask } = useDownloadCount();
  const [appFiles] = useAppsFilesState();
  const [tab, setTab] = useTabs();

  return (
    <TabView tabIndex={tab.selected} onTabIndexChanged={(i: any) => setTab(i)}>
      <SearchView
        tag={tab.Search}
        tabItem={<Label title="搜索" systemImage="magnifyingglass" />}
      />
      <DownloadView
        tag={tab.Download}
        badge={downTask().length}
        tabItem={<Label title="下载" systemImage="arrow.down.circle.fill" />}
      />
      <FilesView
        tag={tab.Files}
        badge={Object.keys(appFiles).length}
        tabItem={<Label title="文件" systemImage="tray.and.arrow.down.fill" />}
      />
      <SettingsView
        tag={tab.Settings}
        tabItem={<Label title="设置" systemImage="gearshape.fill" />}
      />
    </TabView>
  );
}
