import { Button, HStack, Image, Spacer, Text, TextField, VStack, gradient, useCallback, useState } from 'scripting'
import type { SortType } from '../types'
import { type ThemeMode, getThemeColors } from '../utils/theme'

interface SearchBarProps {
  onSearchSubmit: (term: string) => void
  sortType: SortType
  onSortChange: (type: SortType) => void
  onSubmit: () => void
  onMyProfile: () => void
  themeMode: ThemeMode
}

export const SearchBar = ({ onSearchSubmit, sortType, onSortChange, onSubmit, onMyProfile, themeMode }: SearchBarProps) => {
  const colors = getThemeColors(themeMode)
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  const handleSubmit = useCallback(() => {
    onSearchSubmit(localSearchTerm)
  }, [localSearchTerm, onSearchSubmit])

  return (
    <VStack spacing={12} padding={{ leading: 16, trailing: 16, top: 12, bottom: 12 }}>
      <HStack padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }} background={colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 10 }} alignment="center" spacing={8} onSubmit={handleSubmit} submitScope>
        <Image systemName="magnifyingglass" foregroundStyle={colors.textTertiary} frame={{ width: 16, height: 16 }} />
        <TextField 
          title="" 
          value={localSearchTerm} 
          prompt="搜索插件..." 
          onChanged={setLocalSearchTerm} 
          frame={{ maxWidth: 'infinity' }} 
          submitLabel="search"
        />
        <Button action={handleSubmit}>
          <HStack padding={{ leading: 8, trailing: 8, top: 6, bottom: 6 }} background={colors.buttonPrimary} clipShape={{ type: 'rect', cornerRadius: 8 }} alignment="center">
            <Text font={14} fontWeight="medium" foregroundStyle="#ffffff">搜索</Text>
          </HStack>
        </Button>
      </HStack>

      <HStack spacing={8}>
        <Button action={() => onSortChange('time')}>
          <HStack padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }} background={sortType === 'time' ? colors.buttonPrimary : colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="center" spacing={4}>
            <Image systemName="clock" foregroundStyle={sortType === 'time' ? '#ffffff' : colors.textSecondary} frame={{ width: 14, height: 14 }} />
            <Text font={14} foregroundStyle={sortType === 'time' ? '#ffffff' : colors.textSecondary}>最新</Text>
          </HStack>
        </Button>

        <Button action={() => onSortChange('popular')}>
          <HStack padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }} background={sortType === 'popular' ? gradient('linear', { colors: ['#ff6b35', '#f7931e', '#ffcc02'], startPoint: 'leading', endPoint: 'trailing' }) : colors.inputBackground} clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="center" spacing={4}>
            <Image systemName="flame.fill" foregroundStyle={sortType === 'popular' ? '#ffffff' : colors.textSecondary} frame={{ width: 14, height: 14 }} />
            <Text font={14} foregroundStyle={sortType === 'popular' ? '#ffffff' : colors.textSecondary}>热门</Text>
          </HStack>
        </Button>

        <Spacer />

        <Button action={onSubmit}>
          <HStack padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }} background={colors.buttonSuccess} clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="center" spacing={4}>
            <Image systemName="plus" foregroundStyle="#ffffff" frame={{ width: 14, height: 14 }} />
            <Text font={14} fontWeight="medium" foregroundStyle="#ffffff">发布</Text>
          </HStack>
        </Button>

        <Button action={onMyProfile}>
          <HStack padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }} background={colors.buttonGray} clipShape={{ type: 'rect', cornerRadius: 16 }} alignment="center" spacing={4}>
            <Image systemName="person.fill" foregroundStyle="#ffffff" frame={{ width: 14, height: 14 }} />
            <Text font={14} fontWeight="medium" foregroundStyle="#ffffff">我的</Text>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  )
}