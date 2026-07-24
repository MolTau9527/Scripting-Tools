import { Button, HStack, Image, Markdown, Rectangle, ScrollView, Spacer, Text, VStack, ZStack, useMemo } from 'scripting'
import type { SemanticColors } from '../contexts/ThemeContext'
import { PluginIcon } from './common/PluginIcon'
import { FavoriteButton } from './common/FavoriteButton'
import { spacing, fontSize, cornerRadius, darkGlassTint } from '../utils/styles'
import type { Plugin } from '../types'
import { parseAuthorNames } from '../utils/author'
import { getOriginalImportUrl } from '../utils/importUrl'

const LIGHT_ROW_GLASS = UIGlass.regular()
const DARK_ROW_GLASS = UIGlass.regular().tint(darkGlassTint)
const LIGHT_DETAIL_GLASS = UIGlass.clear()
const DARK_DETAIL_GLASS = UIGlass.clear().tint('rgba(13,27,58,0.32)')
const DETAIL_ROW_SHAPE = { type: 'rect', cornerRadius: cornerRadius.lg, style: 'continuous' } as const
const DETAIL_CARD_SHAPE = { type: 'rect', cornerRadius: 32, style: 'continuous' } as const
const PLAIN_BULLET_PATTERN = /^\s*[·•●▪◦]\s*/
const MARKDOWN_BLOCK_PATTERN = /^\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```)/

const escapeMarkdownLinkTarget = (url: string): string => url
  .replace(/\\/g, '%5C')
  .replace(/\s/g, '%20')
  .replace(/\(/g, '%28')
  .replace(/\)/g, '%29')

const formatDescriptionMarkdown = (description: string): string => {
  const source = description
    .replace(/\\n/g, '\n')
    .replace(/\r\n?/g, '\n')
    .trim()

  if (!source) return '暂无描述'

  const sourceLines = source.split('\n').map(line => line.trim())
  const convertedLines = sourceLines.map((line, index) => {
    if (!line) return ''
    if (PLAIN_BULLET_PATTERN.test(line)) {
      return `- ${line.replace(PLAIN_BULLET_PATTERN, '')}`
    }

    const nextContentLine = sourceLines.slice(index + 1).find(Boolean)
    if (
      /^[^#>*`\-]{1,30}[：:]$/.test(line) &&
      nextContentLine &&
      PLAIN_BULLET_PATTERN.test(nextContentLine)
    ) {
      return `### ${line.slice(0, -1)}`
    }

    return line
  })

  const markdownLines: string[] = []
  for (const line of convertedLines) {
    if (!line) {
      if (markdownLines[markdownLines.length - 1] !== '') markdownLines.push('')
      continue
    }

    const previousLine = markdownLines[markdownLines.length - 1]
    const previousIsPlain = Boolean(previousLine) && !MARKDOWN_BLOCK_PATTERN.test(previousLine)
    const currentIsPlain = !MARKDOWN_BLOCK_PATTERN.test(line)
    if (previousIsPlain && currentIsPlain) markdownLines.push('')
    markdownLines.push(line)
  }

  return markdownLines.join('\n').replace(/\n{3,}/g, '\n\n')
}

// 卡片内部的行玻璃芯片：玻璃与水洗色直接挂在内容容器上（单视图自持），
// 行高严格等于内容高——不能复用 ThemeRowBackground，其 infinity 图层
// 在无行高约束的卡片里会把区块撑到远超内容的大小
const GlassRow = ({
  actualMode,
  colors,
  children,
}: {
  actualMode: 'light' | 'dark'
  colors: SemanticColors
  children: JSX.Element | JSX.Element[]
}) => {
  const isDark = actualMode === 'dark'
  const glass = isDark ? DARK_ROW_GLASS : LIGHT_ROW_GLASS

  return (
    <VStack
      alignment="leading"
      spacing={spacing.sm}
      padding={spacing.md}
      frame={{ maxWidth: 'infinity', alignment: 'leading' }}
      background={colors.glassWash}
      glassEffect={{ glass, shape: DETAIL_ROW_SHAPE }}
      clipShape={DETAIL_ROW_SHAPE}
    >
      {children}
    </VStack>
  )
}

// ============================================================
// 插件详情悬浮卡片
//
// 通过 List 的 overlay 修饰符直接叠加在主页同一屏幕上：
// - 不经过任何 Navigation.present，底层星空画布原样延续，无"子页面"感
// - 卡片为镂空清透玻璃，画布透过卡片折射
// - onClose 仅收起覆盖层，主页状态完全保留
// ============================================================

interface PluginDetailModalProps {
  plugin: Plugin
  actualMode: 'light' | 'dark'
  colors: SemanticColors
  onInstall: (plugin: Plugin) => void
  onClose: () => void
  isInstalling?: boolean
  installDisabled?: boolean
}

