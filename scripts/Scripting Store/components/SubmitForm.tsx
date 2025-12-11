/**
 * 发布插件表单组件
 */

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
  fetch,
  useEffect,
  useState
} from 'scripting'
import { submitPlugin } from '../api'
import type { SubmitPluginData } from '../types'
import { getUserSettings } from '../utils/userSettings'

// 随机 emoji 列表
const RANDOM_EMOJIS = ['⭐', '🔧', '📦', '🚀', '🎨', '⚡', '🔥', '🌟', '✨', '🔮', '💡', '🎯', '🌈', '💎', '🦄']

// 临时缓存目录
const TEMP_ICON_DIR = FileManager.temporaryDirectory + '/plugin_icons'

// iTunes API 搜索
async function searchAppStore(term: string, country = 'cn', limit = 10) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=software&limit=${limit}&explicit=yes`
  const response = await fetch(url)
  return response.json()
}

// 清理临时缓存
function cleanupTempIcons() {
  try {
    if (FileManager.existsSync(TEMP_ICON_DIR)) {
      FileManager.remove(TEMP_ICON_DIR)
    }
  } catch (error) {
    console.error('Failed to cleanup temp icons:', error)
  }
}

interface SubmitFormProps {
  onSuccess: () => void
}

/**
 * 发布表单组件
 */
export const SubmitForm = ({ onSuccess }: SubmitFormProps) => {
  const dismiss = Navigation.useDismiss()

  // 获取用户设置，自动填写作者名
  const userSettings = getUserSettings()
  const defaultAuthor = userSettings.applyAuthorToPublish && userSettings.authorName
    ? userSettings.authorName
    : '脚本作者'

  // 表单状态
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('⭐')
  const [isImageIcon, setIsImageIcon] = useState(false)
  const [author, setAuthor] = useState(defaultAuthor)
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tempIconPath, setTempIconPath] = useState<string | null>(null)

  // App Store 搜索状态
  const [showAppStoreSearch, setShowAppStoreSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | undefined>(undefined)
  const [isSearching, setIsSearching] = useState(false)

  // 使用 useEffect 处理搜索防抖
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(undefined)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const timer = setTimeout(async () => {
      try {
        // 优先搜索中国区
        const cnResult = await searchAppStore(searchQuery.trim(), 'cn', 8)
        let results = cnResult.results || []

        // 如果中国区没有结果，再搜索美国区
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

  /**
   * 随机生成图标
   */
  const generateRandomIcon = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_EMOJIS.length)
    setIcon(RANDOM_EMOJIS[randomIndex])
    setIsImageIcon(false)
  }

  /**
   * 从相册选择图片
   */
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

  /**
   * 从文件选择图片
   */
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

  /**
   * 从 App Store 选择图标
   */
  const selectAppStoreIcon = async (app: any) => {
    try {
      // 获取高清图标 URL (512x512)
      const iconUrl = app.artworkUrl512 || app.artworkUrl100?.replace('100x100', '512x512')
      if (!iconUrl) {
        await Dialog.alert({ title: '错误', message: '无法获取图标' })
        return
      }

      // 下载图标
      const image = await UIImage.fromURL(iconUrl)
      if (!image) {
        await Dialog.alert({ title: '错误', message: '下载图标失败' })
        return
      }

      // 裁剪为圆角矩形 (iOS 风格)
      const resizedImage = image.preparingThumbnail({ width: 256, height: 256 })
      if (!resizedImage) {
        await Dialog.alert({ title: '错误', message: '处理图标失败' })
        return
      }

      // 保存到临时目录
      if (!FileManager.existsSync(TEMP_ICON_DIR)) {
        await FileManager.createDirectory(TEMP_ICON_DIR, true)
      }
      const tempPath = `${TEMP_ICON_DIR}/${Date.now()}.png`
      const pngData = resizedImage.toPNGData()
      if (pngData) {
        await FileManager.writeAsData(tempPath, pngData)
        setTempIconPath(tempPath)
      }

      // 转为 base64 用于显示和提交
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

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    // 验证必填字段
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

      // 发布成功后清理临时缓存
      cleanupTempIcons()

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
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background="#f9fafb">
      {/* 顶部栏 */}
      <HStack
        padding={16}
        background="#ffffff"
        alignment="center"
      >
        <Button action={() => dismiss()}>
          <Text font={16} foregroundStyle="#007aff">取消</Text>
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold">发布插件</Text>
        <Spacer />
        <Button action={handleSubmit}>
          <Text
            font={16}
            fontWeight="medium"
            foregroundStyle={isSubmitting ? '#9ca3af' : '#007aff'}
          >
            {isSubmitting ? '发布中...' : '发布'}
          </Text>
        </Button>
      </HStack>

      <ScrollView scrollDismissesKeyboard="interactively">
        <VStack padding={16} spacing={16}>
          {/* 图标预览和设置 */}
          <VStack
            padding={20}
            background="#ffffff"
            clipShape={{ type: 'rect', cornerRadius: 12 }}
            spacing={16}
          >
            <Text font={14} foregroundStyle="#6b7280">插件图标</Text>

            {/* 图标预览 */}
            {isImageIcon ? (
              <Image
                imageUrl={icon}
                resizable
                frame={{ width: 80, height: 80 }}
                clipShape={{ type: 'rect', cornerRadius: 16 }}
              />
            ) : (
              <VStack
                frame={{ width: 80, height: 80 }}
                background="#f3f4f6"
                clipShape={{ type: 'rect', cornerRadius: 16 }}
              >
                <Text font={40}>{icon || '⭐'}</Text>
              </VStack>
            )}

            {/* 图标输入（仅 emoji 模式） */}
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

            {/* 图标操作按钮 - 第一行 */}
            <HStack spacing={8}>
              {/* 从相册选择 */}
              <Button action={pickFromPhotos}>
                <HStack
                  padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }}
                  background="#10b981"
                  clipShape={{ type: 'rect', cornerRadius: 8 }}
                  alignment="center"
                  spacing={6}
                >
                  <Image
                    systemName="photo"
                    foregroundStyle="#ffffff"
                    frame={{ width: 16, height: 16 }}
                  />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">
                    相册
                  </Text>
                </HStack>
              </Button>

              {/* 从文件选择 */}
              <Button action={pickFromFiles}>
                <HStack
                  padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }}
                  background="#6366f1"
                  clipShape={{ type: 'rect', cornerRadius: 8 }}
                  alignment="center"
                  spacing={6}
                >
                  <Image
                    systemName="folder"
                    foregroundStyle="#ffffff"
                    frame={{ width: 16, height: 16 }}
                  />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">
                    文件
                  </Text>
                </HStack>
              </Button>

              {/* 随机生成 */}
              <Button action={generateRandomIcon}>
                <HStack
                  padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }}
                  background="#007aff"
                  clipShape={{ type: 'rect', cornerRadius: 8 }}
                  alignment="center"
                  spacing={6}
                >
                  <Image
                    systemName="dice"
                    foregroundStyle="#ffffff"
                    frame={{ width: 16, height: 16 }}
                  />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">
                    随机
                  </Text>
                </HStack>
              </Button>

              {/* App Store 搜索 */}
              <Button action={() => setShowAppStoreSearch(!showAppStoreSearch)}>
                <HStack
                  padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }}
                  background={showAppStoreSearch ? '#ef4444' : '#f97316'}
                  clipShape={{ type: 'rect', cornerRadius: 8 }}
                  alignment="center"
                  spacing={6}
                >
                  <Image
                    systemName={showAppStoreSearch ? 'xmark' : 'app.badge'}
                    foregroundStyle="#ffffff"
                    frame={{ width: 16, height: 16 }}
                  />
                  <Text font={13} fontWeight="medium" foregroundStyle="#ffffff">
                    {showAppStoreSearch ? '关闭' : 'App'}
                  </Text>
                </HStack>
              </Button>
            </HStack>

            {/* App Store 搜索面板 */}
            {showAppStoreSearch && (
              <VStack
                padding={12}
                background="#f3f4f6"
                clipShape={{ type: 'rect', cornerRadius: 8 }}
                spacing={12}
              >
                <TextField
                  title=""
                  value={searchQuery}
                  prompt="搜索 App Store 应用..."
                  onChanged={setSearchQuery}
                  textInputAutocapitalization="never"
                  autocorrectionDisabled
                />

                {/* 搜索结果 */}
                {isSearching ? (
                  <HStack frame={{ maxWidth: 'infinity', height: 44 }} spacing={8}>
                    <ProgressView />
                    <Text font={13} foregroundStyle="#6b7280">搜索中...</Text>
                  </HStack>
                ) : searchResults === undefined ? (
                  <Text font={13} foregroundStyle="#9ca3af">输入应用名称搜索图标</Text>
                ) : searchResults.length === 0 ? (
                  <Text font={13} foregroundStyle="#9ca3af">未找到相关应用</Text>
                ) : (
                  <VStack spacing={0} frame={{ maxHeight: 240 }} clipShape={{ type: 'rect', cornerRadius: 8 }}>
                    <ScrollView>
                      <VStack spacing={0}>
                        {searchResults.slice(0, 8).map((app: any, index: number) => (
                          <Button key={app.trackId || index} action={() => selectAppStoreIcon(app)}>
                            <HStack
                              padding={8}
                              background={index % 2 === 0 ? '#ffffff' : '#f9fafb'}
                              spacing={12}
                              frame={{ maxWidth: 'infinity', height: 56 }}
                            >
                              <Image
                                imageUrl={app.artworkUrl100}
                                resizable
                                frame={{ width: 40, height: 40 }}
                                clipShape={{ type: 'rect', cornerRadius: 10 }}
                              />
                              <VStack alignment="leading" spacing={2} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
                                <Text font={14} fontWeight="medium" foregroundStyle="#1f2937" lineLimit={1}>
                                  {app.trackName}
                                </Text>
                                <Text font={12} foregroundStyle="#6b7280" lineLimit={1}>
                                  {app.artistName}
                                </Text>
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

          {/* 基本信息 */}
          <VStack
            padding={20}
            background="#ffffff"
            clipShape={{ type: 'rect', cornerRadius: 12 }}
            spacing={16}
          >
            <Text font={14} foregroundStyle="#6b7280">基本信息</Text>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium">插件名称 *</Text>
              <TextField
                title=""
                value={name}
                prompt="请输入插件名称"
                onChanged={setName}
              />
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium">插件描述 *</Text>
              <TextField
                title=""
                value={description}
                prompt="请输入插件描述"
                onChanged={setDescription}
              />
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium">作者</Text>
              <TextField
                title=""
                value={author}
                prompt="脚本作者"
                onChanged={setAuthor}
              />
            </VStack>

            <VStack alignment="leading" spacing={8}>
              <Text font={14} fontWeight="medium">插件链接 *</Text>
              <TextField
                title=""
                value={url}
                prompt="请输入插件下载链接"
                onChanged={setUrl}
                textInputAutocapitalization="never"
                autocorrectionDisabled
              />
            </VStack>
          </VStack>

          {/* 提示信息 */}
          <VStack
            padding={16}
            background="#fef3c7"
            clipShape={{ type: 'rect', cornerRadius: 12 }}
            alignment="leading"
            spacing={8}
          >
            <HStack spacing={8} alignment="center">
              <Image
                systemName="info.circle.fill"
                foregroundStyle="#d97706"
                frame={{ width: 16, height: 16 }}
              />
              <Text font={14} fontWeight="medium" foregroundStyle="#92400e">
                提示
              </Text>
            </HStack>
            <Text font={13} foregroundStyle="#92400e">
              插件链接支持 .scripting、.js、.zip 文件或 GitHub 链接。发布后将显示在插件中心供其他用户下载。
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  )
}
