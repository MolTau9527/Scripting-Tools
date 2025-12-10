/**
 * File: pages/Settings/Config/ConfigItem.tsx
 *
 * 配置项通用组件
 * 封装配置项的布局结构，接受两个标题和一个控件组件
 */

import { HStack, VStack, Spacer, Text } from "scripting";
import { FontStyles, Colors, Spacing } from "../../../constants/designTokens";

interface ConfigItemProps {
  title: string;
  description: string;
  children: any;
}

// 组件内部样式配置
const styles = {
  row: {
    padding: Spacing.md,
    spacing: Spacing.md,
    alignment: "center" as const,
  },
  labelContainer: {
    spacing: Spacing.xs,
    alignment: "leading" as const,
  },
  labelText: {
    ...FontStyles.body,
    foregroundStyle: Colors.text.primary,
  },
  descriptionText: {
    ...FontStyles.caption,
    foregroundStyle: Colors.text.secondary,
  },
};

/**
 * 配置项组件
 * 统一配置项的布局和样式
 */
export const ConfigItem = ({
  title,
  description,
  children,
}: ConfigItemProps) => {
  return (
    <HStack {...styles.row}>
      <VStack {...styles.labelContainer}>
        <Text {...styles.labelText}>{title}</Text>
        <Text {...styles.descriptionText}>{description}</Text>
      </VStack>
      <Spacer />
      {children}
    </HStack>
  );
};
