# 液态玻璃 UI 设计系统

## 概述

本项目采用原生 ScriptingApp API 实现的液态玻璃效果设计系统，提供多层次的视觉深度和流动质感。

## 核心组件

### 1. GlassBackground - 全局背景层

多层渐变 + 自定义壁纸的复合背景效果。

**特性：**
- 5 层渐变叠加，创造深度感
- 自定义壁纸支持，18% 透明度 + 8px 模糊
- 品牌色氛围叠加层（12% 透明度）
- 顶部和底部渐变，增强液态感

**文件位置：**
`components/common/GlassBackground.tsx`

**使用：**
```tsx
<GlassBackground
  wallpaperPath={wallpaperPath}
  backgroundColor="#F4F9FB"
  accentColor="#DDECF2"
/>
```

---

### 2. ThemeRowBackground - 行级背景

分层玻璃效果，适配不同内容区域。

**玻璃类型：**
- `page`: UIGlass.clear() - 完全透明，适合页面级容器
- `surface`: UIGlass.regular() - 标准毛玻璃，适合普通内容
- `elevated`: UIGlass.clear().interactive(true) - 清透交互玻璃，适合悬浮元素

**文件位置：**
`components/common/ThemeRowBackground.tsx`

**使用：**
```tsx
<ThemeRowBackground variant="elevated" />
```

---

### 3. PluginCard - 插件卡片

采用 `UIGlass.clear().interactive(true)` 的清透交互玻璃卡片。

**特性：**
- 圆角：24px 连续曲线
- 阴影：rgba(72,88,120,0.18) 16px 半径
- 内边距：16px 垂直，20px 水平
- 字重：semibold 标题

**文件位置：**
`components/PluginCard.tsx`

---

### 4. FeaturedCard - 特色卡片

采用 `UIGlass.clear().interactive(true)` 的清透交互玻璃卡片。

**特性：**
- 尺寸：280px 宽 × 180px 最小高
- 圆角：28px 连续曲线
- 阴影：rgba(72,88,120,0.2) 20px 半径，Y 偏移 8px
- 间距：16px (lg)

**文件位置：**
`components/FeaturedSection.tsx`

---

### 5. LiquidGlassCard - 液态玻璃卡片（新增）

**最高级的玻璃效果组件**，支持自定义背景图片。

**三层结构：**
1. **底层**：自定义背景图片
   - 透明度：深色模式 15%，浅色模式 20%
   - 模糊：深色模式 12px，浅色模式 10px
   - 填充模式：fill

2. **中层**：主玻璃层
   - 可选玻璃类型：clear / regular / identity
   - 圆角：12px / 16px / 24px / 32px
   - 阴影：动态适配主题
   - 支持 interactive 修饰符

3. **顶层**：光晕边框（可选）
   - 深色模式：rgba(99,199,255,0.15)
   - 浅色模式：rgba(3,105,161,0.12)
   - 边框宽度：1.5px

**文件位置：**
`components/common/LiquidGlassCard.tsx`

**完整使用示例：**
```tsx
import { LiquidGlassCard } from './components/common/LiquidGlassCard'
import { Text, VStack } from 'scripting'

// 基础用法
<LiquidGlassCard>
  <Text>基础玻璃卡片</Text>
</LiquidGlassCard>

// 带背景图片
<LiquidGlassCard 
  backgroundImage="/path/to/image.jpg"
  variant="regular"
  cornerSize="large"
>
  <VStack spacing={12}>
    <Text font={20} fontWeight="bold">标题</Text>
    <Text>描述内容</Text>
  </VStack>
</LiquidGlassCard>

// 完整配置
<LiquidGlassCard
  backgroundImage="/path/to/wallpaper.jpg"
  variant="clear"
  cornerSize="extraLarge"
  padding={20}
  glowEffect={true}
  interactive={true}
>
  <YourCustomContent />
</LiquidGlassCard>
```

---

## 玻璃材质对照表

**重要提示**：ScriptingApp 当前版本仅支持以下三种原生玻璃材质：

