import { Button, HStack, Text, VStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { PluginIcon } from './PluginIcon'
import { cornerRadius, spacing, fontSize, createSymmetricPadding } from '../../utils/styles'
import type { Plugin } from '../../types'
import { formatAuthorNames } from '../../utils/author'

// ============================================================
// Types
// ============================================================

export interface PluginRowProps {
  plugin: Plugin
  onTap?: () => void
  trailing?: JSX.Element
  showAuthor?: boolean
  showDescription?: boolean
}

// ============================================================
// Component
// ============================================================

export const PluginRow = ({
  plugin,
  onTap,
  trailing,
  showAuthor = true,
  showDescription = false,
}: PluginRowProps) => {
  const colors = useColors()

  const content = (
    <HStack
      spacing={spacing.md}
      alignment="center"
      frame={{ maxWidth: 'infinity' }}
    >
      <PluginIcon plugin={plugin} size="small" />

      <VStack
        alignment="leading"
        spacing={2}
        frame={{ maxWidth: 'infinity', alignment: 'leading' }}
      >
        <Text
          font={fontSize.body}
          fontWeight="medium"
          foregroundStyle={colors.label}
          lineLimit={1}
          frame={{ maxWidth: 'infinity', alignment: 'leading' }}
        >
          {plugin.name}
        </Text>

        {showDescription ? (
          <Text
            font={fontSize.footnote}
            foregroundStyle={colors.secondaryLabel}
            lineLimit={1}
            frame={{ maxWidth: 'infinity', alignment: 'leading' }}
          >
            {plugin.description || '暂无描述'}
          </Text>
        ) : showAuthor ? (
          <Text
            font={fontSize.footnote}
            foregroundStyle={colors.secondaryLabel}
            lineLimit={1}
            frame={{ maxWidth: 'infinity', alignment: 'leading' }}
          >
            {formatAuthorNames(plugin.author)}
          </Text>
        ) : null}
      </VStack>

      {trailing}
    </HStack>
  )

  const containerProps = {
    padding: createSymmetricPadding(spacing.md, spacing.lg),
    frame: { maxWidth: 'infinity' as const },
    ...(onTap && { onTapGesture: onTap }),
  }

  return <HStack {...containerProps}>{content}</HStack>
}

// ============================================================
// Get Button - App Store 样式
// ============================================================

export interface GetButtonProps {
  onPress?: () => void
  isLoading?: boolean
  disabled?: boolean
}

export const GetButton = ({ onPress, isLoading, disabled }: GetButtonProps) => {
  const colors = useColors()

  const content = (
    <Text
      font={fontSize.subheadline}
      fontWeight="bold"
      foregroundStyle={colors.tint}
      padding={createSymmetricPadding(spacing.sm, spacing.lg)}
      frame={{ minWidth: 72, minHeight: 32 }}
      background={colors.tertiaryFill}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
      opacity={disabled ? 0.6 : 1}
    >
      {isLoading ? '...' : '获取'}
    </Text>
  )

  return (
    <Button action={onPress || (() => {})} disabled={disabled || !onPress}>
      {content}
    </Button>
  )
}
