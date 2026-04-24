import { VStack, HStack, Text, Widget, Button, Image, Spacer, Color, LinearGradient, RadialGradient, ZStack } from "scripting";
import { Display } from './utils/public/display';
import {
  DEFAULT_REFRESH_MINUTES,
  MAX_HISTORY_POINTS,
  CACHE_DURATION,
  getQbitHelperData,
  setQbitHelperData,
  getCacheKey,
  getIconPath,
} from './utils/public/storage';
import { Colors, Spacing, FontSize, WidgetMetrics, Neon, FontDesign } from './utils/public/theme';
import { fetchData } from './utils/api';
import { SwitchClientIntent } from './app_intents';
import { ClientType, ClientConfig, MultiClientConfig, ClientData, ConfigData } from './utils/public/types';

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

// Widget 运行时间有限，单请求超时保护（底层 fetch 无超时）
const WIDGET_FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race<T | null>([
    p.catch(() => null),
    new Promise<null>(resolve => setTimeout(() => resolve(null), ms)),
  ]);
}

async function prefetchClientData(client: VisibleClient, config: ConfigData): Promise<ClientData | null> {
  try {
    const data = await withTimeout(fetchData({
      ...config,
      url: client.config.url,
      username: client.config.username,
      password: client.config.password,
      clientType: client.type,
    }), WIDGET_FETCH_TIMEOUT_MS);
    return data ?? null;
  } catch (e) {
    return null;
  }
}

function ClientIcon({ type, size = WidgetMetrics.iconBar, active = false }: { type: ClientType; size?: number; active?: boolean }) {
  const path = getIconPath(type);
  const opacity = active ? 1 : 0.4;

  if (FileManager.existsSync(path)) {
    return (
      <Image
        filePath={path}
        frame={{ width: size, height: size }}
        clipShape={{ type: 'rect', cornerRadius: size * 0.22 }}
        resizable
        opacity={opacity}
      />
    );
  }

  return (
    <Image
      systemName={type === 'qb' ? 'q.circle.fill' : 't.circle.fill'}
      font={size - 4}
      foregroundStyle={active ? Neon.cyan : Neon.textDim}
      opacity={opacity}
      shadow={active ? { color: Neon.cyan, radius: WidgetMetrics.neonGlow.radius } : undefined}
    />
  );
}

