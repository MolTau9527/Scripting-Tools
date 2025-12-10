import { NavigationStack, ZStack } from "scripting";
import DownloadTaskItem from "../../components/DownloadTaskItem";
import { useDownload, useDownloadCount } from "../../hooks";
import AppListView from "../../components/AppListView";
import PlayButton from "./PlayButton";
import EmptyStateCard from "../../components/EmptyStateCard";
import AppInfo from "./AppInfo";
import DownPhoto from "./DownPhoto";
import { downloadManager } from "../../hooks/useDownload";

const handleDelete = (id: number) => {
  const { removeTask } = useDownload(id);
  return removeTask;
};

const handleCancel = (id: number) => {
  const task = downloadManager.findTaskById(id);

  return () => {
    console.log(task?.status);
    task?.status === "downloading" && task.cancel();
  };
};

/**
 * 下载页面组件
 * 管理应用下载任务
 */
const DownloadView = () => {
  const { downTask } = useDownloadCount();
  const tasks = downTask();

  return (
    <NavigationStack>
      <AppListView
        navigationTitle="APP下载管理"
        header="下载进度"
        data={tasks}
        // 使用渲染函数传入每项的渲染组件
        renderItem={task => (
          <DownloadTaskItem
            key={task.down.id}
            id={Number(task.down.id)}
            icon={task.down.icon!}
            content={<AppInfo {...(task.down as any)} />}
            actionNode={<PlayButton task={task} />}
          />
        )}
        // 删除方法
        onDelete={handleDelete}
        // 取消下载
        onCancel={handleCancel}
        // 列表为空时显示的组件
        emptyComponent={
          <EmptyStateCard
            photo={<DownPhoto padding={{ vertical: 30 }} />}
            title="无下载任务"
            content={["当前没有正在进行的下载任务", "你可以开始新的下载"]}
            btn={{
              systemName: "magnifyingglass",
              content: "搜索应用",
              tint: {
                colors: ["#007AFF", "#0056b3"],
                startPoint: "topLeading",
                endPoint: "bottomTrailing",
              },
            }}
          />
        }
      />
    </NavigationStack>
  );
};

export default DownloadView;
