/**
 * File: pages/Download/AppInfo.tsx
 *
 * 下载页应用信息组件
 * 显示应用名称、版本号和下载进度条
 */

import { HStack, Spacer, Text, VStack } from "scripting";
import { Colors, FontStyles, Spacing } from "../../constants/designTokens";
import DownloadProgress from "./DownloadProgress";

// AppInfo 组件属性接口
interface AppInfoProps {
  id: number | string;
  name: string;
  displayVersion: string;
}

export default function AppInfo({ id, name, displayVersion }: AppInfoProps) {
  return (
    <VStack spacing={Spacing.xs} padding={{ horizontal: -25 }}>
      <HStack spacing={Spacing.xs}>
        <Text {...FontStyles.appName} foregroundStyle={Colors.text.primary}>
          {name}
        </Text>
        <Text {...FontStyles.caption} foregroundStyle={Colors.text.tertiary}>
          v{displayVersion}
        </Text>
        <Spacer />
      </HStack>
      <DownloadProgress id={id} />
    </VStack>
  );
}
