import { Navigation, Script } from 'scripting'
import { StoreScreen } from './screens/StoreScreen'

const run = async () => {
  // 根页面任何关闭路径都结束脚本；禁用下滑最小化，避免残留在后台运行列表。
  Script.enableMinimize(false)
  try {
    await Navigation.present({
      element: <StoreScreen />,
      modalPresentationStyle: 'fullScreen',
    })
  } finally {
    Script.exit()
  }
}

void run()
