import { Button, Form, HStack, Navigation, NavigationStack, Section, Text, VStack, useCallback, useEffect, useRef, useState } from 'scripting'
import { useTheme } from '../contexts/ThemeContext'

// Dialog 由 Scripting 运行时注入，类型未从 'scripting' 导出，通过 declare 声明。
declare const Dialog: {
  alert: (options: { message: string; title?: string; buttonLabel?: string }) => Promise<void>
}
import { submitPlugin } from '../api'
import { PreviewTile } from './common/PreviewTile'
import { ThemeRowBackground } from './common/ThemeRowBackground'
import { GlassBackground } from './common/GlassBackground'
import { InputField } from './common/InputField'
import { GlassSegmentedControl } from './common/GlassSegmentedControl'
import { getUserSettings } from '../utils/userSettings'
import { resolveInstallUrl } from '../utils/importUrl'
import { spacing, fontSize } from '../utils/styles'
import { isImageUrl, validatePluginUrl } from '../utils/urlValidator'
import type { SubmitPluginData } from '../types'

// ============================================================
// Types
// ============================================================

interface SubmitFormProps {
  onSuccess: () => void | Promise<void>
}

type IconMode = 'urlOrEmoji' | 'symbol'

interface IconPreviewProps {
  icon: string
  symbol: string
  iconMode: IconMode
}

// ============================================================
// Constants
// ============================================================

const LIMITS = {
  name: 50,
  description: 200,
  author: 50,
  url: 2048,
  icon: 2048,
  symbol: 64,
} as const
const ICON_MODE_OPTIONS = [
  { value: 'urlOrEmoji', label: '图片 / Emoji', icon: 'photo' },
  { value: 'symbol', label: 'SF Symbol', icon: 'star.square' },
] as const

// ============================================================
// Helpers
// ============================================================

const sanitizeAndLimit = (value: string, maxLength: number): string => {
  // deno-lint-ignore no-control-regex -- 表单输入需要显式移除 C0 控制字符和 DEL。
  return value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLength)
}

// ============================================================
// Icon Preview (isolated to avoid re-renders from other fields)
// ============================================================

const IconPreview = ({ icon, symbol, iconMode }: IconPreviewProps) => {
  if (iconMode === 'symbol') {
    return symbol.length > 0
      ? <PreviewTile symbol={symbol} />
      : <PreviewTile placeholderSymbol="star.square" />
  }
  if (icon.length > 0) {
    return isImageUrl(icon)
      ? <PreviewTile imageUrl={icon} />
      : <PreviewTile emoji={icon} />
  }
  return <PreviewTile />
}

// ============================================================
// Component
// ============================================================

