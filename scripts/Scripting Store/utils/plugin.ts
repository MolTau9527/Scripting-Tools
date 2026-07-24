import type { Plugin, SortType } from '../types'

export const getPluginKey = (plugin: Plugin): string => {
  return plugin.id ? String(plugin.id) : `fallback-${plugin.name}-${plugin.url}`
}

export const arePluginsEqual = (current: Plugin[], next: Plugin[]): boolean => {
  if (current.length !== next.length) return false

  return current.every((plugin, index) => {
    const candidate = next[index]
    return plugin.id === candidate.id &&
      plugin.name === candidate.name &&
      plugin.description === candidate.description &&
      plugin.icon === candidate.icon &&
      plugin.symbol === candidate.symbol &&
      plugin.author === candidate.author &&
      plugin.url === candidate.url &&
      plugin.updateTime === candidate.updateTime &&
      plugin.installCount === candidate.installCount
  })
}

export interface PluginQueryOptions {
  searchTerm?: string
  sortType?: SortType
}

interface IndexedPlugin {
  plugin: Plugin
  searchText: string
  updateTimestamp: number
}

interface PluginQueryIndex {
  time: IndexedPlugin[]
  popular: IndexedPlugin[]
}

const parseUpdateTime = (value: string): number => {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export const buildPluginQueryIndex = (plugins: Plugin[]): PluginQueryIndex => {
  const indexed = plugins.map(plugin => ({
    plugin,
    searchText: `${plugin.name}\0${plugin.description}\0${plugin.author}`.toLowerCase(),
    updateTimestamp: parseUpdateTime(plugin.updateTime),
  }))

  return {
    time: [...indexed].sort((a, b) => b.updateTimestamp - a.updateTimestamp),
    popular: [...indexed].sort((a, b) => {
      const installDifference = (b.plugin.installCount || 0) - (a.plugin.installCount || 0)
      return installDifference || b.updateTimestamp - a.updateTimestamp
    }),
  }
}

export const queryPluginIndex = (
  index: PluginQueryIndex,
  options: PluginQueryOptions = {},
): Plugin[] => {
  const source = index[options.sortType || 'time']
  const term = options.searchTerm?.trim().toLowerCase()
  return (term ? source.filter(item => item.searchText.includes(term)) : source)
    .map(item => item.plugin)
}
