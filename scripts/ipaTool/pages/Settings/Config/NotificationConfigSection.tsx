/**
 * File: pages/Settings/Config/NotificationConfigSection.tsx
 *
 * 通知配置组件
 */

import { Toggle, useState, useEffect } from "scripting";
import { ConfigSection } from "./ConfigSection";
import { ConfigItem } from "./ConfigItem";

interface NotificationConfigSectionProps {
  initialValue: {
    downloadSuccess: boolean;
    downloadFailed: boolean;
    serverNotification: boolean;
  };
  onChange: (value: {
    downloadSuccess: boolean;
    downloadFailed: boolean;
    serverNotification: boolean;
  }) => void;
}

/**
 * 通知配置组件
 */
export const NotificationConfigSection = ({
  initialValue,
  onChange,
}: NotificationConfigSectionProps) => {
  const [value, setValue] = useState(initialValue);

  // 同步初始值变化
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSuccessChange = (newValue: boolean) => {
    const updatedValue = { ...value, downloadSuccess: newValue };
    setValue(updatedValue);
    onChange(updatedValue);
  };

  const handleFailedChange = (newValue: boolean) => {
    const updatedValue = { ...value, downloadFailed: newValue };
    setValue(updatedValue);
    onChange(updatedValue);
  };

  const handleServerNotificationChange = (newValue: boolean) => {
    const updatedValue = { ...value, serverNotification: newValue };
    setValue(updatedValue);
    onChange(updatedValue);
  };

  return (
    <ConfigSection title="通知配置">
      <ConfigItem
        title="下载成功通知"
        description="开启后，下载完成时会发送通知"
      >
        <Toggle
          frame={{ width: 50 }}
          title=""
          value={value.downloadSuccess}
          onChanged={handleSuccessChange}
        />
      </ConfigItem>

      <ConfigItem
        title="下载失败通知"
        description="开启后，下载失败时会发送通知"
      >
        <Toggle
          frame={{ width: 50 }}
          title=""
          value={value.downloadFailed}
          onChanged={handleFailedChange}
        />
      </ConfigItem>

      <ConfigItem title="服务通知" description="开启后，接收服务相关通知">
        <Toggle
          frame={{ width: 50 }}
          title=""
          value={value.serverNotification}
          onChanged={handleServerNotificationChange}
        />
      </ConfigItem>
    </ConfigSection>
  );
};