function SwitchButtons({ visibleClients, currentClient, compact }: { visibleClients: VisibleClient[]; currentClient: VisibleClient; compact?: boolean }) {
  const iconSize = compact ? 18 : WidgetMetrics.iconBar;
  const dotSize = compact ? 3 : 4;
  const spacing = compact ? Spacing.xs + 2 : Spacing.sm;
  return (
    <HStack spacing={spacing} alignment="center">
      {visibleClients.map((client) => {
        const isActive = client.type === currentClient.type && client.index === currentClient.index;

        if (isActive) {
          return (
            <VStack key={`${client.type}-${client.index}`} spacing={2} alignment="center">
              <ClientIcon type={client.type} size={iconSize} active />
              <VStack
                frame={{ width: dotSize, height: dotSize }}
                background={Neon.cyan}
                clipShape={{ type: 'rect', cornerRadius: dotSize / 2 }}
              />
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
              <ClientIcon type={client.type} size={iconSize} />
              <VStack frame={{ width: dotSize, height: dotSize }} opacity={0} />
            </VStack>
          </Button>
        );
      })}
    </HStack>
  );
}

/** Widget 外层壳：始终深色霓虹渐变底 */
function WidgetShell({ children, size }: { children: any; size: 'small' | 'medium' | 'large' }) {
  const pad = WidgetMetrics.padding[size];
  const base: LinearGradient = {
    stops: [
      { color: '#0A0618' as Color, location: 0 },
      { color: '#160A2A' as Color, location: 0.55 },
      { color: '#080411' as Color, location: 1 },
    ],
    startPoint: 'topLeading',
    endPoint: 'bottomTrailing',
  };
  const glowCyan: RadialGradient = {
    stops: [
      { color: 'rgba(0,240,255,0.28)' as Color, location: 0 },
      { color: 'rgba(0,240,255,0.05)' as Color, location: 0.55 },
      { color: 'rgba(0,0,0,0)' as Color, location: 1 },
    ],
    center: 'topLeading',
    startRadius: 0,
    endRadius: 240,
  };
  const glowMagenta: RadialGradient = {
    stops: [
      { color: 'rgba(255,0,168,0.22)' as Color, location: 0 },
      { color: 'rgba(255,0,168,0.04)' as Color, location: 0.6 },
      { color: 'rgba(0,0,0,0)' as Color, location: 1 },
    ],
    center: 'bottomTrailing',
    startRadius: 0,
    endRadius: 260,
  };
  return (
    <ZStack frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background={base} />
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background={glowCyan} />
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background={glowMagenta} />
      <VStack
        frame={{ maxWidth: Infinity, maxHeight: Infinity }}
        padding={pad}
        alignment="center"
        spacing={size === 'small' ? 0 : Spacing.sm}
        fontDesign={FontDesign}
      >
        {children}
      </VStack>
    </ZStack>
  );
}

function ErrorWidget({ message, visibleClients, currentClient, size }: { message: string; visibleClients: VisibleClient[]; currentClient?: VisibleClient; size: 'small' | 'medium' | 'large' }) {
  return (
    <WidgetShell size={size}>
      <Spacer />
      <Image
        systemName="exclamationmark.triangle"
        font={FontSize.title + 4}
        foregroundStyle={Colors.warning}
        shadow={{ color: Colors.warning, radius: WidgetMetrics.neonGlow.radius }}
      />
      <Text font={FontSize.footnote} foregroundStyle={Neon.textDim} multilineTextAlignment="center">{message}</Text>
      <Spacer />
      {visibleClients.length > 1 && currentClient ? (
        <SwitchButtons visibleClients={visibleClients} currentClient={currentClient} compact={size === 'small'} />
      ) : null}
    </WidgetShell>
  );
}

function WidgetBody({ data, history, clientType, size, visibleClients, currentClient }: {
  data: ClientData;
  history: any[];
  clientType: ClientType;
  size: 'small' | 'medium' | 'large';
  visibleClients: VisibleClient[];
  currentClient: VisibleClient;
}) {
  return (
    <WidgetShell size={size}>
      <Display data={data} history={history} size={size} clientType={clientType} />
      {visibleClients.length > 1 ? (
        <>
          <Spacer />
          <SwitchButtons visibleClients={visibleClients} currentClient={currentClient} compact={size === 'small'} />
        </>
      ) : null}
    </WidgetShell>
  );
}

async function fetchCurrentClientData(client: VisibleClient, config: ConfigData): Promise<ClientData | null> {
  try {
    const freshData = await withTimeout(fetchData({
      ...config,
      url: client.config.url,
      username: client.config.username,
      password: client.config.password,
      clientType: client.type,
    }), WIDGET_FETCH_TIMEOUT_MS);
    return freshData ?? null;
  } catch (e) {
    console.log('[widget] fetchCurrentClientData error:', e);
    return null;
  }
}

function resolveSize(): 'small' | 'medium' | 'large' {
  return Widget.family === 'systemLarge' ? 'large' :
    Widget.family === 'systemMedium' ? 'medium' : 'small';
}

async function main() {
  const size = resolveSize();

  try {
    // 一次性加载整包快照，减少重复 I/O
    const snapshot = getQbitHelperData();
    const config = snapshot.config;
    const visibleClients = getVisibleClients(snapshot.multiClient);

    if (visibleClients.length === 0) {
      Widget.present(<ErrorWidget message="请先在应用中配置客户端" visibleClients={[]} size={size} />);
      return;
    }

    const activeType = config?.clientType || 'qb';
    const activeIndex = config?.clientIndex ?? 0;
    const currentClient = visibleClients.find(c => c.type === activeType && c.index === activeIndex) || visibleClients[0];
    const baseConfig: ConfigData = config ?? {
      url: '',
      username: '',
      password: '',
      refreshMinutes: DEFAULT_REFRESH_MINUTES,
      clientType: currentClient.type,
      clientIndex: currentClient.index,
    };

    // 当前客户端 + 其它客户端预取，统一 await，避免 Widget.present 后的 fire-and-forget 写盘竞态
    const others = config ? visibleClients.filter(c => c !== currentClient) : [];
    const [currentResult, ...prefetchResults] = await Promise.all([
      fetchCurrentClientData(currentClient, baseConfig),
      ...others.map(c => prefetchClientData(c, config!).then(d => ({ client: c, data: d }))),
    ]);
    const freshData = currentResult as ClientData | null;

    // 兜底：当前取不到则退到缓存
    const currentKey = getCacheKey(currentClient.type, currentClient.index);
    const cachedCurrent = snapshot.cache[currentKey];
    const cachedFresh = cachedCurrent && Date.now() - cachedCurrent.timestamp < CACHE_DURATION ? cachedCurrent.data : null;
    const data = freshData ?? cachedFresh ?? cachedCurrent?.data ?? null;

    // —— 单次整包写入：cache(current+prefetch) + history ——
    const now = Date.now();
    let dirty = false;

    if (freshData) {
      snapshot.cache[currentKey] = { data: freshData, timestamp: now };
      dirty = true;
    }
    for (const r of prefetchResults as { client: VisibleClient; data: ClientData | null }[]) {
      if (r && r.data) {
        snapshot.cache[getCacheKey(r.client.type, r.client.index)] = { data: r.data, timestamp: now };
        dirty = true;
      }
    }

    // 仅在拿到新鲜数据时追加历史点，避免把旧缓存的速率重复塞进曲线
    let history = snapshot.historyByClient[currentKey] ?? [];
    if (freshData) {
      history = [
        ...history,
        { timestamp: now, uploadRate: freshData.uploadRate, downloadRate: freshData.downloadRate },
      ].slice(-MAX_HISTORY_POINTS);
      snapshot.historyByClient[currentKey] = history;
      dirty = true;
    }

    if (dirty) setQbitHelperData(snapshot);

    if (!data) {
      Widget.present(<ErrorWidget message="获取数据失败" visibleClients={visibleClients} currentClient={currentClient} size={size} />);
      return;
    }

    const refreshMinutes = config?.refreshMinutes ?? DEFAULT_REFRESH_MINUTES;
    Widget.present(
      <WidgetBody
        data={data}
        history={history}
        clientType={currentClient.type}
        size={size}
        visibleClients={visibleClients}
        currentClient={currentClient}
      />,
      refreshMinutes > 0
        ? { policy: "after", date: new Date(Date.now() + 1000 * 60 * refreshMinutes) }
        : undefined
    );
  } catch (e) {
    console.log('[widget] main() fatal:', e);
    const msg = (e instanceof Error ? e.message : String(e)).slice(0, 80);
    Widget.present(<ErrorWidget message={msg || '小组件异常'} visibleClients={[]} size={size} />);
  }
}

main();
