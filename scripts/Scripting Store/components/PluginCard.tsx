/**
 * 插件卡片组件
 * 显示单个插件的信息，包括图标、名称、描述、作者和安装按钮
 */

import { Button, HStack, Image, Text, VStack } from 'scripting'
import type { Plugin } from '../types'

interface PluginCardProps {
  plugin: Plugin
  onInstall: (plugin: Plugin) => void
  onDetail: (plugin: Plugin) => void
}

/**
 * 解析作者信息
 * 支持格式: "作者名" 或 "作者名 (链接)" 或 "作者1, 作者2"
 */
function parseAuthor(author: string): { name: string; others: number } {
  const authorRegex = /^(.*?)\s*\(https?:\/\/.*\)$/
  const match = author.match(authorRegex)

  let authorName = match ? match[1] : author
  const authors = authorName.split(/,\s*/)

  return {
    name: authors[0] || '未知作者',
    others: authors.length - 1
  }
}

/**
 * 插件卡片组件
 */
export const PluginCard = ({ plugin, onInstall, onDetail }: PluginCardProps) => {
  const { name, others } = parseAuthor(plugin.author || '脚本作者')
  const isBase64Icon = plugin.icon?.startsWith('data:image/')

  return (
    <VStack
      padding={16}
      background="#ffffff"
      clipShape={{ type: 'rect', cornerRadius: 12 }}
      frame={{ maxWidth: 'infinity' }}
      onTapGesture={() => onDetail(plugin)}
    >
      {/* 头部：图标和基本信息 */}
      <HStack alignment="center" spacing={12}>
        {/* 图标 */}
        {isBase64Icon ? (
          <Image
            imageUrl={plugin.icon}
            resizable
            frame={{ width: 48, height: 48 }}
            clipShape={{ type: 'rect', cornerRadius: 10 }}
          />
        ) : (
          <VStack
            frame={{ width: 48, height: 48 }}
            background="#f3f4f6"
            clipShape={{ type: 'rect', cornerRadius: 10 }}
          >
            <Text font={24}>{plugin.icon || '📦'}</Text>
          </VStack>
        )}

        {/* 名称和作者 */}
        <VStack alignment="leading" spacing={4} frame={{ maxWidth: 'infinity' }}>
          <Text
            font={16}
            fontWeight="semibold"
            lineLimit={1}
          >
            {plugin.name}
          </Text>
          <HStack spacing={4} alignment="center">
            <Text
              font={12}
              foregroundStyle="#6b7280"
            >
              {name}
            </Text>
            {others > 0 && (
              <Text
                font={10}
                foregroundStyle="#ffffff"
                padding={{ leading: 6, trailing: 6, top: 2, bottom: 2 }}
                background="#9ca3af"
                clipShape={{ type: 'rect', cornerRadius: 8 }}
              >
                {`+${others}`}
              </Text>
            )}
          </HStack>
        </VStack>

        {/* 安装按钮 */}
        <Button action={() => onInstall(plugin)}>
          <Text
            font={14}
            fontWeight="medium"
            foregroundStyle="#ffffff"
            padding={{ leading: 16, trailing: 16, top: 8, bottom: 8 }}
            background="#007aff"
            clipShape={{ type: 'rect', cornerRadius: 16 }}
          >
            安装
          </Text>
        </Button>
      </HStack>

      {/* 描述 */}
      <Text
        font={14}
        foregroundStyle="#4b5563"
        lineLimit={2}
        padding={{ top: 12 }}
      >
        {plugin.description || '暂无描述'}
      </Text>

      {/* 底部：更新时间 */}
      <HStack padding={{ top: 12 }}>
        <Text
          font={12}
          foregroundStyle="#9ca3af"
        >
          {`更新于 ${plugin.updateTime || '未知'}`}
        </Text>
      </HStack>
    </VStack>
  )
}
