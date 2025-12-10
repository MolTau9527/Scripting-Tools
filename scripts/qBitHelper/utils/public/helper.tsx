import { useObservable, useEffect, VStack, HStack, Text, Button, NavigationStack, ScrollView, Navigation, Widget, Image } from "scripting";
import { SettingsPage, ConfigData } from '../../pages/SettingsPage';
import { Display } from './display';
import { ClientData, HistoryPoint } from './types';
import { STORAGE_KEY, HISTORY_KEY, updateHistory } from './storage';
import { fetchData, clearSession } from '../api';

type SystemColor = "systemBlue" | "systemGreen" | "systemGray" | "systemOrange";

const isValidConfig = (cfg: ConfigData | null): cfg is ConfigData =>
  !!(cfg?.url && cfg?.username && cfg?.password);

function PreviewCard({ title, subtitle, children }: { title: string; subtitle: string; children: JSX.Element }) {
  return (
    <VStack spacing={8} frame={{ maxWidth: "infinity" }}>
      <VStack spacing={2} alignment="leading" padding={{ leading: 4 }}>
        <Text font="headline">{title}</Text>
        <Text font="caption" opacity={0.6}>{subtitle}</Text>
      </VStack>
      <VStack padding={16} frame={{ maxWidth: "infinity" }}>
        {children}
      </VStack>
    </VStack>
  );
}

function ActionButton({ icon, title, color, action }: { icon: string; title: string; color: SystemColor; action: () => void }) {
  return (
    <Button action={action}>
      <VStack spacing={6} alignment="center" frame={{ maxWidth: "infinity" }}>
        <Image systemName={icon} foregroundStyle={color} font="title2" />
        <Text font="caption">{title}</Text>
      </VStack>
    </Button>
  );
}

function WelcomeView({ onConfigure }: { onConfigure: () => void }) {
  return (
    <VStack spacing={20} alignment="center" padding={32}>
      <Image systemName="server.rack" foregroundStyle="systemBlue" font="largeTitle" />
      <VStack spacing={8} alignment="center">
        <Text font="title2">欢迎使用 qBitHelper</Text>
        <Text font="subheadline" opacity={0.6}>请先配置您的 qBittorrent 服务器信息</Text>
      </VStack>
      <Button title="开始配置" systemImage="gear" action={onConfigure} />
    </VStack>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <HStack spacing={12} padding={16}>
      <Image systemName="exclamationmark.triangle.fill" foregroundStyle="systemOrange" font="title3" />
      <VStack spacing={4} alignment="leading" frame={{ maxWidth: "infinity" }}>
        <Text font="headline">连接失败</Text>
        <Text font="subheadline" opacity={0.7}>{message}</Text>
      </VStack>
    </HStack>
  );
}

function LoadingView() {
  return (
    <VStack spacing={16} alignment="center" padding={32}>
      <Text font="title3" opacity={0.7}>正在加载数据...</Text>
    </VStack>
  );
}

export default function Helper() {
  const dismiss = Navigation.useDismiss();
  const data = useObservable<ClientData | null>(null);
  const config = useObservable<ConfigData | null>(null);
  const error = useObservable("");
  const isLoading = useObservable(false);
  const showSettings = useObservable(false);
  const history = useObservable<HistoryPoint[]>([]);

  useEffect(() => {
    const savedConfig = Storage.get<ConfigData>(STORAGE_KEY);
    const savedHistory = Storage.get<HistoryPoint[]>(HISTORY_KEY);
    if (isValidConfig(savedConfig)) config.setValue(savedConfig);
    if (savedHistory) history.setValue(savedHistory);
  }, []);

  const loadData = async () => {
    if (!config.value) return;
    isLoading.setValue(true);
    error.setValue("");

    const newData = await fetchData(config.value);
    isLoading.setValue(false);

    if (newData) {
      data.setValue(newData);
      history.setValue(updateHistory(newData));
    } else {
      error.setValue("获取数据失败，请检查配置");
    }
  };

  useEffect(() => {
    if (!config.value) return;

    loadData();

    const refreshMinutes = config.value.refreshMinutes ?? 1;
    if (refreshMinutes <= 0) return;

    let timeoutId: any;
    const scheduleNext = () => {
      timeoutId = setTimeout(async () => {
        await loadData();
        scheduleNext();
      }, refreshMinutes * 60 * 1000);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [config.value]);

  const handleConfigSaved = (newConfig: ConfigData) => {
    if (!isValidConfig(newConfig)) {
      error.setValue("请填写完整的配置信息");
      return;
    }
    clearSession(newConfig.clientType);
    Storage.set(STORAGE_KEY, newConfig);
    config.setValue(newConfig);
    showSettings.setValue(false);
  };

  const openSettings = () => showSettings.setValue(true);

  if (showSettings.value) {
    return (
      <NavigationStack>
        <SettingsPage
          onConfigSaved={handleConfigSaved}
          initialConfig={config.value || undefined}
          onBack={() => showSettings.setValue(false)}
        />
      </NavigationStack>
    );
  }

  const clientType = config.value?.clientType || 'qb';

  return (
    <NavigationStack>
      <ScrollView
        navigationTitle={clientType === 'tr' ? 'Transmission' : 'qBittorrent'}
        toolbar={{ topBarLeading: <Button title="" systemImage="xmark" action={dismiss} /> }}
      >
        <VStack spacing={24} padding={16}>
          {!config.value ? (
            <WelcomeView onConfigure={openSettings} />
          ) : (
            <VStack spacing={24}>
              {error.value ? <ErrorBanner message={error.value} /> : null}
              {isLoading.value && !data.value ? <LoadingView /> : null}
              {data.value ? (
                <VStack spacing={24}>
                  <HStack spacing={12} frame={{ maxWidth: "infinity" }}>
                    <ActionButton icon="arrow.clockwise" title="刷新" color="systemBlue" action={loadData} />
                    <ActionButton icon="widget.small" title="刷新组件" color="systemGreen" action={() => Widget.reloadAll()} />
                    <ActionButton icon="gear" title="设置" color="systemGray" action={openSettings} />
                  </HStack>
                  <PreviewCard title="大组件预览" subtitle="适用于 4x4 大尺寸小组件">
                    <Display data={data.value} history={history.value} showChart={true} clientType={clientType} />
                  </PreviewCard>
                  <PreviewCard title="中/小组件预览" subtitle="适用于 2x2 或 2x4 小组件">
                    <Display data={data.value} history={history.value} showChart={false} clientType={clientType} />
                  </PreviewCard>
                </VStack>
              ) : null}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </NavigationStack>
  );
}

// 保持向后兼容的别名
export { Helper as QbHelper };
