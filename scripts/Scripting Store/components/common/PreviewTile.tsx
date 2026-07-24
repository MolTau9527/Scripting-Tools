import { Image, Text, VStack } from 'scripting'
import { useColors } from '../../contexts/ThemeContext'
import { cornerRadius, fontSize } from '../../utils/styles'

interface PreviewTileProps {
  imageUrl?: string
  symbol?: string
  emoji?: string
  placeholderSymbol?: string
}

export const PreviewTile = ({
  imageUrl,
  symbol,
  emoji,
  placeholderSymbol,
}: PreviewTileProps) => {
  const colors = useColors()

  if (imageUrl) {
    return (
      <Image
        imageUrl={imageUrl}
        resizable
        frame={{ width: 80, height: 80 }}
        clipShape={{ type: 'rect', cornerRadius: cornerRadius.lg }}
      />
    )
  }

  return (
    <VStack
      frame={{ width: 80, height: 80 }}
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
          font={32}
          foregroundStyle={colors.tertiaryLabel}
          frame={{ width: 32, height: 32 }}
        />
      )}
    </VStack>
  )
}
