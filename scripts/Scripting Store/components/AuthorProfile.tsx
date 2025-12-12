import { Button, HStack, Image, Navigation, ScrollView, Spacer, Text, VStack } from 'scripting'
import type { Plugin } from '../types'
import { type ThemeMode, getThemeColors } from '../utils/theme'

interface AuthorProfileProps {
  authorName: string
  plugins: Plugin[]
  onDetail: (plugin: Plugin) => void
  onInstall: (plugin: Plugin) => void
  themeMode: ThemeMode
}

export const AuthorProfile = ({ authorName, plugins, onDetail, onInstall, themeMode }: AuthorProfileProps) => {
  const dismiss = Navigation.useDismiss()
  const colors = getThemeColors(themeMode)
  const authorPlugins = plugins.filter(p => p.author.toLowerCase().includes(authorName.toLowerCase()))

  return (
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background={colors.background}>
      <HStack padding={16} background={colors.cardBackground} alignment="center">
        <Button action={() => dismiss()}>
          <Text font={16} foregroundStyle={colors.buttonPrimary}>返回</Text>
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold" foregroundStyle={colors.textPrimary}>{authorName}</Text>
        <Spacer />
        <VStack frame={{ width: 50 }} />
      </HStack>

      <ScrollView>
        <VStack padding={16} spacing={16}>
          <VStack padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} spacing={12}>
            <Text font={14} foregroundStyle={colors.textSecondary}>{authorName} 的作品 ({authorPlugins.length})</Text>

            {authorPlugins.length === 0 ? (
              <VStack padding={20} spacing={8}>
                <Image systemName="doc.text.magnifyingglass" foregroundStyle={colors.textTertiary} frame={{ width: 40, height: 40 }} />
                <Text font={14} foregroundStyle={colors.textTertiary}>暂无作品</Text>
              </VStack>
            ) : (
              <VStack spacing={8}>
                {authorPlugins.map((plugin, index) => (
                  <HStack
                    key={plugin.id || index}
                    padding={12}
                    background={colors.inputBackground}
                    clipShape={{ type: 'rect', cornerRadius: 8 }}
                    spacing={12}
                    onTapGesture={() => onDetail(plugin)}
                  >
                    {plugin.icon?.startsWith('data:') || plugin.icon?.startsWith('http') ? (
                      <Image imageUrl={plugin.icon} resizable frame={{ width: 44, height: 44 }} clipShape={{ type: 'rect', cornerRadius: 10 }} />
                    ) : (
                      <VStack frame={{ width: 44, height: 44 }} background={colors.border} clipShape={{ type: 'rect', cornerRadius: 10 }}>
                        <Text font={24}>{plugin.icon || '📦'}</Text>
                      </VStack>
                    )}
                    <VStack alignment="leading" spacing={2} frame={{ maxWidth: 'infinity' }}>
                      <Text font={15} fontWeight="medium" foregroundStyle={colors.textPrimary} lineLimit={1}>{plugin.name}</Text>
                      <Text font={12} foregroundStyle={colors.textSecondary} lineLimit={1}>{plugin.description}</Text>
                    </VStack>
                    <Button action={() => onInstall(plugin)}>
                      <Text
                        font={13}
                        fontWeight="medium"
                        foregroundStyle="#ffffff"
                        padding={{ leading: 12, trailing: 12, top: 6, bottom: 6 }}
                        background={colors.buttonPrimary}
                        clipShape={{ type: 'rect', cornerRadius: 12 }}
                      >
                        安装
                      </Text>
                    </Button>
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
