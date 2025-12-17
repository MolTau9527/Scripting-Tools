import {
  Button,
  HStack,
  Image,
  Navigation,
  Script,
  ScrollView,
  Spacer,
  Text,
  TextField,
  VStack,
  ZStack,
  useState
} from 'scripting'
import { submitPlugin } from '../api'
import type { SubmitPluginData } from '../types'
import { getUserSettings } from '../utils/userSettings'
import { type ThemeMode, getThemeColors, getActualThemeMode } from '../utils/theme'

interface SubmitFormProps {
  onSuccess: () => void
  themeMode: ThemeMode
}

export const SubmitForm = ({ onSuccess, themeMode }: SubmitFormProps) => {
  const dismiss = Navigation.useDismiss()
  const actualTheme = getActualThemeMode(themeMode)
  const colors = getThemeColors(themeMode)
  const userSettings = getUserSettings()
  const defaultAuthor = userSettings.applyAuthorToPublish && userSettings.authorName ? userSettings.authorName : '脚本作者'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [symbol, setSymbol] = useState('')
  const [iconMode, setIconMode] = useState<'svg' | 'symbol'>('svg')
  const [author, setAuthor] = useState(defaultAuthor)
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      await Dialog.alert({ title: '提示', message: '请输入插件名称' })
      return
    }
    if (!description.trim()) {
      await Dialog.alert({ title: '提示', message: '请输入插件描述' })
      return
    }
    if (!url.trim()) {
      await Dialog.alert({ title: '提示', message: '请输入插件链接' })
      return
    }

    setIsSubmitting(true)

    try {
      const pluginData: SubmitPluginData = {
        name: name.trim(),
        description: description.trim(),
        icon: iconMode === 'symbol' ? (symbol.trim() || '⭐') : (icon || '⭐'),
        author: author.trim() || '脚本作者',
        url: url.trim()
      }

      await submitPlugin(pluginData)
      await Dialog.alert({ title: '成功', message: '插件发布成功！' })
      onSuccess()
      dismiss()
    } catch (error) {
      await Dialog.alert({
        title: '发布失败',
        message: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background={colors.background} preferredColorScheme={actualTheme}>
      <HStack padding={16} background={colors.cardBackground} alignment="center">
        <Button action={() => dismiss()}>
          <Text font={16} foregroundStyle={colors.buttonPrimary}>取消</Text>
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold" foregroundStyle={colors.textPrimary}>发布插件</Text>
        <Spacer />
        <Button action={handleSubmit}>
          <Text font={16} fontWeight="medium" foregroundStyle={isSubmitting ? colors.textTertiary : colors.buttonPrimary}>
            {isSubmitting ? '发布中...' : '发布'}
          </Text>
        </Button>
      </HStack>

      <ScrollView scrollDismissesKeyboard="interactively">
        <VStack padding={16} spacing={16}>
          <VStack padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} spacing={16}>
            <Text font={14} foregroundStyle={actualTheme === 'dark' ? '#ffffff' : colors.textSecondary}>插件图标</Text>

            {iconMode === 'symbol' ? (
              symbol.length > 0 ? (
                <VStack frame={{ width: 80, height: 80 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 16 }}>
                  <Image systemName={symbol} font={48} foregroundStyle={colors.textPrimary} />
                </VStack>
              ) : (
                <VStack frame={{ width: 80, height: 80 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 16 }}>
                  <Image systemName="star.square" font={32} foregroundStyle={colors.textTertiary} />
                </VStack>
              )
            ) : icon.length > 0 ? (
              <Image imageUrl={icon} resizable frame={{ width: 80, height: 80 }} clipShape={{ type: 'rect', cornerRadius: 16 }} />
            ) : (
              <VStack frame={{ width: 80, height: 80 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 16 }}>
                <Image systemName="photo" foregroundStyle={colors.textTertiary} frame={{ width: 32, height: 32 }} />
              </VStack>
            )}

            <HStack spacing={8}>
              <Button action={() => setIconMode('svg')}>
                <HStack padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }} background={iconMode === 'svg' ? '#10b981' : colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 8 }} alignment="center" spacing={6}>
                  <Image systemName="photo" foregroundStyle={iconMode === 'svg' ? '#ffffff' : colors.textSecondary} frame={{ width: 16, height: 16 }} />
                  <Text font={13} fontWeight="medium" foregroundStyle={iconMode === 'svg' ? '#ffffff' : colors.textSecondary}>SVG</Text>
                </HStack>
              </Button>
              <Button action={() => setIconMode('symbol')}>
                <HStack padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }} background={iconMode === 'symbol' ? '#6366f1' : colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 8 }} alignment="center" spacing={6}>
                  <Image systemName="star.square.on.square" foregroundStyle={iconMode === 'symbol' ? '#ffffff' : colors.textSecondary} frame={{ width: 16, height: 16 }} />
                  <Text font={13} fontWeight="medium" foregroundStyle={iconMode === 'symbol' ? '#ffffff' : colors.textSecondary}>Symbol</Text>
                </HStack>
              </Button>
            </HStack>

            {iconMode === 'svg' ? (
              <TextField
                title="图标 URL"
                value={icon}
                prompt="请输入图标svg链接"
                onChanged={setIcon}
                textInputAutocapitalization="never"
                autocorrectionDisabled
              />
            ) : (
              <TextField
                title="Symbol"
                value={symbol}
                prompt="请输入 SF Symbol 名称，如 star.fill"
                onChanged={setSymbol}
                textInputAutocapitalization="never"
                autocorrectionDisabled
              />
            )}
          </VStack>

          <VStack padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} spacing={16}>
            <Text font={14} foregroundStyle={actualTheme === 'dark' ? '#ffffff' : colors.textSecondary}>基本信息</Text>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium" foregroundStyle={actualTheme === 'dark' ? '#ffffff' : colors.textPrimary}>插件名称 *</Text>
              <ZStack alignment="leading">
                {!name && <Text font={14} foregroundStyle={actualTheme === 'dark' ? '#9ca3af' : colors.textTertiary} padding={{ leading: 4 }}>请输入插件名称</Text>}
                <TextField title="" value={name} onChanged={setName} foregroundStyle={colors.textPrimary} />
              </ZStack>
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium" foregroundStyle={actualTheme === 'dark' ? '#ffffff' : colors.textPrimary}>插件描述 *</Text>
              <ZStack alignment="leading">
                {!description && <Text font={14} foregroundStyle={actualTheme === 'dark' ? '#9ca3af' : colors.textTertiary} padding={{ leading: 4 }}>请输入插件描述</Text>}
                <TextField title="" value={description} onChanged={setDescription} foregroundStyle={colors.textPrimary} />
              </ZStack>
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium" foregroundStyle={actualTheme === 'dark' ? '#ffffff' : colors.textPrimary}>作者</Text>
              <ZStack alignment="leading">
                {!author && <Text font={14} foregroundStyle={actualTheme === 'dark' ? '#9ca3af' : colors.textTertiary} padding={{ leading: 4 }}>脚本作者</Text>}
                <TextField title="" value={author} onChanged={setAuthor} foregroundStyle={colors.textPrimary} />
              </ZStack>
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium" foregroundStyle={actualTheme === 'dark' ? '#ffffff' : colors.textPrimary}>插件链接 *</Text>
              <ZStack alignment="leading">
                {!url && <Text font={14} foregroundStyle={actualTheme === 'dark' ? '#9ca3af' : colors.textTertiary} padding={{ leading: 4 }}>请输入插件下载链接</Text>}
                <TextField title="" value={url} onChanged={setUrl} textInputAutocapitalization="never" autocorrectionDisabled foregroundStyle={colors.textPrimary} />
              </ZStack>
            </VStack>
          </VStack>

          {actualTheme === 'dark' ? (
            <VStack padding={16} background="#422006" clipShape={{ type: 'rect', cornerRadius: 12 }} alignment="leading" spacing={8}>
              <HStack spacing={8} alignment="center">
                <Image systemName="info.circle.fill" foregroundStyle="#fbbf24" frame={{ width: 16, height: 16 }} />
                <Text font={14} fontWeight="medium" foregroundStyle="#fcd34d">提示</Text>
              </HStack>
              <Text font={13} foregroundStyle="#fcd34d">插件链接支持 .scripting、.js、.zip 文件或 GitHub 链接。发布后将显示在插件中心供其他用户下载。</Text>
            </VStack>
          ) : (
            <VStack padding={16} background="#fef3c7" clipShape={{ type: 'rect', cornerRadius: 12 }} alignment="leading" spacing={8}>
              <HStack spacing={8} alignment="center">
                <Image systemName="info.circle.fill" foregroundStyle="#d97706" frame={{ width: 16, height: 16 }} />
                <Text font={14} fontWeight="medium" foregroundStyle="#92400e">提示</Text>
              </HStack>
              <Text font={13} foregroundStyle="#92400e">插件链接支持 .scripting、.js、.zip 文件或 GitHub 链接。发布后将显示在插件中心供其他用户下载。</Text>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </VStack>
  )
}
