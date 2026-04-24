import { HStack, ScrollView, VStack } from 'scripting'
import { useColors } from '../contexts/ThemeContext'
import { FavoriteButton } from './common/FavoriteButton'
import { GetButton } from './common/GetButton'
import { PluginSummary } from './common/PluginSummary'
import { SectionHeader } from './common/SectionHeader'
import { spacing, fontSize, cornerRadius } from '../utils/styles'
import { getPluginKey } from '../utils/plugin'
import type { Plugin } from '../types'
import { parseAuthorNames } from '../utils/author'

export interface FeaturedSectionProps {
  plugins: Plugin[]
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
  installingPluginKey?: string | null
}

interface FeaturedCardProps {
  plugin: Plugin
  onTap: () => void
  onInstall: () => void
  isInstalling?: boolean
  installDisabled?: boolean
}

const FeaturedCard = ({ plugin, onTap, onInstall, isInstalling = false, installDisabled = false }: FeaturedCardProps) => {
  const colors = useColors()

  return (
    <VStack
      frame={{ width: 260, minHeight: 152 }}
      background={colors.secondaryBackground}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.xl }}
      alignment="leading"
      spacing={spacing.xs}
      onTapGesture={onTap}
    >
      <VStack
        padding={{ leading: spacing.md, trailing: spacing.md, top: spacing.sm }}
        frame={{ maxHeight: 'infinity' }}
        alignment="leading"
        spacing={spacing.xs}
      >
        <HStack alignment="center" spacing={spacing.xs} frame={{ maxWidth: 'infinity' }}>
          <PluginSummary
            plugin={plugin}
            title={plugin.name}
            showIcon={false}
            titleFont={fontSize.title3}
            titleWeight="bold"
            spacing={0}
          />

          <FavoriteButton pluginId={plugin.id} />
        </HStack>

        <PluginSummary
          plugin={plugin}
          title={plugin.description || '探索这款精彩脚本'}
          showIcon={false}
          titleFont={fontSize.footnote}
          titleWeight="medium"
          titleColor="secondaryLabel"
          titleLineLimit={2}
          spacing={0}
        />
      </VStack>

      <HStack
        padding={{ leading: spacing.md, trailing: spacing.md, top: spacing.xs, bottom: spacing.sm }}
        alignment="center"
        spacing={spacing.sm}
      >
        <PluginSummary
          plugin={plugin}
          title={parseAuthorNames(plugin.author || '未知作者')[0] || '未知作者'}
          subtitle={`更新于 ${plugin.updateTime || '未知'}`}
          titleFont={fontSize.footnote}
          subtitleFont={fontSize.caption1}
          titleWeight="medium"
          titleColor="secondaryLabel"
          subtitleColor="tertiaryLabel"
          spacing={spacing.sm}
        />

        <GetButton onPress={onInstall} isLoading={isInstalling} disabled={installDisabled} />
      </HStack>
    </VStack>
  )
}

export const FeaturedSection = ({ plugins, onInstall, onDetail, installingPluginKey = null }: FeaturedSectionProps) => {
  if (plugins.length === 0) {
    return <VStack />
  }

  return (
    <VStack>
      <SectionHeader title="最近上新" />

      <ScrollView axes="horizontal">
        <HStack padding={{ leading: spacing.lg, trailing: spacing.lg }} spacing={spacing.md}>
          {plugins.map((plugin) => {
            const pluginKey = getPluginKey(plugin)
            const hasActiveInstall = Boolean(installingPluginKey)

            return (
              <FeaturedCard
                key={pluginKey}
                plugin={plugin}
                onTap={() => onDetail(plugin)}
                onInstall={() => onInstall(plugin)}
                isInstalling={installingPluginKey === pluginKey}
                installDisabled={hasActiveInstall}
              />
            )
          })}
        </HStack>
      </ScrollView>
    </VStack>
  )
}
