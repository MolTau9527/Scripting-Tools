// tsx file: scripts/ipaTool/components/EmptyStateCard.tsx
import {
  VStack,
  HStack,
  Image,
  Text,
  Spacer,
  Button,
  RoundedRectangle,
  ZStack,
} from "scripting";
import type { ShapeStyle, DynamicShapeStyle } from "scripting";
import {
  FontStyles,
  Spacing,
  Colors,
  BorderRadius,
} from "../constants/designTokens";
import { useTabs, useIconAnimation } from "../hooks";
import BackgroundDecorations from "./BackgroundDecorations";

/** 通用空态卡片组件（仅负责展示，不包含交互逻辑） */
export const EmptyStateCard = ({
  photo,
  title,
  content,
  btn,
}: {
  /** 顶部展示图：可传 <SVG> 或 <Image> */
  photo: JSX.Element;
  /** 标题文案 */
  title: string;
  /** 内容说明文案列表 */
  content: string[];
  /** 按钮展示内容（系统图标 + 文案），仅展示样式 */
  btn: {
    systemName: string;
    content: string;
    tint: ShapeStyle | DynamicShapeStyle;
  };
}) => {
  const [tab, setTab] = useTabs();

  // 图标动画
  const photoAnimation = useIconAnimation();
  Object.assign(photo.props, photoAnimation);

  // 为次要文本提取的统一样式
  const secondaryTextStyle = {
    foregroundStyle: Colors.text.secondary,
    font: FontStyles.body.font,
    fontWeight: FontStyles.body.fontWeight,
    multilineTextAlignment: "center" as const,
  };

  // 为正文/图标提取的统一字体样式
  const bodyFontStyle = {
    font: FontStyles.body.font,
    fontWeight: FontStyles.body.fontWeight,
  };

  return (
    <ZStack listRowBackground={<></>}>
      {/* 背景装饰圆圈 */}
      <BackgroundDecorations />

      {/* 主内容 */}
      <HStack alignment="center">
        <Spacer />
        <VStack alignment="center" spacing={Spacing.xl} padding={Spacing.xl}>
          {/* 顶部展示图（SVG 或 Image） */}
          <VStack spacing={Spacing.sm}>
            {photo}
            {/* 装饰性分隔线 */}
            <RoundedRectangle
              fill={{ color: "systemGray", opacity: 0.2 }}
              cornerRadius={2}
              frame={{ width: 60, height: 4 }}
            />
          </VStack>

          {/* 标题 */}
          <Text {...FontStyles.pageTitle}>{title}</Text>

          {/* 内容说明列表 */}
          <VStack spacing={Spacing.xs}>
            {content.map((line, idx) => (
              <Text key={idx} {...secondaryTextStyle}>
                {line}
              </Text>
            ))}
          </VStack>

          {/* 操作区域 */}
          <VStack spacing={Spacing.sm}>
            <Button buttonStyle="plain" action={() => setTab(tab.Search)}>
              <ZStack>
                <RoundedRectangle
                  fill={btn.tint}
                  cornerRadius={BorderRadius.xxl}
                  frame={{ width: 150 }}
                />
                <HStack spacing={Spacing.xs} padding={{ vertical: 8 }}>
                  <Image
                    systemName={btn.systemName}
                    font={bodyFontStyle.font}
                    foregroundStyle="white"
                  />
                  <Text {...bodyFontStyle} foregroundStyle="white">
                    {btn.content}
                  </Text>
                </HStack>
              </ZStack>
            </Button>
            {/* 提示文字 */}
            <Text
              font="caption2"
              foregroundStyle={{ color: "systemGray", opacity: 0.6 }}
            >
              轻触按钮开始探索
            </Text>
          </VStack>
        </VStack>
        <Spacer />
      </HStack>
    </ZStack>
  );
};

export default EmptyStateCard;
