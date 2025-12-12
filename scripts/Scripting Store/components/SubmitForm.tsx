import {
  Button,
  HStack,
  Image,
  Navigation,
  ProgressView,
  ScrollView,
  Spacer,
  Text,
  TextField,
  VStack,
  ZStack,
  fetch,
  useEffect,
  useState
} from 'scripting'
import { submitPlugin } from '../api'
import type { SubmitPluginData } from '../types'
import { getUserSettings } from '../utils/userSettings'
import { type ThemeMode, getThemeColors, getActualThemeMode } from '../utils/theme'

const RANDOM_EMOJIS = ['⭐', '🔧', '📦', '🚀', '🎨', '⚡', '🔥', '🌟', '✨', '🔮', '💡', '🎯', '🌈', '💎', '🦄']

const searchAppStore = async (term: string, country = 'cn', limit = 10) => {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=software&limit=${limit}&explicit=yes`
  return (await fetch(url)).json()
}

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
  const [icon, setIcon] = useState('⭐')
  const [isImageIcon, setIsImageIcon] = useState(false)
  const [author, setAuthor] = useState(defaultAuthor)
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAppStoreSearch, setShowAppStoreSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | undefined>(undefined)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(undefined)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const timer = setTimeout(async () => {
      try {
        const cnResult = await searchAppStore(searchQuery.trim(), 'cn', 8)
        let results = cnResult.results || []

        if (results.length === 0) {
          const usResult = await searchAppStore(searchQuery.trim(), 'us', 8)
          results = usResult.results || []
        }

        setSearchResults(results)
      } catch (error) {
        console.error('Failed to search App Store:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const generateRandomIcon = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_EMOJIS.length)
    setIcon(RANDOM_EMOJIS[randomIndex])
    setIsImageIcon(false)
  }

  const pickFromPhotos = async () => {
    try {
      const images = await Photos.pickPhotos(1)
      if (images && images.length > 0) {
        const base64 = images[0].toJPEGBase64String(0.8)
        if (base64) {
          setIcon(`data:image/jpeg;base64,${base64}`)
          setIsImageIcon(true)
        }
      }
    } catch (error) {
      console.error('Failed to pick photo:', error)
    }
  }

  const pickFromFiles = async () => {
    try {
      const files = await DocumentPicker.pickFiles({
        types: ['public.image']
      })
      if (files && files.length > 0) {
        const image = UIImage.fromFile(files[0])
        if (image) {
          const base64 = image.toJPEGBase64String(0.8)
          if (base64) {
            setIcon(`data:image/jpeg;base64,${base64}`)
            setIsImageIcon(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to pick file:', error)
    }
  }

  const selectAppStoreIcon = async (app: any) => {
    try {
      const iconUrl = app.artworkUrl512 || app.artworkUrl100?.replace('100x100', '512x512')
      if (!iconUrl) {
        await Dialog.alert({ title: '错误', message: '无法获取图标' })
        return
      }

      const image = await UIImage.fromURL(iconUrl)
      if (!image) {
        await Dialog.alert({ title: '错误', message: '下载图标失败' })
        return
      }

      const resizedImage = image.preparingThumbnail({ width: 256, height: 256 })
      if (!resizedImage) {
        await Dialog.alert({ title: '错误', message: '处理图标失败' })
        return
      }

      const base64 = resizedImage.toJPEGBase64String(0.8)
      if (base64) {
        setIcon(`data:image/jpeg;base64,${base64}`)
        setIsImageIcon(true)
        setShowAppStoreSearch(false)
        setSearchQuery('')
        setSearchResults(undefined)
      }
    } catch (error) {
      console.error('Failed to select App Store icon:', error)
      await Dialog.alert({ title: '错误', message: '选择图标失败' })
    }
  }

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
        icon: icon || '⭐',
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

            {isImageIcon ? (
              <Image imageUrl={icon} resizable frame={{ width: 80, height: 80 }} clipShape={{ type: 'rect', cornerRadius: 16 }} />
            ) : (
              <VStack frame={{ width: 80, height: 80 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 16 }}>
                <Text font={40}>{icon || '⭐'}</Text>
              </VStack>
            )}

            {!isImageIcon && (
              <TextField
                title="图标"
                value={icon}
                prompt="输入 Emoji 图标"
                onChanged={(value) => {
                  setIcon(value)
                  setIsImageIcon(false)
                }}
              />
            )}

            <HStack spacing={8}>
              <Button action={pickFromPhotos}>
                <HStack padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }} background="#10b981" clipShape={{ type: 'rect', cornerRadius: 8 }} alignment="center" spacing={6}>
                  <Image systemName="photo" foregroundStyle="#ffffff" frame={{ width: 16, height: 16 }} />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">相册</Text>
                </HStack>
              </Button>

              <Button action={pickFromFiles}>
                <HStack padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }} background="#6366f1" clipShape={{ type: 'rect', cornerRadius: 8 }} alignment="center" spacing={6}>
                  <Image systemName="folder" foregroundStyle="#ffffff" frame={{ width: 16, height: 16 }} />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">文件</Text>
                </HStack>
              </Button>

              <Button action={generateRandomIcon}>
                <HStack padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }} background="#007aff" clipShape={{ type: 'rect', cornerRadius: 8 }} alignment="center" spacing={6}>
                  <Image systemName="dice" foregroundStyle="#ffffff" frame={{ width: 16, height: 16 }} />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">随机</Text>
                </HStack>
              </Button>

              <Button action={() => setShowAppStoreSearch(!showAppStoreSearch)}>
                <HStack padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }} background={showAppStoreSearch ? '#ef4444' : '#f97316'} clipShape={{ type: 'rect', cornerRadius: 8 }} alignment="center" spacing={6}>
                  <Image systemName={showAppStoreSearch ? 'xmark' : 'app.badge'} foregroundStyle="#ffffff" frame={{ width: 16, height: 16 }} />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">{showAppStoreSearch ? '关闭' : 'App'}</Text>
                </HStack>
              </Button>
            </HStack>

            {showAppStoreSearch && (
              <VStack padding={12} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 8 }} spacing={12}>
                <TextField title="" value={searchQuery} prompt="搜索 App Store 应用..." onChanged={setSearchQuery} textInputAutocapitalization="never" autocorrectionDisabled />

                {isSearching ? (
                  <HStack frame={{ maxWidth: 'infinity', height: 44 }} spacing={8}>
                    <ProgressView />
                    <Text font={13} foregroundStyle={colors.textSecondary}>搜索中...</Text>
                  </HStack>
                ) : searchResults === undefined ? (
                  <Text font={13} foregroundStyle={colors.textTertiary}>输入应用名称搜索图标</Text>
                ) : searchResults.length === 0 ? (
                  <Text font={13} foregroundStyle={colors.textTertiary}>未找到相关应用</Text>
                ) : (
                  <VStack spacing={0} frame={{ maxHeight: 240 }} clipShape={{ type: 'rect', cornerRadius: 8 }}>
                    <ScrollView>
                      <VStack spacing={0}>
                        {searchResults.slice(0, 8).map((app: any, index: number) => (
                          <Button key={app.trackId || index} action={() => selectAppStoreIcon(app)}>
                            <HStack padding={8} background={index % 2 === 0 ? colors.cardBackground : colors.background} spacing={12} frame={{ maxWidth: 'infinity', height: 56 }}>
                              <Image imageUrl={app.artworkUrl100} resizable frame={{ width: 40, height: 40 }} clipShape={{ type: 'rect', cornerRadius: 10 }} />
                              <VStack alignment="leading" spacing={2} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
                                <Text font={14} fontWeight="medium" foregroundStyle={colors.textPrimary} lineLimit={1}>{app.trackName}</Text>
                                <Text font={12} foregroundStyle={colors.textSecondary} lineLimit={1}>{app.artistName}</Text>
                              </VStack>
                            </HStack>
                          </Button>
                        ))}
                      </VStack>
                    </ScrollView>
                  </VStack>
                )}
              </VStack>
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
