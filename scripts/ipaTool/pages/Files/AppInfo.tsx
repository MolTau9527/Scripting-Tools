/**
 * File: pages/Files/AppInfo.tsx
 *
 * 文件页应用信息组件
 * 显示应用名称、版本号、Bundle ID 和安装包大小
 */

import { HStack, Spacer, Text, VStack } from "scripting";
import { Colors, FontStyles, Spacing } from "../../constants/designTokens";
import { formatSize } from "../../utils";

// AppInfo 组件属性接口
interface AppInfoProps {
  name: string;
  displayVersion: string;
  size?: number;
  bundleId: string;
}

export default function AppInfo({
  name,
  displayVersion,
  size,
  bundleId,
}: AppInfoProps) {
  return (
    <VStack
      spacing={Spacing.xs}
      padding={{ leading: -25, trailing: -35 }}
      alignment="leading"
    >
      <HStack spacing={Spacing.xs}>
        <Text
          {...FontStyles.appName}
          foregroundStyle={Colors.text.primary}
          truncationMode="tail"
          lineLimit={1}
        >
          {name}
        </Text>
        <Text {...FontStyles.caption} foregroundStyle={Colors.text.tertiary}>
          v{displayVersion}
        </Text>
        <Spacer />
      </HStack>

      <Text
        {...FontStyles.caption}
        foregroundStyle={Colors.text.secondary}
        truncationMode="tail"
        lineLimit={1}
      >
        {bundleId}
      </Text>
      <Text
        font={FontStyles.caption.font}
        foregroundStyle={Colors.text.secondary}
      >
        安装包 {formatSize(Number(size))}
      </Text>
    </VStack>
  );
}
