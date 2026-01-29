import { AppIntentManager, AppIntentProtocol } from "scripting"
import { DEFAULT_REFRESH_MINUTES, getConfig, setConfig, getMultiClientConfig, setMultiClientConfig } from './utils/public/storage'
import { ClientType } from './utils/public/types'

export const SwitchClientIntent = AppIntentManager.register({
  name: "SwitchClientIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (intent: { clientType: ClientType; clientIndex: number }) => {
    const { clientType, clientIndex } = intent;
    const currentConfig = getConfig();

    // 保存新配置
    setConfig({
      ...currentConfig,
      url: currentConfig?.url || '',
      username: currentConfig?.username || '',
      password: currentConfig?.password || '',
      refreshMinutes: currentConfig?.refreshMinutes ?? DEFAULT_REFRESH_MINUTES,
      clientType,
      clientIndex
    });
    const multiConfig = getMultiClientConfig();
    setMultiClientConfig({
      ...multiConfig,
      activeClient: { type: clientType, index: clientIndex }
    });

    // 返回成功标识，AppIntent 会自动触发小组件刷新
    return {
      success: true,
      clientType,
      clientIndex
    };
  }
})
