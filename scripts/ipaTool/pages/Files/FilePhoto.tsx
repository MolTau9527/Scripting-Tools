import { SVG } from "scripting";
import { Colors, Spacing } from "../../constants/designTokens";

// 中文注释：在下载页的空状态区域直接传入通用卡片
const DownPhoto = () => {
  return (
    // 中文注释：SVG 图标，尺寸与阴影建议沿用设计令牌
    <SVG
      code={`<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圆角方块 -->
  <rect
    width="140"
    height="140"
    rx="28"
    fill="url(#bg)"
  />

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="100%" stop-color="#764ba2"/>
    </linearGradient>
  </defs>

  <!-- folder 图标：尺寸放大、严格居中 -->
  <!-- 原图大小 24x24，这里放大到 76%，视觉最像你的图 -->
  <g transform="translate(32,32) scale(3)">
    <path
      d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </g>
</svg>
`}
      resizable
      interpolation="high"
      antialiased={true}
      frame={{ width: 130, height: 130 }}
      shadow={{
        color: Colors.shadow.secondary,
        radius: Spacing.md,
        x: 0,
        y: Spacing.xs,
      }}
    />
  );
};

export default DownPhoto;
