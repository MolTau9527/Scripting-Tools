import { useMemo } from 'scripting'
import type { Plugin } from '../types'
import {
  buildPluginQueryIndex,
  queryPluginIndex,
  type PluginQueryOptions,
} from '../utils/plugin'

export const usePluginQuery = (
  plugins: Plugin[],
  options: PluginQueryOptions = {},
): Plugin[] => {
  const index = useMemo(() => buildPluginQueryIndex(plugins), [plugins])

  return useMemo(
    () => queryPluginIndex(index, options),
    [index, options.searchTerm, options.sortType],
  )
}
