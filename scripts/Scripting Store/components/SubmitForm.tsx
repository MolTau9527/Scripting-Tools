import { Button, HStack, Image, Navigation, ScrollView, Text, VStack, useCallback, useEffect, useRef, useState } from 'scripting'
import { useTheme } from '../contexts/ThemeContext'

// Dialog 由 Scripting 运行时注入，类型未从 'scripting' 导出，通过 declare 声明。
declare const Dialog: {
  alert: (options: { message: string; title?: string; buttonLabel?: string }) => Promise<void>
}
import { submitPlugin } from '../api'
import { ContentCard } from './common/ContentCard'
import { InputField } from './common/InputField'
import { PageHeader } from './common/PageHeader'
import { PreviewTile } from './common/PreviewTile'
import { SegmentOptionButton } from './common/SegmentOptionButton'
import { getUserSettings } from '../utils/userSettings'
import { normalizeInstallUrl } from '../utils/importUrl'
import { spacing, fontSize, cornerRadius, getGradientBackground } from '../utils/styles'
import { isImageUrl, validatePluginUrl } from '../utils/urlValidator'
import type { SubmitPluginData } from '../types'

// ============================================================
// Types
// ============================================================

export interface SubmitFormProps {
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

// ============================================================
// Helpers
// ============================================================

const sanitizeAndLimit = (value: string, maxLength: number): string => {
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

  const selectUrlOrEmojiMode = useCallback(() => setIconMode('urlOrEmoji'), [])
  const selectSymbolMode = useCallback(() => setIconMode('symbol'), [])

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
      const normalizedInstallUrl = normalizeInstallUrl(trimmedUrl)

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
    <VStack
      frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      background={getGradientBackground(actualMode)}
      preferredColorScheme={actualMode}
      onTapGesture={() => Keyboard.hide()}
    >
      <PageHeader
        title="发布插件"
        leading={(
          <Button action={handleCancel}>
            <Text font={fontSize.body} foregroundStyle={colors.tint}>取消</Text>
          </Button>
        )}
        trailing={(
          <Button action={isSubmitting ? () => {} : handleSubmit}>
            <Text font={fontSize.body} fontWeight="medium" foregroundStyle={isSubmitting ? colors.tertiaryLabel : colors.tint}>
              {isSubmitting ? '发布中...' : '发布'}
            </Text>
          </Button>
        )}
      />

      <ScrollView scrollDismissesKeyboard="interactively">
        <VStack padding={spacing.lg} spacing={spacing.lg}>
          {/* Icon Section */}
          <ContentCard spacing={spacing.lg}>
            <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>插件图标</Text>

            <IconPreview icon={icon} symbol={symbol} iconMode={iconMode} />

            <HStack spacing={spacing.sm}>
              <SegmentOptionButton
                label="URL/Emoji"
                icon="photo"
                selected={iconMode === 'urlOrEmoji'}
                selectedBackground={colors.systemGreen}
                onPress={selectUrlOrEmojiMode}
              />
              <SegmentOptionButton
                label="Symbol"
                icon="star.square.on.square"
                selected={iconMode === 'symbol'}
                onPress={selectSymbolMode}
              />
            </HStack>

            {iconMode === 'urlOrEmoji' ? (
              <VStack alignment="leading" spacing={spacing.sm}>
                <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>图标 URL</Text>
                <InputField
                  value={icon}
                  placeholder="请输入图标 URL 或 emoji"
                  onChanged={(v) => setIcon(sanitizeAndLimit(v, LIMITS.icon))}
                  textInputAutocapitalization="never"
                  autocorrectionDisabled
                />
              </VStack>
            ) : (
              <VStack alignment="leading" spacing={spacing.sm}>
                <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>Symbol</Text>
                <InputField
                  value={symbol}
                  placeholder="请输入 SF Symbol 名称，如 star.fill"
                  onChanged={(v) => setSymbol(sanitizeAndLimit(v, LIMITS.symbol))}
                  textInputAutocapitalization="never"
                  autocorrectionDisabled
                />
              </VStack>
            )}
          </ContentCard>

          {/* Info Section */}
          <ContentCard spacing={spacing.lg}>
            <Text font={fontSize.subheadline} foregroundStyle={colors.secondaryLabel}>基本信息</Text>

            <VStack alignment="leading" spacing={spacing.sm}>
              <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>插件名称 *</Text>
              <InputField
                value={name}
                placeholder="请输入插件名称"
                onChanged={(v) => setName(sanitizeAndLimit(v, LIMITS.name))}
              />
            </VStack>

            <VStack alignment="leading" spacing={spacing.sm}>
              <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>插件描述 *</Text>
              <InputField
                value={description}
                placeholder="请输入插件描述"
                onChanged={(v) => setDescription(sanitizeAndLimit(v, LIMITS.description))}
              />
            </VStack>

            <VStack alignment="leading" spacing={spacing.sm}>
              <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>作者</Text>
              <InputField
                value={author}
                placeholder="脚本作者"
                onChanged={(v) => setAuthor(sanitizeAndLimit(v, LIMITS.author))}
              />
            </VStack>

            <VStack alignment="leading" spacing={spacing.sm}>
              <Text font={fontSize.subheadline} fontWeight="medium" foregroundStyle={colors.label}>插件链接 *</Text>
              <InputField
                value={url}
                placeholder="请输入插件下载链接"
                onChanged={(v) => setUrl(sanitizeAndLimit(v, LIMITS.url))}
                textInputAutocapitalization="never"
                autocorrectionDisabled
              />
            </VStack>
          </ContentCard>

          {/* Tip */}
          <HStack
            padding={spacing.lg}
            spacing={spacing.md}
            background={colors.tertiaryFill}
            clipShape={{ type: 'rect', cornerRadius: cornerRadius.lg }}
            alignment="top"
          >
            <VStack
              frame={{ width: 3, minHeight: 36 }}
              background={colors.systemOrange}
              clipShape={{ type: 'rect', cornerRadius: 1.5 }}
            />
            <VStack alignment="leading" spacing={spacing.xs}>
              <HStack spacing={spacing.xs} alignment="center">
                <Image systemName="info.circle.fill" foregroundStyle={colors.systemOrange} frame={{ width: 14, height: 14 }} />
                <Text font={fontSize.subheadline} fontWeight="semibold" foregroundStyle={colors.systemOrange}>提示</Text>
              </HStack>
              <Text font={fontSize.footnote} foregroundStyle={colors.secondaryLabel} lineSpacing={3}>
                插件链接支持 .scripting、.js、.zip 文件或 GitHub 链接。发布时会自动转换为 Scripting 安装链接，安装时直接在 Scripting 内导入，不再落到浏览器下载文件。
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </ScrollView>
    </VStack>
  )
}
