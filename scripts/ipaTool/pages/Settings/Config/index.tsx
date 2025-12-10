/**
 * File: pages/Settings/Config/index.tsx
 *
 * 响应式配置组件
 * 显示和管理应用配置项
 */

import { NavigationStack, List } from "scripting";
import { AppConfig } from "../../../constants/AppConfig";
import { DownloadConfigSection } from "./DownloadConfigSection";
import { IpaConfigSection } from "./IpaConfigSection";
import { NotificationConfigSection } from "./NotificationConfigSection";
import { ResetConfigButton } from "./ResetConfigButton";
import { useLoginToast } from "../../../hooks";

/**
 * 配置页面组件
 */
const ConfigView = () => {
  const { toastConfig, showToast } = useLoginToast();
  return (
    <NavigationStack>
      <List toast={toastConfig} navigationTitle="设置">
        {/* 下载任务配置 */}
        <DownloadConfigSection
          initialValue={AppConfig.download}
          onChange={value => (AppConfig.download = value)}
        />

        {/* IPA 封装配置 */}
        <IpaConfigSection
          initialValue={AppConfig.ipa}
          onChange={value => (AppConfig.ipa = value)}
        />

        {/* 通知配置 */}
        <NotificationConfigSection
          initialValue={AppConfig.notification}
          onChange={value => (AppConfig.notification = value)}
        />

        {/* 底部重置按钮 */}
        <ResetConfigButton showToast={showToast} />
      </List>
    </NavigationStack>
  );
};

export default ConfigView;
