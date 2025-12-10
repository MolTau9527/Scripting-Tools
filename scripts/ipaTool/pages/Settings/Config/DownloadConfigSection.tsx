/**
 * File: pages/Settings/Config/DownloadConfigSection.tsx
 *
 * 下载任务配置组件
 */

import { Picker, Text, useState, useEffect, useMemo } from "scripting";
import { defaultConfig } from "../../../constants/AppConfig";
import { ConfigSection } from "./ConfigSection";
import { ConfigItem } from "./ConfigItem";

interface DownloadConfigSectionProps {
  initialValue: {
    maxTaskCount: number;
    maxDownloadingCount: number;
  };
  onChange: (value: {
    maxTaskCount: number;
    maxDownloadingCount: number;
  }) => void;
}

/**
 * 下载任务配置组件
 */
export const DownloadConfigSection = ({
  initialValue,
  onChange,
}: DownloadConfigSectionProps) => {
  const [value, setValue] = useState(initialValue);

  // 同步初始值变化
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // 从状态动态生成选项数组
  const maxTaskOptions = useMemo(() => {
    const max = defaultConfig.download.maxTaskCount;
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [value.maxTaskCount, defaultConfig.download.maxTaskCount]);

  const maxDownloadingOptions = useMemo(() => {
    const max = defaultConfig.download.maxDownloadingCount;
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [value.maxDownloadingCount, defaultConfig.download.maxDownloadingCount]);

  const handleMaxTaskCountChange = (newValue: number) => {
    const updatedValue = { ...value, maxTaskCount: newValue };
    setValue(updatedValue);
    onChange(updatedValue);
  };

  const handleMaxDownloadingCountChange = (newValue: number) => {
    const updatedValue = { ...value, maxDownloadingCount: newValue };
    setValue(updatedValue);
    onChange(updatedValue);
  };

  return (
    <ConfigSection title="下载任务配置">
      <ConfigItem title="最大任务数" description="最多能添加的任务数量">
        <Picker
          label={<></>}
          pickerStyle="menu"
          value={value.maxTaskCount}
          onChanged={handleMaxTaskCountChange}
        >
          {maxTaskOptions.map(num => (
            <Text key={num} tag={num}>
              {num}
            </Text>
          ))}
        </Picker>
      </ConfigItem>

      <ConfigItem title="最大下载数" description="最多能同时进行的下载数量">
        <Picker
          label={<></>}
          pickerStyle="menu"
          value={value.maxDownloadingCount}
          onChanged={handleMaxDownloadingCountChange}
        >
          {maxDownloadingOptions.map(num => (
            <Text key={num} tag={num}>
              {num}
            </Text>
          ))}
        </Picker>
      </ConfigItem>
    </ConfigSection>
  );
};