| 材质 | API | 透明度 | 用途 |
|------|-----|--------|------|
| `clear` | `UIGlass.clear()` | 100% | 页面容器、透明交互层 |
| `regular` | `UIGlass.regular()` | ~50% | 卡片、表单、标准内容区域 |
| `identity` | `UIGlass.identity()` | 0% | 禁用玻璃效果（保持原样） |

**玻璃修饰符**（链式调用）：
```tsx
// 交互式玻璃（支持点击反馈）
UIGlass.clear().interactive(true)

// 带色调的玻璃
UIGlass.regular().tint('rgba(99,199,255,0.15)')

// 组合使用
UIGlass.clear().interactive(true).tint('rgba(255,255,255,0.1)')
```

**注意**：文档中早期提到的 `ultraThin()`、`thin()`、`thick()` 在当前 ScriptingApp 版本中不可用。实际实现中使用 `clear().interactive(true)` 模拟轻透效果。

---

## 视觉层次设计

```
┌─────────────────────────────────────────┐
│  背景层 (GlassBackground)               │
│  └─ 渐变 + 壁纸 + 色彩叠加              │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  容器层 (ThemeRowBackground)   │    │
│  │  └─ regular() 标准玻璃         │    │
│  │                                 │    │
│  │  ┌──────────────────────────┐  │    │
│  │  │  卡片层 (PluginCard)     │  │    │
│  │  │  └─ thin() 轻量玻璃      │  │    │
│  │  │                           │  │    │
│  │  │  ┌────────────────────┐  │  │    │
│  │  │  │  按钮层 (GetButton)│  │  │    │
│  │  │  │  └─ glassProminent │  │  │    │
│  │  │  └────────────────────┘  │  │    │
│  │  └──────────────────────────┘  │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 自定义壁纸实现原理

### 背景壁纸（GlassBackground）
1. **存储**：`wallpaperPath` 通过 `Storage` 持久化
2. **订阅**：`subscribeWallpaperChange` 发布/订阅模式同步更新
3. **渲染**：GeometryReader 确保图片填充整个视口
4. **效果**：18% 透明度 + 8px 模糊 + 多层渐变叠加

### 卡片背景（LiquidGlassCard）
1. **三层结构**：图片层 → 玻璃层 → 光晕层
2. **动态适配**：根据主题模式自动调整透明度和模糊
3. **填充模式**：`contentMode: 'fill'` 确保图片覆盖整个卡片
4. **裁剪**：`clipped` + `clipShape` 确保圆角一致

---

## 性能优化建议

1. **图片尺寸**
   - 壁纸：建议 1440×2560，JPEG 质量 82%
   - 卡片背景：建议 600×400，JPEG 质量 80%

2. **模糊半径**
   - 全局壁纸：8-12px
   - 卡片背景：10-14px
   - 避免超过 20px，影响性能

3. **透明度范围**
   - 壁纸：12-20%
   - 卡片图片：15-25%
   - 避免超过 30%，失去玻璃质感

4. **渲染优化**
   - 使用 `allowsHitTesting={false}` 禁用背景层交互
   - 使用 `clipped` 避免过度绘制
   - GeometryReader 确保固定尺寸布局

---

## 设计原则

1. **层次分明**：不同层级使用不同玻璃材质
2. **呼吸感**：适当留白和间距（lg = 16px）
3. **连续曲线**：统一使用 `style: 'continuous'` 圆角
4. **动态阴影**：Y 偏移 6-8px，半径 16-20px
5. **品牌色贯穿**：背景、强调色、边框保持一致色系

---

## 更新日志

### 2024-12 液态玻璃重设计
- ✅ 优化 GlassBackground 为 5 层结构
- ✅ PluginCard 升级为 thin() + 24px 圆角
- ✅ FeaturedCard 升级为 ultraThin() + 28px 圆角
- ✅ ThemeRowBackground 增加 elevated 变体
- ✅ 新增 LiquidGlassCard 组件
- ✅ 壁纸透明度降低至 18%，增加 8px 模糊
- ✅ 统一阴影系统：18-20% 透明度，16-20px 半径

---

## 参考资源

- [ScriptingApp API 文档](https://scriptingapp.github.io/llms.txt)
- [iOS Human Interface Guidelines - Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple Design Resources - Glass Effects](https://developer.apple.com/design/resources/)
