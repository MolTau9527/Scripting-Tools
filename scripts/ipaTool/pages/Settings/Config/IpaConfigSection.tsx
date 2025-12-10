/**
 * File: pages/Settings/Config/IpaConfigSection.tsx
 *
 * IPA 封装配置组件
 */

import { Toggle, useState, useEffect } from "scripting";
import { ConfigSection } from "./ConfigSection";
import { ConfigItem } from "./ConfigItem";

interface IpaConfigSectionProps {
  initialValue: { disableUpdateCheck: boolean };
  onChange: (value: { disableUpdateCheck: boolean }) => void;
}

/**
 * IPA 封装配置组件
 */
export const IpaConfigSection = ({
  initialValue,
  onChange,
}: IpaConfigSectionProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (disableUpdateCheck: boolean) => {
    const updated = { ...value, disableUpdateCheck };
    setValue(updated);
    onChange(updated);
  };

  return (
    <ConfigSection title="IPA 封装配置">
      <ConfigItem
        title="免更新模式"
        description="开启后，安装的应用不会被 App Store 检测到更新"
      >
        <Toggle
          frame={{ width: 50 }}
          title=""
          value={value.disableUpdateCheck}
          onChanged={handleChange}
        />
      </ConfigItem>
    </ConfigSection>
  );
};
