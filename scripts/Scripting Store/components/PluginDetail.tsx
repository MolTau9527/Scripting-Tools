import { Button, HStack, Image, Navigation, ScrollView, Spacer, Text, VStack } from 'scripting'
import type { Plugin } from '../types'
import { type ThemeMode, getThemeColors } from '../utils/theme'
import { AuthorProfile } from './AuthorProfile'

interface PluginDetailProps {
  plugin: Plugin
  onInstall: (plugin: Plugin) => void
  themeMode: ThemeMode
  plugins?: Plugin[]
}

function getOriginalUrl(url: string): string {
  const prefixes = ['scripting://', 'https://scripting.fun/import_scripts']
  if (prefixes.some(p => url.startsWith(p))) {
    const match = url.match(/[?&]urls=([^&]+)/)
    if (match?.[1]) {
      try {
        const urls = JSON.parse(decodeURIComponent(match[1]))
        if (Array.isArray(urls) && urls.length > 0) return urls[0]
      } catch {}
    }
  }
  return url
}

function parseAuthors(author: string): string[] {
  const match = author.match(/^(.*?)\s*\(https?:\/\/.*\)$/)
  return (match ? match[1] : author).split(/,\s*/)
}

export const PluginDetail = ({ plugin, onInstall, themeMode, plugins = [] }: PluginDetailProps) => {
  const dismiss = Navigation.useDismiss()
  const colors = getThemeColors(themeMode)
  const isBase64Icon = plugin.icon?.startsWith('data:image/')
  const authorNames = parseAuthors(plugin.author || '脚本作者')

  const showAuthorProfile = async (authorName: string) => {
    await Navigation.present({
      element: <AuthorProfile authorName={authorName} plugins={plugins} onDetail={(p) => {
        Navigation.present({ element: <PluginDetail plugin={p} onInstall={onInstall} themeMode={themeMode} plugins={plugins} />, modalPresentationStyle: 'pageSheet' })
      }} onInstall={onInstall} themeMode={themeMode} />,
      modalPresentationStyle: 'pageSheet'
    })
  }

  return (
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background={colors.background}>
      <HStack padding={16} background={colors.cardBackground} alignment="center">
        <Button action={() => dismiss()}>
          <Image systemName="xmark" foregroundStyle={colors.textSecondary} frame={{ width: 20, height: 20 }} />
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold" foregroundStyle={colors.textPrimary}>插件详情</Text>
        <Spacer />
        <VStack frame={{ width: 20 }} />
      </HStack>

      <ScrollView>
        <VStack padding={16} spacing={16}>
          <VStack padding={20} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 16 }} spacing={12}>
            {isBase64Icon ? (
              <Image imageUrl={plugin.icon} resizable frame={{ width: 80, height: 80 }} clipShape={{ type: 'rect', cornerRadius: 16 }} />
            ) : (
              <VStack frame={{ width: 80, height: 80 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 16 }}>
                <Text font={40}>{plugin.icon || '📦'}</Text>
              </VStack>
            )}

            <Text font={22} fontWeight="bold" foregroundStyle={colors.textPrimary}>{plugin.name}</Text>

            <HStack spacing={8} alignment="center">
              {authorNames.map((authorName, index) => (
                <Text
                  key={index}
                  font={14}
                  foregroundStyle={colors.buttonPrimary}
                  padding={{ leading: 10, trailing: 10, top: 4, bottom: 4 }}
                  background={colors.inputBackground}
                  clipShape={{ type: 'rect', cornerRadius: 12 }}
                  onTapGesture={() => showAuthorProfile(authorName)}
                >
                  {authorName}
                </Text>
              ))}
            </HStack>

            <Text font={13} foregroundStyle={colors.textTertiary}>{`更新于 ${plugin.updateTime || '未知'}`}</Text>

            <Button action={() => onInstall(plugin)}>
              <HStack padding={{ leading: 32, trailing: 32, top: 12, bottom: 12 }} background={colors.buttonPrimary} clipShape={{ type: 'rect', cornerRadius: 20 }} alignment="center" spacing={8}>
                <Image systemName="arrow.down.circle.fill" foregroundStyle="#ffffff" frame={{ width: 18, height: 18 }} />
                <Text font={16} fontWeight="semibold" foregroundStyle="#ffffff">安装插件</Text>
              </HStack>
            </Button>
          </VStack>

          <VStack padding={16} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="leading" spacing={12}>
            <Text font={16} fontWeight="semibold" foregroundStyle={colors.textPrimary}>描述</Text>
            <Text font={15} foregroundStyle={colors.textSecondary}>{plugin.description || '暂无描述'}</Text>
          </VStack>

          <VStack padding={16} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="leading" spacing={12}>
            <Text font={16} fontWeight="semibold" foregroundStyle={colors.textPrimary}>信息</Text>

            <HStack frame={{ maxWidth: 'infinity' }}>
              <Text font={14} foregroundStyle={colors.textSecondary}>ID</Text>
              <Spacer />
              <Text font={14} foregroundStyle={colors.textPrimary}>{String(plugin.id)}</Text>
            </HStack>

            {plugin.installCount !== undefined && (
              <HStack frame={{ maxWidth: 'infinity' }}>
                <Text font={14} foregroundStyle={colors.textSecondary}>安装量</Text>
                <Spacer />
                <Text font={14} foregroundStyle={colors.textPrimary}>{String(plugin.installCount)}</Text>
              </HStack>
            )}

            <VStack alignment="leading" spacing={4}>
              <Text font={14} foregroundStyle={colors.textSecondary}>原始链接</Text>
              <Text font={12} foregroundStyle={colors.buttonPrimary} onTapGesture={() => Safari.openURL(getOriginalUrl(plugin.url))} multilineTextAlignment="leading">
                {getOriginalUrl(plugin.url)}
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  )
}
