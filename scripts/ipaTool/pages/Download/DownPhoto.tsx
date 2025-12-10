import { SVG } from "scripting";
import { Colors, Spacing } from "../../constants/designTokens";

// 中文注释：在下载页的空状态区域直接传入通用卡片
const DownPhoto = () => (
  // 中文注释：SVG 图标，尺寸与阴影建议沿用设计令牌
  <SVG
    code={`<svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 圆形渐变背景 -->
  <defs>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="12" cy="12" r="12" fill="url(#blueGradient)"/>
  <g stroke="white" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- 向下箭头 -->
    <line x1="12" y1="6" x2="12" y2="13"/>
    <polyline points="9,10 12,13 15,10"/>
<path d="M 7 13 L 7 17 C 7 17.5 7.5 18 8 18 L 16 18 C 16.5 18 17 17.5 17 17 L 17 13"/>
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

export default DownPhoto;
