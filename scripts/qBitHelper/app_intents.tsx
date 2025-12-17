import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"
import { STORAGE_KEY } from './utils/public/storage'
import { ConfigData } from './pages/SettingsPage'
import { ClientType } from './utils/public/types'

export const SwitchClientIntent = AppIntentManager.register({
  name: "SwitchClientIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (intent: { clientType: ClientType; clientIndex: number }) => {
    const { clientType, clientIndex } = intent;
    const currentConfig = Storage.get<ConfigData>(STORAGE_KEY);
    
    // 保存新配置
    Storage.set<ConfigData>(STORAGE_KEY, {
      ...currentConfig,
      url: currentConfig?.url || '',
      username: currentConfig?.username || '',
      password: currentConfig?.password || '',
      refreshMinutes: currentConfig?.refreshMinutes ?? 0.5,
      clientType,
      clientIndex
    });
    
    // 返回成功标识，AppIntent 会自动触发小组件刷新
    return {
      success: true,
      clientType,
      clientIndex
    };
  }
})