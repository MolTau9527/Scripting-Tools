import { HStack, VStack, ZStack, RoundedRectangle, Image, Color, LinearGradient, RadialGradient } from 'scripting';
import { Neon, Radius, Spacing } from './theme';

/**
 * 赛博朋克视觉原子（永远霓虹，不再按系统明暗切换）。
 */

/** 霓虹描边 overlay */
export function NeonBorder({
  cornerRadius = Radius.md,
  color = Neon.cyan,
  intense = false,
}: { cornerRadius?: number; color?: Color; intense?: boolean }) {
  return (
    <RoundedRectangle
      cornerRadius={cornerRadius}
      stroke={{
        shapeStyle: intense ? (Neon.borderHi as Color) : color,
        strokeStyle: { lineWidth: intense ? 1.5 : 1 },
      }}
    />
  );
}

/** 深底方块图标 + 霓虹描边 + 发光图标 */
export function NeonIcon({
  name,
  color = Neon.cyan,
  size = 29,
}: { name: string; color?: Color; size?: number }) {
  const cornerRadius = 7;
  return (
    <ZStack alignment="center" frame={{ width: size, height: size }}>
      <RoundedRectangle cornerRadius={cornerRadius} fill={Neon.surfaceHi} />
      <RoundedRectangle
        cornerRadius={cornerRadius}
        stroke={{ shapeStyle: color, strokeStyle: { lineWidth: 1 } }}
      />
      <Image
        systemName={name}
        foregroundStyle={color}
        font={size * 0.52}
        fontWeight="semibold"
        shadow={{ color, radius: 4 }}
      />
    </ZStack>
  );
}

/** 霓虹卡片容器 */
export function NeonCard({
  children,
  cornerRadius = Radius.md,
  color = Neon.cyan,
  padding,
}: {
  children: any;
  cornerRadius?: number;
  color?: Color;
  padding?: number | { vertical?: number; horizontal?: number };
}) {
  return (
    <VStack
      padding={padding as any}
      frame={{ maxWidth: "infinity" }}
      background={Neon.surface}
      clipShape={{ type: 'rect', cornerRadius }}
      overlay={<NeonBorder cornerRadius={cornerRadius} color={color} />}
    >
      {children}
    </VStack>
  );
}

/** 页面级背景：多层渐变 + 需虹灯光晕，同时强制深色环境 */
export function CyberBackground({ children }: { children: any }) {
  // 基底：深紫蓝对角渐变
  const base: LinearGradient = {
    stops: [
      { color: '#0A0618' as Color, location: 0 },
      { color: '#120826' as Color, location: 0.45 },
      { color: '#1A0B2E' as Color, location: 0.75 },
      { color: '#080411' as Color, location: 1 },
    ],
    startPoint: 'topLeading',
    endPoint: 'bottomTrailing',
  };
  // 左上灵光：灵青
  const glowCyan: RadialGradient = {
    stops: [
      { color: 'rgba(0,240,255,0.22)' as Color, location: 0 },
      { color: 'rgba(0,240,255,0.06)' as Color, location: 0.45 },
      { color: 'rgba(0,0,0,0)' as Color, location: 1 },
    ],
    center: 'topLeading',
    startRadius: 0,
    endRadius: 420,
  };
  // 右下灵光：灵洋红
  const glowMagenta: RadialGradient = {
    stops: [
      { color: 'rgba(255,0,168,0.18)' as Color, location: 0 },
      { color: 'rgba(255,0,168,0.05)' as Color, location: 0.5 },
      { color: 'rgba(0,0,0,0)' as Color, location: 1 },
    ],
    center: 'bottomTrailing',
    startRadius: 0,
    endRadius: 460,
  };
  // 正中微光圈：衣紫，深度感
  const glowViolet: RadialGradient = {
    stops: [
      { color: 'rgba(181,128,255,0.12)' as Color, location: 0 },
      { color: 'rgba(0,0,0,0)' as Color, location: 1 },
    ],
    center: 'center',
    startRadius: 0,
    endRadius: 300,
  };
  return (
    <ZStack
      frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
      preferredColorScheme="dark"
      foregroundStyle={Neon.text}
      tint={Neon.cyan}
    >
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background={base} />
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background={glowViolet} />
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background={glowCyan} />
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background={glowMagenta} />
      {children}
    </ZStack>
  );
}

/** 统一的 List 行深色背景（给 `listRowBackground` 用） */
export function rowBg() {
  return <VStack background={Neon.surface} frame={{ maxWidth: "infinity", maxHeight: "infinity" }} />;
}

/** 将 section 标题转大写，用于赛博朋克风 */
export function sectionLabel(text: string) {
  return text.toUpperCase();
}
