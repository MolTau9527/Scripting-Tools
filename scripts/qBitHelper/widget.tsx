import { VStack, HStack, Text, Widget, Button, Image, Spacer } from "scripting";
import { Display, ConfigData, STORAGE_KEY, DEFAULT_REFRESH_MINUTES, updateHistory } from './utils/public';
import { fetchData } from './utils/api';
import { SwitchClientIntent } from './app_intents';
import { ClientType, ClientConfig, MultiClientConfig } from './utils/public/types';

const MULTI_CLIENT_KEY = 'multiClientConfig';

const CLIENT_ICON_URLS = {
  qb: 'https://avatars.githubusercontent.com/u/2131270',
  tr: 'https://avatars.githubusercontent.com/u/223312'
};

const getIconPath = (type: ClientType) => `${FileManager.documentsDirectory}/qbit_${type}_icon.png`;

const ensureIcons = async () => {
  for (const type of ['qb', 'tr'] as ClientType[]) {
    const path = getIconPath(type);
    if (!FileManager.existsSync(path)) {
      try {
        const img = await UIImage.fromURL(CLIENT_ICON_URLS[type]);
        if (img) {
          const data = Data.fromPNG(img);
          if (data) FileManager.writeAsDataSync(path, data);
        }
      } catch (e) {}
    }
  }
};

interface VisibleClient {
  type: ClientType;
  index: number;
  config: ClientConfig;
  displayName: string;
}

function getVisibleClients(multiConfig: MultiClientConfig | null): VisibleClient[] {
  if (!multiConfig) return [];
  const clients: VisibleClient[] = [];

  (['qb', 'tr'] as ClientType[]).forEach(type => {
    const configs = multiConfig[type] || [];
    configs.forEach((config, index) => {
      if (config && config.visible !== false && config.url && config.username && config.password) {
        const baseName = type === 'qb' ? 'qBittorrent' : 'Transmission';
        clients.push({
          type,
          index,
          config,
          displayName: config.alias || `${baseName} ${index + 1}`
        });
      }
    });
  });

  return clients;
}

async function main() {
  await ensureIcons();

  const config = Storage.get<ConfigData>(STORAGE_KEY);
  const multiConfig = Storage.get<MultiClientConfig>(MULTI_CLIENT_KEY);
  const visibleClients = getVisibleClients(multiConfig);

  if (visibleClients.length === 0) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Text>请先在应用中配置客户端</Text>
      </VStack>
    );
    return;
  }

  const activeType = config?.clientType || 'qb';
  const activeIndex = config?.clientIndex ?? 0;

  // 找到当前激活的客户端，如果不存在则使用第一个可见客户端
  let currentClient = visibleClients.find(c => c.type === activeType && c.index === activeIndex);
  if (!currentClient) {
    currentClient = visibleClients[0];
  }

  const currentIdx = visibleClients.findIndex(c => c.type === currentClient!.type && c.index === currentClient!.index);
  const prevClient = visibleClients[(currentIdx - 1 + visibleClients.length) % visibleClients.length];
  const nextClient = visibleClients[(currentIdx + 1) % visibleClients.length];

  const ClientIcon = ({ type }: { type: ClientType }) => {
    const path = getIconPath(type);
    if (FileManager.existsSync(path)) {
      return <Image filePath={path} frame={{ width: 20, height: 20 }} clipShape={{ type: 'rect', cornerRadius: 4 }} resizable />;
    }
    return <Image systemName={type === 'qb' ? 'q.circle.fill' : 't.circle.fill'} font={16} foregroundStyle="secondaryLabel" />;
  };

  const SwitchButtons = () => (
    <HStack spacing={12} alignment="center">
      <Button buttonStyle="plain" intent={SwitchClientIntent({ clientType: prevClient.type, clientIndex: prevClient.index })}>
        <Image systemName="chevron.left" font={12} foregroundStyle="secondaryLabel" />
      </Button>
      <HStack spacing={6} alignment="center">
        <ClientIcon type={currentClient!.type} />
        <Text font={11} foregroundStyle="secondaryLabel">
          {currentClient!.displayName.length > 8 ? currentClient!.displayName.slice(0, 8) + '..' : currentClient!.displayName}
        </Text>
      </HStack>
      <Button buttonStyle="plain" intent={SwitchClientIntent({ clientType: nextClient.type, clientIndex: nextClient.index })}>
        <Image systemName="chevron.right" font={12} foregroundStyle="secondaryLabel" />
      </Button>
    </HStack>
  );

  const data = await fetchData({
    ...config!,
    url: currentClient.config.url,
    username: currentClient.config.username,
    password: currentClient.config.password,
    clientType: currentClient.type
  });

  if (!data) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Spacer />
        <Text>获取数据失败</Text>
        <Spacer />
        {visibleClients.length > 1 ? <SwitchButtons /> : null}
      </VStack>
    );
    return;
  }

  const history = updateHistory(data);
  const refreshMinutes = config?.refreshMinutes ?? DEFAULT_REFRESH_MINUTES;
  const size: 'small' | 'medium' | 'large' = Widget.family === 'systemLarge' ? 'large' : Widget.family === 'systemMedium' ? 'medium' : 'small';

  Widget.present(
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={size === 'small' ? 12 : 16} alignment="center">
      {size === 'small' ? <Spacer /> : null}
      <Display data={data} history={history} size={size} clientType={currentClient.type} />
      <Spacer />
      {visibleClients.length > 1 ? <SwitchButtons /> : null}
    </VStack>,
    refreshMinutes > 0
      ? { policy: "after", date: new Date(Date.now() + 1000 * 60 * refreshMinutes) }
      : undefined
  );
}

main();
