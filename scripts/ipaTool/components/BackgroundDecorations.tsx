/**
 * File: components/BackgroundDecorations.tsx
 *
 * 背景装饰圆圈组件
 * 为页面添加层次感和视觉趣味
 * 支持明暗主题自动适配，每次启动随机颜色和位置
 * 根据设备屏幕尺寸动态计算位置，避免重叠
 */

import { Circle, useMemo, Device } from "scripting";
import type { Color, DynamicShapeStyle } from "scripting";

interface BackgroundDecorationsProps {
  /** 亮色模式透明度，默认 0.12 */
  lightOpacity?: number;
  /** 暗色模式透明度，默认 0.15 */
  darkOpacity?: number;
}

// 亮色模式可用颜色（更饱和、更鲜艳）
const lightModeColors: Color[] = [
  "systemBlue",
  "systemPurple",
  "systemPink",
  "systemOrange",
  "systemTeal",
  "systemIndigo",
];

// 暗色模式可用颜色（更柔和、更深沉）
const darkModeColors: Color[] = [
  "systemCyan",
  "systemMint",
  "systemPurple",
  "systemIndigo",
  "systemTeal",
  "systemBlue",
];

interface CircleDecoration {
  lightColor: Color;
  darkColor: Color;
  size: number;
  offsetX: number;
  offsetY: number;
}

/**
 * 根据屏幕尺寸生成随机装饰圆圈配置
 */
const generateRandomCircles = (): CircleDecoration[] => {
  // 获取设备屏幕尺寸
  let { width, height } = Device.screen;
  height = height * 0.8;

  // 随机生成 2-3 个圆圈
  const count = Math.floor(Math.random() * 2) + 2;

  // 分别打乱两套颜色数组
  const shuffledLightColors = [...lightModeColors].sort(
    () => Math.random() - 0.5
  );
  const shuffledDarkColors = [...darkModeColors].sort(
    () => Math.random() - 0.5
  );

  // 根据屏幕尺寸划分区域
  const edgeMargin = Math.min(width, height) * 0.15;
  const regionWidth = (width - edgeMargin * 2) / 2;
  const regionHeight = (height - edgeMargin * 2) / 2;

  const regions = [
    { x: -regionWidth / 2, y: -regionHeight / 2 }, // 左上
    { x: regionWidth / 2, y: -regionHeight / 2 }, // 右上
    { x: -regionWidth / 2, y: regionHeight / 2 }, // 左下
    { x: regionWidth / 2, y: regionHeight / 2 }, // 右下
    { x: 0, y: -regionHeight / 2 }, // 中上
    { x: 0, y: regionHeight / 2 }, // 中下
  ];

  // 打乱区域并选择前 count 个
  const shuffledRegions = [...regions].sort(() => Math.random() - 0.5);

  const circles: CircleDecoration[] = [];

  for (let i = 0; i < count; i++) {
    const region = shuffledRegions[i];

    // 圆圈大小根据屏幕尺寸自适应
    const screenMin = Math.min(width, height);
    const baseSize = screenMin * 0.35;
    const sizeVariation = baseSize * 0.4;
    const circleSize = baseSize + (Math.random() - 0.5) * sizeVariation;

    // 在区域内随机偏移
    const maxOffsetX = regionWidth * 0.3;
    const maxOffsetY = regionHeight * 0.3;
    const randomOffsetX = (Math.random() - 0.5) * maxOffsetX;
    const randomOffsetY = (Math.random() - 0.5) * maxOffsetY;

    circles.push({
      lightColor: shuffledLightColors[i],
      darkColor: shuffledDarkColors[i],
      size: circleSize,
      offsetX: region.x + randomOffsetX,
      offsetY: region.y + randomOffsetY,
    });
  }

  return circles;
};

/**
 * 背景装饰圆圈组件
 * 包含 2-3 个随机位置、随机大小的半透明圆圈
 * 自动适配明暗主题和设备屏幕尺寸，确保不重叠
 * 明暗模式使用不同的颜色方案
 */
export const BackgroundDecorations = ({
  lightOpacity = 0.12,
  darkOpacity = 0.15,
}: BackgroundDecorationsProps = {}) => {
  // 每次组件挂载时生成随机圆圈配置（不会因为重渲染而改变）
  const circles = useMemo(() => generateRandomCircles(), []);

  return (
    <>
      {circles.map((circle, index) => {
        const circleStyle: DynamicShapeStyle = {
          light: { color: circle.lightColor, opacity: lightOpacity },
          dark: { color: circle.darkColor, opacity: darkOpacity },
        };

        return (
          <Circle
            key={index}
            fill={circleStyle}
            frame={{ width: circle.size, height: circle.size }}
            offset={{ x: circle.offsetX, y: circle.offsetY }}
          />
        );
      })}
    </>
  );
};

export default BackgroundDecorations;
