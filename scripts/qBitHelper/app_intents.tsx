import { AppIntentManager, AppIntentProtocol } from "scripting"
import { CLIENT_COUNT, setActiveClientIndex } from './utils/public/storage'
import { ClientType } from './utils/public/types'

export const SwitchClientIntent = AppIntentManager.register({
  name: "SwitchClientIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (intent: { clientType: ClientType; clientIndex: number }) => {
    const { clientType, clientIndex } = intent;

    // 入参校验：clientType 必须是 'qb' | 'tr'，clientIndex 必须在 [0, CLIENT_COUNT)
    if (clientType !== 'qb' && clientType !== 'tr') {
      return { success: false, reason: 'invalid clientType' };
    }
    if (!Number.isInteger(clientIndex) || clientIndex < 0 || clientIndex >= CLIENT_COUNT) {
      return { success: false, reason: 'invalid clientIndex' };
    }

    // 一次读一次写（对比旧版 4 读 2 写）
    setActiveClientIndex(clientType, clientIndex);

    // 返回成功标识，AppIntent 会自动触发小组件刷新
    return {
      success: true,
      clientType,
      clientIndex
    };
  }
})
