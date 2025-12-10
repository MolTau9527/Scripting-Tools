/**
 * File: pages/Search/AppListItem/AppInfo.tsx
 *
 * AppInfo 组件 - 应用信息显示组件
 * 负责显示应用的基本信息，包括名称、价格、版本、评分等
 */

import { VStack, HStack, Text, Image } from "scripting";
import { FontStyles, Colors, Spacing } from "../../../constants/designTokens";
import { type AppSearchSuccess } from "../../../types/appStore";
import { formatSize } from "../../../utils";
import StarRating from "../../../components/StarRating";
import { useAppVersionSelection } from "./store/useAppVersionSelection";

// 组件内部样式组合 - 次要说明文字样式
const secondaryTextStyle = {
  font: FontStyles.caption.font,
  fontWeight: FontStyles.caption.fontWeight,
  foregroundStyle: Colors.text.secondary,
  truncationMode: "tail",
  lineLimit: 1,
} as const;

// AppInfo 组件属性接口
interface AppInfoProps {
  // 应用信息
  app: AppSearchSuccess;
}

/**
 * AppInfo 组件
 * 显示应用的详细信息，包括名称、价格分类、版本大小、评分、系统要求等
 */
export default function AppInfo({ app }: AppInfoProps) {
  const [appVersionState] = useAppVersionSelection();
  const selectedVersion = appVersionState[app.id]?.bestChoice;
  return (
    <VStack alignment="leading" spacing={Spacing.xxs}>
      <Text {...FontStyles.appName} truncationMode="tail" lineLimit={1}>
        {app.name}
      </Text>

      <Text
        {...{
          ...secondaryTextStyle,
          foregroundStyle:
            app.price === "Free"
              ? Colors.text.secondary
              : Colors.status.warning,
        }}
      >
        价格{app.price} • {app.category}
      </Text>

      <Text
        {...{
          ...secondaryTextStyle,
          foregroundStyle: selectedVersion
            ? Colors.status.success
            : Colors.text.secondary,
        }}
      >
        版本{selectedVersion || app.version} • {formatSize(app.size)}
      </Text>

      {app.averageUserRating ? (
        <HStack spacing={Spacing.xs}>
          <StarRating score={app.averageUserRating} size="medium" />
          <Text {...secondaryTextStyle}>
            (
            {app.userRatingCount
              ?.toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0"}
            )
          </Text>
        </HStack>
      ) : null}

      <HStack spacing={Spacing.xs}>
        <Text {...secondaryTextStyle}>IOS {app.minimumOsVersion}+</Text>
        <Image
          systemName="ipad.and.iphone"
          imageScale="small"
          foregroundStyle={Colors.text.secondary}
        />
      </HStack>
    </VStack>
  );
}
