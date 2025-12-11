/**
 * 我的页面组件
 */

import {
  Button,
  HStack,
  Image,
  Navigation,
  ScrollView,
  Spacer,
  Text,
  TextField,
  Toggle,
  VStack,
  useState,
  useEffect
} from 'scripting'
import type { Plugin, UserSettings } from '../types'
import { getUserSettings, saveUserSettings, loadDefaultAvatar, resetUserSettings } from '../utils/userSettings'

interface MyProfileProps {
  plugins: Plugin[]
  onRefresh: () => void
}

/**
 * 我的页面组件
 */
export const MyProfile = ({ plugins, onRefresh }: MyProfileProps) => {
  const dismiss = Navigation.useDismiss()
  const [settings, setSettings] = useState<UserSettings>(getUserSettings())
  const [showSettings, setShowSettings] = useState(false)
  const [myPlugins, setMyPlugins] = useState<Plugin[]>([])

  // 加载默认头像
  useEffect(() => {
    if (!settings.avatar) {
      loadDefaultAvatar().then(avatar => {
        if (avatar) {
          const newSettings = saveUserSettings({ avatar })
          setSettings(newSettings)
        }
      })
    }
  }, [])

  // 根据作者名筛选插件
  useEffect(() => {
    if (settings.authorName) {
      const filtered = plugins.filter(p =>
        p.author.toLowerCase().includes(settings.authorName.toLowerCase())
      )
      setMyPlugins(filtered)
    } else {
      setMyPlugins([])
    }
  }, [settings.authorName, plugins])

  // 选择头像
  const pickAvatar = async () => {
    try {
      const images = await Photos.pickPhotos(1)
      if (images && images.length > 0) {
        const resized = images[0].preparingThumbnail({ width: 128, height: 128 })
        if (resized) {
          const base64 = resized.toJPEGBase64String(0.8)
          if (base64) {
            const newSettings = saveUserSettings({ avatar: `data:image/jpeg;base64,${base64}` })
            setSettings(newSettings)
          }
        }
      }
    } catch (error) {
      console.error('Failed to pick avatar:', error)
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
          <Text font={16} foregroundStyle="#007aff">返回</Text>
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold">我的</Text>
        <Spacer />
        <VStack frame={{ width: 50 }} />
      </HStack>

      <ScrollView>
        <VStack padding={16} spacing={16}>
          {/* 用户信息卡片 */}
          <VStack
            padding={20}
            background="#ffffff"
            clipShape={{ type: 'rect', cornerRadius: 12 }}
            spacing={16}
          >
            <HStack spacing={16} alignment="center">
              {/* 头像 */}
              <Button action={pickAvatar}>
                {settings.avatar && (settings.avatar.startsWith('data:') || settings.avatar.startsWith('http')) ? (
                  <Image
                    imageUrl={settings.avatar}
                    resizable
                    frame={{ width: 64, height: 64 }}
                    clipShape={{ type: 'rect', cornerRadius: 32 }}
                  />
                ) : (
                  <VStack
                    frame={{ width: 64, height: 64 }}
                    background="#e5e7eb"
                    clipShape={{ type: 'rect', cornerRadius: 32 }}
                    alignment="center"
                  >
                    <Image
                      systemName="person.fill"
                      foregroundStyle="#9ca3af"
                      frame={{ width: 32, height: 32 }}
                    />
                  </VStack>
                )}
              </Button>

              <VStack alignment="leading" spacing={4}>
                <HStack alignment="center" spacing={8}>
                  <Text font={18} fontWeight="semibold">
                    {settings.authorName || '未设置昵称'}
                  </Text>
                  <Button action={() => setShowSettings(!showSettings)}>
                    <Text font={12} foregroundStyle="#9ca3af">
                      个性设置
                    </Text>
                  </Button>
                </HStack>
                <Text font={13} foregroundStyle="#6b7280">
                  {myPlugins.length} 个作品
                </Text>
              </VStack>
            </HStack>

            {/* 个性设置面板 */}
            {showSettings && (
              <VStack
                padding={12}
                background="#f3f4f6"
                clipShape={{ type: 'rect', cornerRadius: 8 }}
                spacing={12}
              >
                <VStack alignment="leading" spacing={4}>
                  <Text font={13} foregroundStyle="#6b7280">作者名</Text>
                  <TextField
                    title=""
                    value={settings.authorName}
                    prompt="输入作者名..."
                    onChanged={(value) => {
                      const newSettings = saveUserSettings({ authorName: value })
                      setSettings(newSettings)
                    }}
                  />
                </VStack>

                <VStack alignment="leading" spacing={4}>
                  <Text font={13} foregroundStyle="#6b7280">仓库地址</Text>
                  <TextField
                    title=""
                    value={settings.repoUrl}
                    prompt="输入 GitHub 仓库地址..."
                    onChanged={(value) => {
                      const newSettings = saveUserSettings({ repoUrl: value })
                      setSettings(newSettings)
                    }}
                    textInputAutocapitalization="never"
                    autocorrectionDisabled
                  />
                </VStack>

                <HStack alignment="center">
                  <Text font={13} foregroundStyle="#6b7280">发布时自动填写作者名</Text>
                  <Spacer />
                  <Toggle
                    title=""
                    value={settings.applyAuthorToPublish}
                    onChanged={(value) => {
                      const newSettings = saveUserSettings({ applyAuthorToPublish: value })
                      setSettings(newSettings)
                    }}
                  />
                </HStack>

                {/* 清空信息按钮 */}
                <Button
                  action={async () => {
                    const newSettings = resetUserSettings()
                    const avatar = await loadDefaultAvatar()
                    if (avatar) {
                      const updatedSettings = saveUserSettings({ avatar })
                      setSettings(updatedSettings)
                    } else {
                      setSettings(newSettings)
                    }
                  }}
                >
                  <HStack
                    frame={{ maxWidth: 'infinity' }}
                    padding={{ top: 10, bottom: 10 }}
                    alignment="center"
                  >
                    <Text font={14} foregroundStyle="#ef4444">清空所有信息</Text>
                  </HStack>
                </Button>
              </VStack>
            )}
          </VStack>

          {/* 我的作品 */}
          <VStack
            padding={20}
            background="#ffffff"
            clipShape={{ type: 'rect', cornerRadius: 12 }}
            spacing={12}
          >
            <Text font={14} foregroundStyle="#6b7280">我的作品</Text>

            {!settings.authorName ? (
              <VStack padding={20} spacing={8}>
                <Image
                  systemName="person.crop.circle.badge.questionmark"
                  foregroundStyle="#d1d5db"
                  frame={{ width: 40, height: 40 }}
                />
                <Text font={14} foregroundStyle="#9ca3af">
                  请先设置作者名
                </Text>
              </VStack>
            ) : myPlugins.length === 0 ? (
              <VStack padding={20} spacing={8}>
                <Image
                  systemName="doc.text.magnifyingglass"
                  foregroundStyle="#d1d5db"
                  frame={{ width: 40, height: 40 }}
                />
                <Text font={14} foregroundStyle="#9ca3af">
                  暂无作品
                </Text>
              </VStack>
            ) : (
              <VStack spacing={8}>
                {myPlugins.map((plugin, index) => (
                  <HStack
                    key={plugin.id || index}
                    padding={12}
                    background="#f9fafb"
                    clipShape={{ type: 'rect', cornerRadius: 8 }}
                    spacing={12}
                  >
                    {plugin.icon.startsWith('data:') || plugin.icon.startsWith('http') ? (
                      <Image
                        imageUrl={plugin.icon}
                        resizable
                        frame={{ width: 44, height: 44 }}
                        clipShape={{ type: 'rect', cornerRadius: 10 }}
                      />
                    ) : (
                      <VStack
                        frame={{ width: 44, height: 44 }}
                        background="#e5e7eb"
                        clipShape={{ type: 'rect', cornerRadius: 10 }}
                      >
                        <Text font={24}>{plugin.icon}</Text>
                      </VStack>
                    )}
                    <VStack alignment="leading" spacing={2} frame={{ maxWidth: 'infinity' }}>
                      <Text font={15} fontWeight="medium" lineLimit={1}>
                        {plugin.name}
                      </Text>
                      <Text font={12} foregroundStyle="#6b7280" lineLimit={1}>
                        {plugin.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  )
}
