/**
 * Scripting Store - 插件中心
 *
 * 从 gallery.scripting.fun 获取插件列表
 * 支持浏览、搜索、查看详情和一键安装
 */

import { Navigation, Script } from 'scripting'
import { StoreScreen } from './screens/StoreScreen'

/**
 * 入口函数
 */
const run = async () => {
  await Navigation.present({
    element: <StoreScreen />,
    modalPresentationStyle: 'fullScreen'
  })
  Script.exit()
}

run()