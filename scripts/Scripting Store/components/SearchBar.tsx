import { HStack, Image, VStack, useCallback, useEffect, useRef, useState } from 'scripting'
import { useColors, useTheme } from '../contexts/ThemeContext'
import { InputField } from './common/InputField'
import { spacing, cornerRadius, iconSize } from '../utils/styles'
import { useDebounce } from '../hooks/useDebounce'

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
  placeholder?: string
}

export const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = '搜索',
}: SearchBarProps) => {
  const colors = useColors()
  const { actualMode } = useTheme()
  const [inputValue, setInputValue] = useState(value)
  const committedValueRef = useRef(value)
  const debouncedValue = useDebounce(inputValue, 180)

  useEffect(() => {
    if (value === committedValueRef.current) {
      return
    }

    committedValueRef.current = value
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (debouncedValue === committedValueRef.current) {
      return
    }

    committedValueRef.current = debouncedValue
    onChangeText(debouncedValue)
  }, [debouncedValue, onChangeText])

  const handleSubmit = useCallback(() => {
    onSubmit?.()
  }, [onSubmit])

  const handleClear = useCallback(() => {
    committedValueRef.current = ''
    setInputValue('')
    onChangeText('')
  }, [onChangeText])

  const searchBackground = actualMode === 'dark'
    ? 'rgba(18,49,81,0.8)'
    : 'rgba(255,255,255,0.68)'
  const searchBorder = actualMode === 'dark'
    ? 'rgba(117,196,255,0.2)'
    : 'rgba(84,163,224,0.22)'
  const iconColor = colors.secondaryLabel

  return (
    <VStack padding={{ leading: spacing.lg, trailing: spacing.lg, top: spacing.sm, bottom: spacing.sm }}>
      {/*
       * 水平 padding 使用 spacing.lg (16)：胶囊 (cornerRadius.full) 的半径 ≈ 容器高度/2（约 22pt），
       * 如果图标 padding 小于这个半径，图标会落在圆弧区域内，视觉上与圆角不贴合。
       * 多余的 spacing.xs 间隙留给图标与输入框，保持左右对称。
       */}
      <HStack
        padding={{ leading: spacing.lg, trailing: spacing.lg, top: spacing.sm, bottom: spacing.sm }}
        background={searchBackground}
        border={{ style: searchBorder, width: 1 }}
        clipShape={{ type: 'rect', cornerRadius: cornerRadius.full }}
        alignment="center"
        spacing={spacing.sm}
        onSubmit={handleSubmit}
        submitScope
      >
        <Image
          systemName="magnifyingglass"
          foregroundStyle={iconColor}
          resizable
          aspectRatio={{ contentMode: 'fit' }}
          frame={{ width: iconSize.sm, height: iconSize.sm }}
        />
        <VStack frame={{ maxWidth: 'infinity' }}>
          <InputField
            value={inputValue}
            placeholder={placeholder}
            onChanged={setInputValue}
            submitLabel="search"
          />
        </VStack>
        {inputValue.length > 0 && (
          <HStack onTapGesture={handleClear}>
            <Image
              systemName="xmark.circle.fill"
              foregroundStyle={iconColor}
              resizable
              aspectRatio={{ contentMode: 'fit' }}
              frame={{ width: iconSize.sm, height: iconSize.sm }}
            />
          </HStack>
        )}
      </HStack>
    </VStack>
  )
}
