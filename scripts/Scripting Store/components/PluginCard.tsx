import { Button, HStack, Image, Text, VStack } from 'scripting'
import type { Plugin } from '../types'
import { type ThemeMode, getThemeColors } from '../utils/theme'
import { isFollowingPlugin, toggleFollowPlugin } from '../utils/userSettings'

interface PluginCardProps {
  plugin: Plugin
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  themeMode: ThemeMode
  onFollowChange?: () => void
}

const isImageUrl = (icon: string) => icon.startsWith('http') || icon.startsWith('data:')

function parseAuthor(author: string): string[] {
  const match = author.match(/^(.*?)\s*\(https?:\/\/.*\)$/)
  return (match ? match[1] : author).split(/,\s*/).filter(Boolean)
}

export const PluginCard = ({ plugin, onInstall, onDetail, themeMode, onFollowChange }: PluginCardProps) => {
  const authorNames = parseAuthor(plugin.author || '脚本作者')
  const colors = getThemeColors(themeMode)
  const isFollowed = isFollowingPlugin(String(plugin.id))

  return (
    <VStack padding={16} background={colors.cardBackground} clipShape={{ type: 'rect', cornerRadius: 12 }} frame={{ maxWidth: 'infinity' }} alignment="leading">
      <HStack alignment="center" spacing={12} frame={{ maxWidth: 'infinity' }}>
        <HStack alignment="center" spacing={12} frame={{ maxWidth: 'infinity' }} onTapGesture={() => onDetail(plugin)}>
          {plugin.symbol ? (
            <VStack frame={{ width: 48, height: 48 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 10 }}>
              <Image systemName={plugin.symbol} font={32} foregroundStyle={colors.textPrimary} />
            </VStack>
          ) : plugin.icon && isImageUrl(plugin.icon) ? (
            <Image
              imageUrl={plugin.icon}
              resizable
              frame={{ width: 48, height: 48 }}
              clipShape={{ type: 'rect', cornerRadius: 10 }}
              placeholder={
                <VStack frame={{ width: 48, height: 48 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 10 }}>
                  <Text font={24}>📦</Text>
                </VStack>
              }
            />
          ) : (
            <VStack frame={{ width: 48, height: 48 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 10 }} alignment="center">
              <Text font={24}>{plugin.icon || '📦'}</Text>
            </VStack>
          )}

          <VStack alignment="leading" spacing={4} frame={{ maxWidth: 'infinity' }}>
            <Text font={16} fontWeight="semibold" foregroundStyle={colors.textPrimary} lineLimit={1} frame={{ maxWidth: 'infinity', alignment: 'leading' }}>{plugin.name}</Text>
            <HStack spacing={4} alignment="center" frame={{ maxWidth: 'infinity', alignment: 'leading' }}>
              {authorNames.map((authorName, index) => (
                <Text key={index} font={12} foregroundStyle={colors.textSecondary}>{authorName}{index < authorNames.length - 1 ? '、' : ''}</Text>
              ))}
            </HStack>
          </VStack>
        </HStack>

        <HStack spacing={8}>
          <Button action={() => { toggleFollowPlugin(String(plugin.id)); onFollowChange?.() }}>
            <Image systemName={isFollowed ? 'star.fill' : 'star'} foregroundStyle={isFollowed ? '#fbbf24' : colors.textTertiary} frame={{ width: 22, height: 22 }} />
          </Button>
          <Button action={() => onInstall(plugin)}>
            <Text font={14} fontWeight="medium" foregroundStyle="#ffffff" padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }} background={colors.buttonPrimary} clipShape={{ type: 'rect', cornerRadius: 16 }}>安装</Text>
          </Button>
        </HStack>
      </HStack>

      <VStack spacing={4} padding={{ top: 12 }} onTapGesture={() => onDetail(plugin)}>
        <Text font={14} foregroundStyle={colors.textSecondary} lineLimit={2} multilineTextAlignment="leading" frame={{ maxWidth: 'infinity', alignment: 'leading' }}>{plugin.description || '暂无描述'}</Text>
        <HStack>
          <Text font={12} foregroundStyle={colors.textTertiary}>{`更新于 ${plugin.updateTime || '未知'}`}</Text>
        </HStack>
      </VStack>
    </VStack>
  )
}
