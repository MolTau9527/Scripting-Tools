import { Image, Text, VStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, fontSize } from '../../utils/styles'

export interface PreviewTileProps {
  imageUrl?: string
  symbol?: string
  emoji?: string
  placeholderSymbol?: string
  placeholderFont?: number
  size?: number
}

export const PreviewTile = ({
  imageUrl,
  symbol,
  emoji,
  placeholderSymbol,
  placeholderFont = 32,
  size = 80,
}: PreviewTileProps) => {
  const colors = useColors()

  if (imageUrl) {
    return (
      <Image
        imageUrl={imageUrl}
        resizable
        frame={{ width: size, height: size }}
        clipShape={{ type: 'rect', cornerRadius: cornerRadius.lg }}
      />
    )
  }

  return (
    <VStack
      frame={{ width: size, height: size }}
      background={colors.tertiaryFill}
      clipShape={{ type: 'rect', cornerRadius: cornerRadius.lg }}
      alignment="center"
    >
      {symbol ? (
        <Image systemName={symbol} font={48} foregroundStyle={colors.label} />
      ) : emoji ? (
        <Text font={fontSize.largeTitle}>{emoji}</Text>
      ) : (
        <Image
          systemName={placeholderSymbol || 'photo'}
          font={placeholderFont}
          foregroundStyle={colors.tertiaryLabel}
          frame={{ width: 32, height: 32 }}
        />
      )}
    </VStack>
  )
}
