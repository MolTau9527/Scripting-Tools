import { VStack, HStack, Text, Widget, Button, Image, Spacer } from "scripting";
import { Display, ConfigData, STORAGE_KEY, DEFAULT_REFRESH_MINUTES, updateHistory } from './utils/public';
import { fetchData } from './utils/api';
import { SwitchClientIntent } from './app_intents';

const QB_CONFIG_KEY = 'qbClientConfig';
const TR_CONFIG_KEY = 'trClientConfig';

async function main() {
  const config = Storage.get<ConfigData>(STORAGE_KEY);
  const qbConfig = Storage.get<{ url: string; username: string; password: string }>(QB_CONFIG_KEY);
  const trConfig = Storage.get<{ url: string; username: string; password: string }>(TR_CONFIG_KEY);
  
  const hasQb = !!(qbConfig?.url && qbConfig?.username && qbConfig?.password);
  const hasTr = !!(trConfig?.url && trConfig?.username && trConfig?.password);

  if (!hasQb && !hasTr) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Text>请先在应用中配置</Text>
      </VStack>
    );
    return;
  }

  const clientType = config?.clientType || 'qb';
  const hasCurrentConfig = clientType === 'qb' ? hasQb : hasTr;
  
  const clients: Array<{ type: 'qb' | 'tr'; icon: string }> = [
    { type: 'qb', icon: 'q.circle.fill' },
    { type: 'tr', icon: 't.circle.fill' }
  ];

  const SwitchButtons = () => (
    <HStack
      spacing={16}
      animation={{ animation: Animation.default(), value: clientType }}
    >
      {clients.map(c => (
        <Button key={c.type} buttonStyle="plain" intent={SwitchClientIntent(c.type)}>
          <Image
            systemName={c.icon}
            font={16}
            foregroundStyle={c.type === clientType ? "accentColor" : "secondaryLabel"}
          />
        </Button>
      ))}
    </HStack>
  );

  if (!hasCurrentConfig) {
    const clientName = clientType === 'qb' ? 'qBittorrent' : 'Transmission';
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Spacer />
        <Text>请填写 {clientName} 信息</Text>
        <Spacer />
        <SwitchButtons />
      </VStack>
    );
    return;
  }

  const data = await fetchData(config!);

  if (!data) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Spacer />
        <Text>获取数据失败</Text>
        <Spacer />
        <SwitchButtons />
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
      <Display data={data} history={history} size={size} clientType={clientType} />
      <Spacer />
      <SwitchButtons />
    </VStack>,
    refreshMinutes > 0
      ? {
          policy: "after",
          date: new Date(Date.now() + 1000 * 60 * refreshMinutes)
        }
      : undefined
  );
}

main();