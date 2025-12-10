import { Button, useRef, Navigation, Notification } from "scripting";
import type { AppSearchSuccess } from "../../../types/appStore";
import { AppVersionList } from "./AppVersionList";
import { apiGetAppInfo } from "../../../services/api";
import { useAppVersionSelection } from "../../../pages/Search/AppListItem/store/useAppVersionSelection";
import { useDownload, useAppsState } from "../../../hooks";
import DownloadIcon from "./DownloadIcon";
import { AppConfig } from "../../../constants/AppConfig";
import { sendNotification } from "../../../utils";
import { useAuth, useTabs } from "../../../hooks";
import { onSearchShowToast } from "../toast";

// 下载按钮组件属性接口
interface DownloadButtonProps {
  // 应用信息
  app: AppSearchSuccess;
  // 设置选中的应用
  setSelected: (id: number) => void;
}

// 下载按钮组件
const DownloadButton = ({
  app: { id, name, icon },
  setSelected,
}: DownloadButtonProps) => {
  const { startDownload } = useDownload(id);
  const { setStatus, setAppState, appState } = useAppsState(id);
  const [, setTab, nonReactiveTab] = useTabs();
  const [selectedVersion] = useAppVersionSelection();
  const isDurationRef = useRef(false);
  const { isLoggedIn } = useAuth().authState;
  const { internalVersion } = selectedVersion[id] ?? {};
  let { down, status, progress } = appState;

  return (
    <Button
      action={() => setSelected(id)}
      onLongPressGesture={{
        // 点击时触发
        onPressingChanged: isPressing => {
          isPressing && setSelected(id);
          if (isPressing || isDurationRef.current) {
            isDurationRef.current = false;
            return;
          }

          HapticFeedback.mediumImpact();

          if (!isLoggedIn) {
            onSearchShowToast.run("error", "请先登录");
            setTimeout(() => setTab(nonReactiveTab.Settings), 1000);
            return;
          }

          Promise.try(async () => {
            status === "downloading" || setStatus("fetching");
            if (!down) {
              const { appInfo } = await apiGetAppInfo(id, internalVersion);
              down = {
                url: appInfo.url,
                id,
                name: appInfo.name,
                totalSize: appInfo.fileSize,
                folder: AppConfig.file.folder,
                sinf: appInfo.sinf,
                displayVersion: appInfo.displayVersion,
                externalVersionId: appInfo.externalVersionId,
                bundleId: appInfo.bundleId,
                metadata: appInfo.metadata,
                icon,
              };
            }

            setAppState({ down });
            startDownload(down);
          }).catch(error => {
            sendNotification("downloadFailed", `${error.message} ❌`);
            setStatus("failed");
          });
        },
        //长按后触发
        minDuration: 500,
        perform: () => {
          isDurationRef.current = true;
          HapticFeedback.lightImpact();
          Navigation.present(<AppVersionList id={id} name={name} />);
        },
      }}
    >
      <DownloadIcon status={status} progress={progress} />
    </Button>
  );
};

export default DownloadButton;
export type { DownloadButtonProps };
