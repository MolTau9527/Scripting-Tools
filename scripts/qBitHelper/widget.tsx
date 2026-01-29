import { VStack, HStack, Text, Widget, Button, Image, Spacer } from "scripting";
import { Display, ConfigData, DEFAULT_REFRESH_MINUTES, updateHistory, getCachedClientData, setCachedClientData, getConfig, getMultiClientConfig, getCacheKey } from './utils/public';
import { fetchData } from './utils/api';
import { SwitchClientIntent } from './app_intents';
import { ClientType, ClientConfig, MultiClientConfig, ClientData } from './utils/public/types';

const getIconPath = (type: ClientType) => `${FileManager.documentsDirectory}/qbit_${type}_icon.png`;

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
      if (config?.visible !== false && config?.url && config?.username && config?.password) {
        const baseName = type === 'qb' ? 'qBittorrent' : 'Transmission';
        clients.push({ type, index, config, displayName: config.alias || `${baseName} ${index + 1}` });
      }
    });
  });

  return clients;
}

async function prefetchClientData(client: VisibleClient, config: ConfigData) {
  // 始终预取数据，确保切换时有最新缓存可用
  try {
    const data = await fetchData({
      ...config,
      url: client.config.url,
      username: client.config.username,
      password: client.config.password,
      clientType: client.type
    });
    if (data) setCachedClientData(client.type, client.index, data);
  } catch (e) {
    // 忽略预取错误
  }
}

function ClientIcon({ type, size = 20, active = false }: { type: ClientType; size?: number; active?: boolean }) {
  const path = getIconPath(type);
  const opacity = active ? 1 : 0.4;
  
  if (FileManager.existsSync(path)) {
    return (
      <Image
        filePath={path}
        frame={{ width: size, height: size }}
        clipShape={{ type: 'rect', cornerRadius: size * 0.2 }}
        resizable
        opacity={opacity}
      />
    );
  }
  
  return (
    <Image
      systemName={type === 'qb' ? 'q.circle.fill' : 't.circle.fill'}
      font={size - 4}
      foregroundStyle={active ? "label" : "secondaryLabel"}
      opacity={opacity}
    />
  );
}

function SwitchButtons({ visibleClients, currentClient }: { visibleClients: VisibleClient[]; currentClient: VisibleClient }) {
  return (
    <HStack spacing={8} alignment="center">
      {visibleClients.map((client) => {
        const isActive = client.type === currentClient.type && client.index === currentClient.index;

        if (isActive) {
          return (
            <VStack key={`${client.type}-${client.index}`} spacing={2} alignment="center">
              <ClientIcon type={client.type} size={24} active />
              <VStack frame={{ width: 4, height: 4 }} background="label" clipShape={{ type: 'rect', cornerRadius: 2 }} />
            </VStack>
          );
        }

        return (
          <Button
            key={`${client.type}-${client.index}`}
            buttonStyle="plain"
            intent={SwitchClientIntent({ clientType: client.type, clientIndex: client.index })}
          >
            <VStack spacing={2} alignment="center">
              <ClientIcon type={client.type} size={24} />
              <VStack frame={{ width: 4, height: 4 }} opacity={0} />
            </VStack>
          </Button>
        );
      })}
    </HStack>
  );
}

function ErrorWidget({ message, visibleClients, currentClient }: { message: string; visibleClients: VisibleClient[]; currentClient?: VisibleClient }) {
  return (
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
      <Spacer />
      <Text>{message}</Text>
      <Spacer />
      {visibleClients.length > 1 && currentClient ? <SwitchButtons visibleClients={visibleClients} currentClient={currentClient} /> : null}
    </VStack>
  );
}

async function fetchCurrentClientData(client: VisibleClient, config: ConfigData): Promise<ClientData | null> {
  // 先检查是否有缓存
  const cached = getCachedClientData(client.type, client.index);

  // 尝试获取最新数据
  try {
    const freshData = await fetchData({
      ...config,
      url: client.config.url,
      username: client.config.username,
      password: client.config.password,
      clientType: client.type
    });

    if (freshData) {
      setCachedClientData(client.type, client.index, freshData);
      return freshData;
    }
  } catch (e) {
    console.log('获取数据失败，尝试使用缓存');
  }

  // 请求失败或无数据时，使用缓存作为降级方案
  if (cached) {
    console.log('使用缓存数据');
    return cached;
  }

  return null;
}

async function main() {
  const config = getConfig();
  const multiConfig = getMultiClientConfig();
  const visibleClients = getVisibleClients(multiConfig);

  if (visibleClients.length === 0) {
    Widget.present(<ErrorWidget message="请先在应用中配置客户端" visibleClients={[]} />);
    return;
  }

  // 找到当前激活的客户端
  const activeType = config?.clientType || 'qb';
  const activeIndex = config?.clientIndex ?? 0;
  const currentClient = visibleClients.find(c => c.type === activeType && c.index === activeIndex) || visibleClients[0];
  const baseConfig: ConfigData = config ?? {
    url: '',
    username: '',
    password: '',
    refreshMinutes: DEFAULT_REFRESH_MINUTES,
    clientType: currentClient.type,
    clientIndex: currentClient.index
  };

  // 获取当前客户端数据
  const data = await fetchCurrentClientData(currentClient, baseConfig);

  // 预取其他客户端数据
  if (config) {
    visibleClients.forEach(client => {
      if (client !== currentClient) {
        prefetchClientData(client, config);
      }
    });
  }

  if (!data) {
    Widget.present(<ErrorWidget message="获取数据失败" visibleClients={visibleClients} currentClient={currentClient} />);
    return;
  }

  const history = updateHistory(data, getCacheKey(currentClient.type, currentClient.index));
  const refreshMinutes = config?.refreshMinutes ?? DEFAULT_REFRESH_MINUTES;
  const size: 'small' | 'medium' | 'large' =
    Widget.family === 'systemLarge' ? 'large' :
    Widget.family === 'systemMedium' ? 'medium' : 'small';

  Widget.present(
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={size === 'small' ? 12 : 16} alignment="center">
      {size === 'small' ? <Spacer /> : null}
      <Display data={data} history={history} size={size} clientType={currentClient.type} />
      <Spacer />
      {visibleClients.length > 1 ? <SwitchButtons visibleClients={visibleClients} currentClient={currentClient} /> : null}
    </VStack>,
    refreshMinutes > 0
      ? { policy: "after", date: new Date(Date.now() + 1000 * 60 * refreshMinutes) }
      : undefined
  );
}

main();