export const SubmitForm = ({ onSuccess }: SubmitFormProps) => {
  const dismiss = Navigation.useDismiss()
  const { actualMode, colors } = useTheme()

  const isMountedRef = useRef(true)
  const submitInFlightRef = useRef(false)
  useEffect(() => {
    return () => { isMountedRef.current = false }
  }, [])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [symbol, setSymbol] = useState('')
  const [iconMode, setIconMode] = useState<IconMode>('urlOrEmoji')
  const [author, setAuthor] = useState(() => {
    const userSettings = getUserSettings()
    return userSettings.applyAuthorToPublish && userSettings.authorName
      ? userSettings.authorName
      : '脚本作者'
  })
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCancel = useCallback(async () => {
    if (isSubmitting) {
      await Dialog.alert({ title: '提示', message: '正在发布，请稍候…' })
      return
    }
    dismiss()
  }, [dismiss, isSubmitting])

  const handleSubmit = useCallback(async () => {
    if (submitInFlightRef.current) return
    submitInFlightRef.current = true

    if (!name.trim()) {
      submitInFlightRef.current = false
      await Dialog.alert({ title: '提示', message: '请输入插件名称' })
      return
    }
    if (!description.trim()) {
      submitInFlightRef.current = false
      await Dialog.alert({ title: '提示', message: '请输入插件描述' })
      return
    }

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      submitInFlightRef.current = false
      await Dialog.alert({ title: '提示', message: '请输入插件链接' })
      return
    }

    const urlError = validatePluginUrl(trimmedUrl)
    if (urlError) {
      submitInFlightRef.current = false
      await Dialog.alert({ title: '提示', message: urlError })
      return
    }

    setIsSubmitting(true)

    try {
      const normalizedInstallUrl = resolveInstallUrl(trimmedUrl)
      if (!normalizedInstallUrl) throw new Error('插件链接无效')

      const pluginData: SubmitPluginData = {
        name: name.trim(),
        description: description.trim(),
        icon: iconMode === 'symbol' ? '⭐' : (icon.trim() || '⭐'),
        symbol: iconMode === 'symbol' ? (symbol.trim() || 'star.fill') : undefined,
        author: author.trim() || '脚本作者',
        // 统一存储为 Scripting 可直接处理的安装链接，避免落到浏览器下载文件。
        url: normalizedInstallUrl,
      }

      await submitPlugin(pluginData)

      if (!isMountedRef.current) return

      await Dialog.alert({ title: '成功', message: '插件发布成功！' })

      if (!isMountedRef.current) return

      await onSuccess()

      if (!isMountedRef.current) return

      dismiss()
    } catch (error) {
      if (!isMountedRef.current) return

      await Dialog.alert({
        title: '发布失败',
        message: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      submitInFlightRef.current = false
      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }, [name, description, icon, symbol, iconMode, author, url, onSuccess, dismiss])

  return (
    <NavigationStack
      preferredColorScheme={actualMode}
      tint={colors.tint}
      foregroundStyle={colors.label}
      toolbarColorScheme={{ colorScheme: actualMode, bars: ['navigationBar'] }}
    >
      <Form
        listStyle="plain"
        preferredColorScheme={actualMode}
        scrollContentBackground="hidden"
        background={<GlassBackground />}
        foregroundStyle={colors.label}
        tint={colors.tint}
        listRowSpacing={12}
        contentMargins={{ edges: 'horizontal', insets: 16, placement: 'scrollContent' }}
        navigationTitle="发布插件"
        navigationBarTitleDisplayMode="inline"
        toolbar={{
          cancellationAction: (
            <Button title="取消" role="cancel" action={handleCancel} />
          ),
          confirmationAction: (
            <Button
              title={isSubmitting ? '发布中…' : '发布'}
              systemImage="paperplane.fill"
              role="confirm"
              action={handleSubmit}
              disabled={isSubmitting}
            />
          ),
        }}
      >
        <Section
          listRowBackground={<ThemeRowBackground variant="elevated" />}
          header={<Text foregroundStyle={colors.secondaryLabel}>插件图标</Text>}
          footer={<Text foregroundStyle={colors.tertiaryLabel}>支持图片 URL、Emoji 或 SF Symbol。</Text>}
        >
          <HStack padding={{ top: spacing.xs, bottom: spacing.xs }} frame={{ maxWidth: 'infinity' }}>
            <GlassSegmentedControl
              options={ICON_MODE_OPTIONS}
              value={iconMode}
              onChange={(value: IconMode) => setIconMode(value)}
            />
          </HStack>

          <HStack spacing={spacing.md} alignment="center">
            <IconPreview icon={icon} symbol={symbol} iconMode={iconMode} />
            <VStack alignment="leading" spacing={spacing.xs}>
              <Text font={fontSize.body} fontWeight="medium">
                {iconMode === 'symbol' ? 'SF Symbol 预览' : '图标预览'}
              </Text>
              <Text font={fontSize.footnote} foregroundStyle={colors.secondaryLabel}>
                {iconMode === 'symbol' ? '输入系统 Symbol 名称' : '输入图片链接或单个 Emoji'}
              </Text>
            </VStack>
          </HStack>

          {iconMode === 'urlOrEmoji' ? (
            <InputField
              title="图标"
              label="图标"
              placeholder="粘贴图片链接，或输入单个 Emoji"
              value={icon}
              onChanged={(value) => setIcon(sanitizeAndLimit(value, LIMITS.icon))}
              textInputAutocapitalization="never"
              autocorrectionDisabled
              keyboardType="URL"
            />
          ) : (
            <InputField
              title="SF Symbol"
              label="符号"
              placeholder="SF Symbol 名称，如 star.fill"
              value={symbol}
              onChanged={(value) => setSymbol(sanitizeAndLimit(value, LIMITS.symbol))}
              textInputAutocapitalization="never"
              autocorrectionDisabled
            />
          )}
        </Section>

        <Section
          listRowBackground={<ThemeRowBackground />}
          header={<Text foregroundStyle={colors.secondaryLabel}>基本信息</Text>}
          footer={<Text foregroundStyle={colors.tertiaryLabel}>名称和描述会展示在商店列表中；作者名用于作品归属和「我的」页面匹配。</Text>}
        >
          <InputField
            title="名称"
            label="名称"
            placeholder="插件显示名称（必填，≤50 字）"
            value={name}
            onChanged={(value) => setName(sanitizeAndLimit(value, LIMITS.name))}
          />
          <InputField
            title="描述"
            label="描述"
            placeholder="一句话介绍插件功能（必填，≤200 字）"
            value={description}
            onChanged={(value) => setDescription(sanitizeAndLimit(value, LIMITS.description))}
            axis="vertical"
          />
          <InputField
            title="作者"
            label="作者"
            placeholder="作者昵称，展示在插件信息中"
            value={author}
            onChanged={(value) => setAuthor(sanitizeAndLimit(value, LIMITS.author))}
          />
        </Section>

        <Section
          listRowBackground={<ThemeRowBackground />}
          header={<Text foregroundStyle={colors.secondaryLabel}>安装链接</Text>}
          footer={(
            <Text foregroundStyle={colors.tertiaryLabel}>
              支持 .scripting、.js、.zip 文件或 GitHub 链接。发布时会自动转换为 Scripting 安装链接。
            </Text>
          )}
        >
          <InputField
            title="插件链接"
            label="链接"
            placeholder="插件文件或 GitHub 仓库地址（必填）"
            value={url}
            onChanged={(value) => setUrl(sanitizeAndLimit(value, LIMITS.url))}
            textInputAutocapitalization="never"
            autocorrectionDisabled
            keyboardType="URL"
            textContentType="URL"
          />
        </Section>
      </Form>
    </NavigationStack>
  )
}
