import { Button, HStack, Image, Navigation, ScrollView, Spacer, Text, TextField, Toggle, VStack, ZStack, useState, useEffect } from 'scripting'
import type { Plugin, UserSettings } from '../types'
import { getUserSettings, saveUserSettings, loadDefaultAvatar, resetUserSettings, toggleFollowPlugin } from '../utils/userSettings'
import { type ThemeMode, getThemeColors, getActualThemeMode, getGradientBackground, themedColors } from '../utils/theme'

interface MyProfileProps {
  plugins: Plugin[]
  onRefresh: () => void
  themeMode: ThemeMode
  onDetail: (plugin: Plugin) => void
  onInstall: (plugin: Plugin) => void
}

export const MyProfile = ({ plugins, onRefresh, themeMode, onDetail, onInstall }: MyProfileProps) => {
  const dismiss = Navigation.useDismiss()
  const actualTheme = getActualThemeMode(themeMode)
  const colors = getThemeColors(themeMode)
  const gradientBg = getGradientBackground(themeMode)
  const labelColor = themedColors.labelPrimary(themeMode)
  const placeholderColor = themedColors.placeholder(themeMode)
  const [settings, setSettings] = useState<UserSettings>(getUserSettings())
  const [showSettings, setShowSettings] = useState(false)
  const [myPlugins, setMyPlugins] = useState<Plugin[]>([])
  const [followedPlugins, setFollowedPlugins] = useState<Plugin[]>([])

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

  useEffect(() => {
    if (settings.authorName) {
      setMyPlugins(plugins.filter(p => p.author.toLowerCase().includes(settings.authorName.toLowerCase())))
    } else {
      setMyPlugins([])
    }
    const followedIds = settings.followedPlugins || []
    setFollowedPlugins(plugins.filter(p => followedIds.includes(String(p.id))))
  }, [settings, plugins])

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
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background={gradientBg} preferredColorScheme={actualTheme}>
      <HStack padding={16} background={colors.cardBackground} alignment="center">
        <Button action={() => dismiss()}>
          <Text font={16} foregroundStyle={colors.buttonPrimary}>返回</Text>
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold" foregroundStyle={colors.textPrimary}>我的</Text>
        <Spacer />
        <VStack frame={{ width: 50 }} />
      </HStack>

      <ScrollView>
        <VStack padding={16} spacing={16}>
          <VStack padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} spacing={16}>
            <HStack spacing={16} alignment="center">
              <Button action={pickAvatar}>
                {settings.avatar && (settings.avatar.startsWith('data:') || settings.avatar.startsWith('http')) ? (
                  <Image imageUrl={settings.avatar} resizable frame={{ width: 64, height: 64 }} clipShape={{ type: 'rect', cornerRadius: 32 }} />
                ) : (
                  <VStack frame={{ width: 64, height: 64 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 32 }} alignment="center">
                    <Image systemName="person.fill" foregroundStyle={colors.textTertiary} frame={{ width: 32, height: 32 }} />
                  </VStack>
                )}
              </Button>

              <VStack alignment="leading" spacing={4} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
                <Text font={18} fontWeight="semibold" foregroundStyle={colors.textPrimary}>{settings.authorName || '未设置昵称'}</Text>
                <Text font={13} foregroundStyle={colors.textSecondary}>{myPlugins.length} 个作品</Text>
              </VStack>
              <Button action={() => setShowSettings(!showSettings)}>
                <Image systemName={showSettings ? 'chevron.up' : 'gearshape'} foregroundStyle={colors.textTertiary} frame={{ width: 20, height: 20 }} />
              </Button>
            </HStack>

            {showSettings && (
              <VStack padding={12} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 8 }} spacing={12}>
                <VStack alignment="leading" spacing={4}>
                  <Text font={14} fontWeight="medium" foregroundStyle={labelColor}>作者名</Text>
                  <ZStack alignment="leading">
                    {!settings.authorName && <Text font={14} foregroundStyle={placeholderColor} padding={{ leading: 4 }}>请输入作者名</Text>}
                    <TextField title="" value={settings.authorName} onChanged={(value) => { const newSettings = saveUserSettings({ authorName: value }); setSettings(newSettings) }} foregroundStyle={colors.textPrimary} />
                  </ZStack>
                </VStack>

                <VStack alignment="leading" spacing={4}>
                  <Text font={14} fontWeight="medium" foregroundStyle={labelColor}>个人主页</Text>
                  <ZStack alignment="leading">
                    {!settings.repoUrl && <Text font={14} foregroundStyle={placeholderColor} padding={{ leading: 4 }}>请输入个人主页地址</Text>}
                    <TextField title="" value={settings.repoUrl} onChanged={(value) => { const newSettings = saveUserSettings({ repoUrl: value }); setSettings(newSettings) }} textInputAutocapitalization="never" autocorrectionDisabled foregroundStyle={colors.textPrimary} />
                  </ZStack>
                </VStack>

                <HStack alignment="center">
                  <Text font={14} fontWeight="medium" foregroundStyle={labelColor}>发布时自动填写作者名</Text>
                  <Spacer />
                  <Toggle title="" value={settings.applyAuthorToPublish} onChanged={(value) => { const newSettings = saveUserSettings({ applyAuthorToPublish: value }); setSettings(newSettings) }} />
                </HStack>

                <Button action={async () => { const newSettings = resetUserSettings(); const avatar = await loadDefaultAvatar(); if (avatar) { const updatedSettings = saveUserSettings({ avatar }); setSettings(updatedSettings) } else { setSettings(newSettings) } }}>
                  <HStack frame={{ maxWidth: 'infinity' }} padding={{ top: 10, bottom: 10 }} alignment="center">
                    <Text font={14} foregroundStyle={colors.buttonDanger}>清空所有信息</Text>
                  </HStack>
                </Button>
              </VStack>
            )}
          </VStack>

          <VStack padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} spacing={12}>
            <Text font={14} foregroundStyle={colors.textSecondary}>我的作品</Text>

            {!settings.authorName ? (
              <VStack padding={20} spacing={8}>
                <Image systemName="person.crop.circle.badge.questionmark" font={32} foregroundStyle={colors.textPrimary} frame={{ width: 40, height: 40 }} />
                <Text font={14} foregroundStyle={colors.textTertiary}>请先设置作者名</Text>
              </VStack>
            ) : myPlugins.length === 0 ? (
              <VStack padding={20} spacing={8}>
                <Image systemName="doc.text.magnifyingglass" font={32} foregroundStyle={colors.textPrimary} frame={{ width: 40, height: 40 }} />
                <Text font={14} foregroundStyle={colors.textTertiary}>暂无作品</Text>
              </VStack>
            ) : (
              <VStack spacing={8}>
                {myPlugins.map((plugin, index) => (
                  <HStack key={plugin.id || index} padding={12} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 8 }} spacing={12} onTapGesture={() => onDetail(plugin)}>
                    {plugin.symbol ? (
                      <VStack frame={{ width: 44, height: 44 }} background={colors.border} clipShape={{ type: 'rect', cornerRadius: 10 }}>
                        <Image systemName={plugin.symbol} font={24} foregroundStyle={colors.textPrimary} />
                      </VStack>
                    ) : plugin.icon && (plugin.icon.startsWith('data:') || plugin.icon.startsWith('http')) ? (
                      <Image imageUrl={plugin.icon} resizable frame={{ width: 44, height: 44 }} clipShape={{ type: 'rect', cornerRadius: 10 }} />
                    ) : (
                      <VStack frame={{ width: 44, height: 44 }} background={colors.border} clipShape={{ type: 'rect', cornerRadius: 10 }}>
                        <Text font={24}>{plugin.icon || '📦'}</Text>
                      </VStack>
                    )}
                    <VStack alignment="leading" spacing={2} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
                      <Text font={15} fontWeight="medium" foregroundStyle={colors.textPrimary} lineLimit={1} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>{plugin.name}</Text>
                      <Text font={12} foregroundStyle={colors.textSecondary} lineLimit={1} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>{plugin.description}</Text>
                    </VStack>
                    <Button action={() => onInstall(plugin)}>
                      <Text font={13} fontWeight="medium" foregroundStyle="#ffffff" padding={{ leading: 12, trailing: 12, top: 6, bottom: 6 }} background={colors.buttonPrimary} clipShape={{ type: 'rect', cornerRadius: 12 }}>安装</Text>
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>

          <VStack padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} spacing={12}>
            <Text font={14} foregroundStyle={colors.textSecondary}>关注作品</Text>

            {followedPlugins.length === 0 ? (
              <VStack padding={20} spacing={8}>
                <Image systemName="star" font={32} foregroundStyle={colors.textPrimary} frame={{ width: 40, height: 40 }} />
                <Text font={14} foregroundStyle={colors.textTertiary}>暂无关注</Text>
              </VStack>
            ) : (
              <VStack spacing={8}>
                {followedPlugins.map((plugin, index) => (
                  <HStack key={plugin.id || index} padding={12} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 8 }} spacing={12} onTapGesture={() => onDetail(plugin)}>
                    {plugin.symbol ? (
                      <VStack frame={{ width: 44, height: 44 }} background={colors.border} clipShape={{ type: 'rect', cornerRadius: 10 }}>
                        <Image systemName={plugin.symbol} font={24} foregroundStyle={colors.textPrimary} />
                      </VStack>
                    ) : plugin.icon && (plugin.icon.startsWith('data:') || plugin.icon.startsWith('http')) ? (
                      <Image imageUrl={plugin.icon} resizable frame={{ width: 44, height: 44 }} clipShape={{ type: 'rect', cornerRadius: 10 }} />
                    ) : (
                      <VStack frame={{ width: 44, height: 44 }} background={colors.border} clipShape={{ type: 'rect', cornerRadius: 10 }}>
                        <Text font={24}>{plugin.icon || '📦'}</Text>
                      </VStack>
                    )}
                    <VStack alignment="leading" spacing={2} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
                      <Text font={15} fontWeight="medium" foregroundStyle={colors.textPrimary} lineLimit={1} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>{plugin.name}</Text>
                      <Text font={12} foregroundStyle={colors.textSecondary} lineLimit={1} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>{plugin.author}</Text>
                    </VStack>
                    <HStack spacing={8}>
                      <Button action={() => { toggleFollowPlugin(String(plugin.id)); setSettings(getUserSettings()) }}>
                        <Image systemName="star.fill" foregroundStyle="#fbbf24" frame={{ width: 22, height: 22 }} />
                      </Button>
                      <Button action={() => onInstall(plugin)}>
                        <Text font={13} fontWeight="medium" foregroundStyle="#ffffff" padding={{ leading: 12, trailing: 12, top: 6, bottom: 6 }} background={colors.buttonPrimary} clipShape={{ type: 'rect', cornerRadius: 12 }}>安装</Text>
                      </Button>
                    </HStack>
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
