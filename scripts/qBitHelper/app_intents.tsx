import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"
import { STORAGE_KEY } from './utils/public/storage'
import { ConfigData } from './pages/SettingsPage'

const QB_CONFIG_KEY = 'qbClientConfig';
const TR_CONFIG_KEY = 'trClientConfig';

export const SwitchClientIntent = AppIntentManager.register({
  name: "SwitchClientIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (clientType: 'qb' | 'tr') => {
    const key = clientType === 'qb' ? QB_CONFIG_KEY : TR_CONFIG_KEY;
    const clientConfig = Storage.get<{ url: string; username: string; password: string }>(key);
    
    if (clientConfig) {
      const currentConfig = Storage.get<ConfigData>(STORAGE_KEY);
      Storage.set<ConfigData>(STORAGE_KEY, {
        ...clientConfig,
        refreshMinutes: currentConfig?.refreshMinutes ?? 0.5,
        clientType
      });
    }
    
    Widget.reloadAll();
  }
})