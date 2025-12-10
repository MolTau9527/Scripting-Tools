import { NavigationStack, useEffect, useMemo, useRef } from "scripting";
import AppListView from "../../components/AppListView";
import DownloadTaskItem from "../../components/DownloadTaskItem";
import EmptyStateCard from "../../components/EmptyStateCard";
import { useAppsFilesState } from "../../hooks";
import FilePho from "./FilePhoto";
import InstallButton from "./InstallButton";
import AppInfo from "./AppInfo";
// 首页视图
export default function FilesView() {
  const [appFiles, dispatch, { isReady }] = useAppsFilesState();
  const dataRef = useRef<any[]>([]);

  useEffect(() => {
    dispatch({ type: "udpDate" });
  }, []);

  const handleDelete = (id: number) => {
    return () => dispatch({ type: "delete", id });
  };

  let data = Object.entries(appFiles);
  if (isReady) {
    dataRef.current = data;
  } else {
    data = dataRef.current;
  }

  return useMemo(
    () => (
      <NavigationStack>
        <AppListView
          navigationTitle="应用包"
          header="文件列表"
          data={data}
          renderItem={([id, app]) => (
            <DownloadTaskItem
              key={id}
              id={Number(id)}
              icon={app.icon!}
              content={<AppInfo {...app} />}
              actionNode={
                <InstallButton {...({ ...app, id } as any)} as Props />
              }
            />
          )}
          onDelete={handleDelete}
          emptyComponent={
            <EmptyStateCard
              photo={<FilePho padding={{ vertical: 30 }} />}
              title="暂无应用"
              content={["下载应用后将自动显示在这里"]}
              btn={{
                systemName: "tray.and.arrow.down",
                content: "快去看看吧",
                tint: {
                  colors: ["#667eea", "#764ba2"],
                  startPoint: "topLeading",
                  endPoint: "bottomTrailing",
                },
              }}
            />
          }
        />
      </NavigationStack>
    ),
    [data.length]
  );
}
