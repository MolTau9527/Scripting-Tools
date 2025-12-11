/**
 * 搜索栏组件
 * 包含搜索输入框和排序按钮
 */

import { Button, HStack, Image, Spacer, Text, TextField, VStack, gradient } from 'scripting'
import type { SortType } from '../types'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  sortType: SortType
  onSortChange: (type: SortType) => void
  onSubmit: () => void
  onMyProfile: () => void
}

/**
 * 搜索栏组件
 */
export const SearchBar = ({
  searchTerm,
  onSearchChange,
  sortType,
  onSortChange,
  onSubmit,
  onMyProfile
}: SearchBarProps) => {
  return (
    <VStack spacing={12} padding={{ leading: 16, trailing: 16, top: 12, bottom: 12 }}>
      {/* 搜索输入框 */}
      <HStack
        padding={{ leading: 12, trailing: 12, top: 10, bottom: 10 }}
        background="#f3f4f6"
        clipShape={{ type: 'rect', cornerRadius: 10 }}
        alignment="center"
        spacing={8}
      >
        <Image
          systemName="magnifyingglass"
          foregroundStyle="#9ca3af"
          frame={{ width: 16, height: 16 }}
        />
        <TextField
          title=""
          value={searchTerm}
          prompt="搜索插件..."
          onChanged={onSearchChange}
          frame={{ maxWidth: 'infinity' }}
        />
      </HStack>

      {/* 排序按钮和发布按钮 */}
      <HStack spacing={8}>
        <Button action={() => onSortChange('time')}>
          <HStack
            padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }}
            background={sortType === 'time' ? '#007aff' : '#f3f4f6'}
            clipShape={{ type: 'rect', cornerRadius: 16 }}
            alignment="center"
            spacing={4}
          >
            <Image
              systemName="clock"
              foregroundStyle={sortType === 'time' ? '#ffffff' : '#6b7280'}
              frame={{ width: 14, height: 14 }}
            />
            <Text
              font={14}
              foregroundStyle={sortType === 'time' ? '#ffffff' : '#6b7280'}
            >
              最新
            </Text>
          </HStack>
        </Button>

        <Button action={() => onSortChange('popular')}>
          <HStack
            padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }}
            background={sortType === 'popular'
              ? gradient('linear', {
                  colors: ['#ff6b35', '#f7931e', '#ffcc02'],
                  startPoint: 'leading',
                  endPoint: 'trailing'
                })
              : '#f3f4f6'
            }
            clipShape={{ type: 'rect', cornerRadius: 16 }}
            alignment="center"
            spacing={4}
          >
            <Image
              systemName="flame.fill"
              foregroundStyle={sortType === 'popular' ? '#ffffff' : '#6b7280'}
              frame={{ width: 14, height: 14 }}
            />
            <Text
              font={14}
              foregroundStyle={sortType === 'popular' ? '#ffffff' : '#6b7280'}
            >
              热门
            </Text>
          </HStack>
        </Button>

        <Spacer />

        {/* 发布按钮 */}
        <Button action={onSubmit}>
          <HStack
            padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }}
            background="#10b981"
            clipShape={{ type: 'rect', cornerRadius: 16 }}
            alignment="center"
            spacing={4}
          >
            <Image
              systemName="plus"
              foregroundStyle="#ffffff"
              frame={{ width: 14, height: 14 }}
            />
            <Text
              font={14}
              fontWeight="medium"
              foregroundStyle="#ffffff"
            >
              发布
            </Text>
          </HStack>
        </Button>

        {/* 我的按钮 */}
        <Button action={onMyProfile}>
          <HStack
            padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }}
            background="#6b7280"
            clipShape={{ type: 'rect', cornerRadius: 16 }}
            alignment="center"
            spacing={4}
          >
            <Image
              systemName="person.fill"
              foregroundStyle="#ffffff"
              frame={{ width: 14, height: 14 }}
            />
            <Text
              font={14}
              fontWeight="medium"
              foregroundStyle="#ffffff"
            >
              我的
            </Text>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  )
}
