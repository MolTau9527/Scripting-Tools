/**
 * File: pages/Settings/Config/ConfigSection.tsx
 *
 * 配置区域通用组件
 * 封装 Section，只接受一个标题
 */

import { Section, Text } from "scripting";
import { FontStyles, Colors } from "../../../constants/designTokens";

interface ConfigSectionProps {
  title: string;
  children: any;
}

// 组件内部样式配置
const sectionHeaderStyle = {
  ...FontStyles.caption,
  foregroundStyle: Colors.text.secondary,
};

/**
 * 配置区域组件
 * 封装 Section，统一配置区域的样式
 */
export const ConfigSection = ({ title, children }: ConfigSectionProps) => {
  return (
    <Section header={<Text {...sectionHeaderStyle}>{title}</Text>}>
      {children}
    </Section>
  );
};
