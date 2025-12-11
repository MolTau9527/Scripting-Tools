/**
 * 插件详情组件
 * 显示插件的完整信息，包括详细描述和安装按钮
 */

import { Button, HStack, Image, Navigation, ScrollView, Spacer, Text, VStack } from 'scripting'
import type { Plugin } from '../types'

interface PluginDetailProps {
  plugin: Plugin
  onInstall: (plugin: Plugin) => void
}

/**
 * 解析作者信息，提取所有作者和链接
 */
function parseAuthors(author: string): { names: string[]; link: string | null } {
  const authorRegex = /^(.*?)\s*\((https?:\/\/.*)\)$/
  const match = author.match(authorRegex)

  if (match) {
    return {
      names: match[1].split(/,\s*/),
      link: match[2]
    }
  }

  return {
    names: author.split(/,\s*/),
    link: null
  }
}

/**
 * 插件详情组件
 */
export const PluginDetail = ({ plugin, onInstall }: PluginDetailProps) => {
  const dismiss = Navigation.useDismiss()
  const isBase64Icon = plugin.icon?.startsWith('data:image/')
  const { names: authorNames } = parseAuthors(plugin.author || '脚本作者')

  return (
    <VStack frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }} background="#f9fafb">
      {/* 顶部栏 */}
      <HStack
        padding={16}
        background="#ffffff"
        alignment="center"
      >
        <Button action={() => dismiss()}>
          <Image
            systemName="xmark"
            foregroundStyle="#6b7280"
            frame={{ width: 20, height: 20 }}
          />
        </Button>
        <Spacer />
        <Text font={17} fontWeight="semibold">插件详情</Text>
        <Spacer />
        <VStack frame={{ width: 20 }} />
      </HStack>

      <ScrollView>
        <VStack padding={16} spacing={16}>
          {/* 插件头部信息 */}
          <VStack
            padding={20}
            background="#ffffff"
            clipShape={{ type: 'rect', cornerRadius: 16 }}
            spacing={12}
          >
            {/* 图标 */}
            {isBase64Icon ? (
              <Image
                imageUrl={plugin.icon}
                resizable
                frame={{ width: 80, height: 80 }}
                clipShape={{ type: 'rect', cornerRadius: 16 }}
              />
            ) : (
              <VStack
                frame={{ width: 80, height: 80 }}
                background="#f3f4f6"
                clipShape={{ type: 'rect', cornerRadius: 16 }}
              >
                <Text font={40}>{plugin.icon || '📦'}</Text>
              </VStack>
            )}

            {/* 名称 */}
            <Text font={22} fontWeight="bold">{plugin.name}</Text>

            {/* 作者 */}
            <HStack spacing={8} alignment="center">
              {authorNames.map((authorName, index) => (
                <Text
                  key={index}
                  font={14}
                  foregroundStyle="#6b7280"
                  padding={{ leading: 10, trailing: 10, top: 4, bottom: 4 }}
                  background="#f3f4f6"
                  clipShape={{ type: 'rect', cornerRadius: 12 }}
                >
                  {authorName}
                </Text>
              ))}
            </HStack>

            {/* 更新时间 */}
            <Text
              font={13}
              foregroundStyle="#9ca3af"
            >
              {`更新于 ${plugin.updateTime || '未知'}`}
            </Text>

            {/* 安装按钮 */}
            <Button action={() => onInstall(plugin)}>
              <HStack
                padding={{ leading: 32, trailing: 32, top: 12, bottom: 12 }}
                background="#007aff"
                clipShape={{ type: 'rect', cornerRadius: 20 }}
                alignment="center"
                spacing={8}
              >
                <Image
                  systemName="arrow.down.circle.fill"
                  foregroundStyle="#ffffff"
                  frame={{ width: 18, height: 18 }}
                />
                <Text
                  font={16}
                  fontWeight="semibold"
                  foregroundStyle="#ffffff"
                >
                  安装插件
                </Text>
              </HStack>
            </Button>
          </VStack>

          {/* 描述区域 */}
          <VStack
            padding={16}
            background="#ffffff"
            clipShape={{ type: 'rect', cornerRadius: 16 }}
            alignment="leading"
            spacing={12}
          >
            <Text font={16} fontWeight="semibold">描述</Text>
            <Text
              font={15}
              foregroundStyle="#4b5563"
            >
              {plugin.description || '暂无描述'}
            </Text>
          </VStack>

          {/* 信息区域 */}
          <VStack
            padding={16}
            background="#ffffff"
            clipShape={{ type: 'rect', cornerRadius: 16 }}
            alignment="leading"
            spacing={12}
          >
            <Text font={16} fontWeight="semibold">信息</Text>

            {/* ID */}
            <HStack frame={{ maxWidth: 'infinity' }}>
              <Text
                font={14}
                foregroundStyle="#6b7280"
              >
                ID
              </Text>
              <Spacer />
              <Text font={14}>{String(plugin.id)}</Text>
            </HStack>

            {/* 安装量 */}
            {plugin.installCount !== undefined && (
              <HStack frame={{ maxWidth: 'infinity' }}>
                <Text
                  font={14}
                  foregroundStyle="#6b7280"
                >
                  安装量
                </Text>
                <Spacer />
                <Text font={14}>{String(plugin.installCount)}</Text>
              </HStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  )
}