export const PluginDetailModal = ({
  plugin,
  actualMode,
  colors,
  onInstall,
  onClose,
  isInstalling = false,
  installDisabled = false,
}: PluginDetailModalProps) => {
  const authorNames = parseAuthorNames(plugin.author || '脚本作者')
  const originalUrl = getOriginalImportUrl(plugin.url)
  const descriptionMarkdown = useMemo(
    () => `## 描述\n\n${formatDescriptionMarkdown(plugin.description)}`,
    [plugin.description],
  )
  const sourceLinksMarkdown = useMemo(
    () => `[🔗 **原始链接**](${escapeMarkdownLinkTarget(originalUrl)})`,
    [originalUrl],
  )

  // 镂空清透玻璃：底层星空画布透过卡片折射；深色仅极轻染色防材质解析发白
  const cardGlass = actualMode === 'dark' ? DARK_DETAIL_GLASS : LIGHT_DETAIL_GLASS
  const cardWidth = Math.max(0, Math.min(360, Device.screen.width - spacing.xl * 2))
  const cardMaxHeight = Math.max(0, Device.screen.height - 96)

  // 多作者时收敛为「首作者 等N位」，保证与安装按钮同排。
  const authorLabel = authorNames.length > 1
    ? `${authorNames[0]} 等${authorNames.length}位`
    : authorNames[0]

  return (
    <ZStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      alignment="center"
      preferredColorScheme={actualMode}
      tint={colors.tint}
    >
      {/* 遮罩：底层画布转为原生高斯模糊 + 主题渐变染色；点卡片外关闭 */}
      <VStack
        frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
        background="thinMaterial"
        ignoresSafeArea={{ regions: 'all', edges: 'all' }}
        onTapGesture={onClose}
      />
      <Rectangle
        fill={{
          colors: actualMode === 'dark'
            ? ['rgba(5,14,42,0.45)', 'rgba(27,74,143,0.25)']
            : ['rgba(220,234,254,0.40)', 'rgba(168,198,244,0.25)'],
          startPoint: 'top',
          endPoint: 'bottom',
        }}
        frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
        ignoresSafeArea={{ regions: 'all', edges: 'all' }}
        allowsHitTesting={false}
      />

      {/* 卡片宽高受当前屏幕约束；内容超出时在卡片内部滚动。 */}
      <VStack
        frame={{ width: cardWidth, maxHeight: cardMaxHeight }}
        fixedSize={{ horizontal: false, vertical: true }}
        glassEffect={{ glass: cardGlass, shape: DETAIL_CARD_SHAPE }}
        clipShape={DETAIL_CARD_SHAPE}
        shadow={{ color: 'rgba(0,0,0,0.45)', radius: 50, y: 24 }}
      >
        <ScrollView
          axes="vertical"
          scrollIndicator="hidden"
          frame={{ maxHeight: cardMaxHeight }}
          fixedSize={{ horizontal: false, vertical: true }}
        >
          <VStack
          spacing={spacing.sm}
          alignment="leading"
          padding={spacing.lg}
          >
          {/* 信息头行：图标 + 名称/更新时间/安装次数 + 关注星星 */}
          <GlassRow actualMode={actualMode} colors={colors}>
            <HStack frame={{ maxWidth: 'infinity' }} alignment="center" spacing={spacing.md}>
              <PluginIcon plugin={plugin} colors={colors} size="medium" />
              <VStack spacing={spacing.xs} alignment="leading" frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
                <Text
                  font={fontSize.title3}
                  fontWeight="bold"
                  foregroundStyle={colors.label}
                  frame={{ maxWidth: 'infinity', alignment: 'leading' }}
                >
                  {plugin.name}
                </Text>
                <Text font={fontSize.footnote} foregroundStyle={colors.secondaryLabel}>
                  更新于 {plugin.updateTime || '未知'}
                </Text>
                {plugin.installCount !== undefined && (
                  <Text font={fontSize.caption1} foregroundStyle={colors.tertiaryLabel}>
                    {String(plugin.installCount)} 次安装
                  </Text>
                )}
              </VStack>
              <FavoriteButton pluginId={plugin.id} />
            </HStack>
          </GlassRow>

          {/* 作者信息为静态元数据；安装是本行唯一命令。 */}
          <HStack frame={{ maxWidth: 'infinity' }} alignment="center" spacing={spacing.sm}>
            <HStack spacing={spacing.xs} alignment="center" frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
              <Image systemName="person.crop.circle" foregroundStyle={colors.tint} frame={{ width: 18, height: 18 }} />
              <Text font={fontSize.footnote} foregroundStyle={colors.secondaryLabel} lineLimit={1}>
                {authorLabel}
              </Text>
            </HStack>
            <Spacer minLength={spacing.sm} />
            <Button
              title={isInstalling ? '安装中...' : '安装插件'}
              systemImage="arrow.down.circle.fill"
              buttonStyle="borderedProminent"
              tint={colors.tint}
              action={() => onInstall(plugin)}
              disabled={installDisabled}
            />
          </HStack>

          <GlassRow actualMode={actualMode} colors={colors}>
            <Markdown
              content={descriptionMarkdown}
              theme="basic"
              scrollable={false}
              foregroundStyle={colors.label}
              tint={colors.tint}
              frame={{ maxWidth: 'infinity', alignment: 'leading' }}
            />
          </GlassRow>

          <GlassRow actualMode={actualMode} colors={colors}>
            <HStack frame={{ maxWidth: 'infinity' }} alignment="center" spacing={spacing.sm}>
              <Markdown
                content={sourceLinksMarkdown}
                theme="basic"
                scrollable={false}
                foregroundStyle={colors.label}
                tint={colors.tint}
              />
              <Spacer minLength={spacing.sm} />
              <Text font={fontSize.caption1} foregroundStyle={colors.tertiaryLabel} lineLimit={1}>
                插件 ID {String(plugin.id)}
              </Text>
            </HStack>
          </GlassRow>
          </VStack>
        </ScrollView>
      </VStack>
    </ZStack>
  )
}
