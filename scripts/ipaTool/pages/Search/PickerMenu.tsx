// 文件：scripts/ipaTool/pages/Search/PickerMenu.tsx
// 说明：可复用的 Picker 菜单组件

import { Picker, Text } from "scripting";

/**
 * PickerMenu 组件属性
 */
interface PickerMenuProps {
  /** 菜单选项数组 */
  options: string[];
  /** 当前选中的索引 */
  value: string;
  /** 选项改变时的回调 */
  onChanged: (index: string) => void;
  /** 宽度（默认 150） */
  width?: number;
}

/**
 * Picker 菜单组件
 * 提供一个下拉选择菜单
 */
export const PickerMenu = ({ options, onChanged, value }: PickerMenuProps) => {
  return (
    <Picker
      label={<></>}
      pickerStyle="palette"
      value={value}
      onChanged={(newValue: string) => {
        onChanged(newValue);
      }}
    >
      {options.map(option => (
        <Text key={option} tag={option}>
          {option}
        </Text>
      ))}
    </Picker>
  );
};
