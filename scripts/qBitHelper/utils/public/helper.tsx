import { useObservable, useEffect, VStack, HStack, Text, List, Section, NavigationStack, Navigation, Widget, Image, Spacer, TapGesture, Color } from "scripting";
import { SettingsPage, ConfigData } from '../../pages/SettingsPage';
import { ClientData, HistoryPoint } from './types';
import { STORAGE_KEY, HISTORY_KEY, updateHistory } from './storage';
import { fetchData, clearSession } from '../api';

const isValidConfig = (cfg: ConfigData | null): cfg is ConfigData =>
  !!(cfg?.url && cfg?.username && cfg?.password);

const RowIcon = ({ name, color }: { name: string; color: Color }) => (
  <HStack frame={{ width: 32, height: 32 }} background={color} clipShape={{ type: 'rect', cornerRadius: 7 }}>
    <Image systemName={name} foregroundStyle="white" font={16} />
  </HStack>
);

const ActionRow = ({ icon, color, title, onTap, showArrow = true, trailing }: {
  icon: string; color: Color; title: string; onTap: () => void; showArrow?: boolean; trailing?: any
}) => (
  <HStack
    padding={{ vertical: 14 }}
    frame={{ maxWidth: Infinity }}
    contentShape="rect"
    gesture={{ gesture: TapGesture().onEnded(onTap), mask: 'gesture' }}
  >
    <RowIcon name={icon} color={color} />
    <Text padding={{ leading: 12 }} font={17}>{title}</Text>
    <Spacer />
    {trailing}
    {showArrow && <Image systemName="chevron.right" foregroundStyle="tertiaryLabel" font={14} fontWeight="semibold" />}
  </HStack>
);

const PreviewRow = ({ title, onTap }: { title: string; onTap: () => void }) => (
  <HStack
    padding={{ vertical: 14 }}
    frame={{ maxWidth: Infinity }}
    contentShape="rect"
    gesture={{ gesture: TapGesture().onEnded(onTap), mask: 'gesture' }}
  >
    <RowIcon name="widget.small" color="#007AFF" />
    <Text padding={{ leading: 12 }} font={17}>{title}</Text>
    <Spacer />
    <Image systemName="chevron.right" foregroundStyle="tertiaryLabel" font={14} fontWeight="semibold" />
  </HStack>
);

export default function Helper() {
  const dismiss = Navigation.useDismiss();
  const data = useObservable<ClientData | null>(null);
  const config = useObservable<ConfigData | null>(null);
  const error = useObservable("");
  const isLoading = useObservable(false);
  const showSettings = useObservable(false);
  const history = useObservable<HistoryPoint[]>([]);
  const refreshStatus = useObservable<'idle' | 'success' | 'failed'>('idle');

  const handleReset = async () => {
    const selectedIndex = await Dialog.actionSheet({
      title: "重新配置",
      message: "确定要清空所有服务器配置信息吗？此操作不可撤销。",
      actions: [{ label: "确认", destructive: true }]
    });
    if (selectedIndex === 0) {
      Storage.remove(STORAGE_KEY);
      Storage.remove(HISTORY_KEY);
      Storage.remove('qbClientConfig');
      Storage.remove('trClientConfig');
      clearSession('qb');
      clearSession('tr');
      config.setValue(null);
      data.setValue(null);
      history.setValue([]);
      error.setValue("");
    }
  };

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
      timeoutId = setTimeout(async () => { await loadData(); scheduleNext(); }, refreshMinutes * 60 * 1000);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [config.value]);

  const handleConfigSaved = (newConfig: ConfigData) => {
    if (!isValidConfig(newConfig)) { error.setValue("请填写完整的配置信息"); return; }
    clearSession(newConfig.clientType);
    Storage.set(STORAGE_KEY, newConfig);
    config.setValue(newConfig);
    showSettings.setValue(false);
  };

  if (showSettings.value) {
    return (
      <NavigationStack>
        <SettingsPage
          onConfigSaved={handleConfigSaved}
          initialConfig={config.value || undefined}
          onBack={() => showSettings.setValue(false)}
          onReset={handleReset}
        />
      </NavigationStack>
    );
  }

  return (
    <NavigationStack>
      <List
        listStyle="insetGroup"
        navigationTitle="qBitHelper"
        navigationBarTitleDisplayMode="large"
        toolbar={{ topBarTrailing: <Image systemName="xmark" gesture={{ gesture: TapGesture().onEnded(dismiss), mask: 'gesture' }} /> }}
      >

        <Section>
          <Text font={13} foregroundStyle="secondaryLabel">远程监控 qBittorrent/Transmission 状态的脚本</Text>
        </Section>

        {!config.value ? (
          <Section>
            <VStack spacing={20} alignment="center" padding={{ vertical: 32 }}>
              <Image systemName="server.rack" foregroundStyle="systemBlue" font="largeTitle" />
              <VStack spacing={8} alignment="center">
                <Text font="title2">欢迎使用 qBitHelper</Text>
                <Text font="subheadline" opacity={0.6}>请先配置您的服务器信息</Text>
              </VStack>
            </VStack>
          </Section>
        ) : null}

        {error.value ? (
          <Section>
            <HStack spacing={12} padding={{ vertical: 12 }}>
              <RowIcon name="exclamationmark.triangle.fill" color="#FF9500" />
              <VStack spacing={4} alignment="leading" frame={{ maxWidth: "infinity" }}>
                <Text font="headline">连接失败</Text>
                <Text font="subheadline" opacity={0.7}>{error.value}</Text>
              </VStack>
            </HStack>
          </Section>
        ) : null}

        {isLoading.value && !data.value ? (
          <Section>
            <HStack padding={{ vertical: 20 }}><Spacer /><Text font="subheadline" opacity={0.7}>正在加载数据...</Text><Spacer /></HStack>
          </Section>
        ) : null}

        <Section header={<Text>操作</Text>}>
          <ActionRow
            icon="widget.small"
            color="#34C759"
            title="刷新组件"
            showArrow={false}
            trailing={
              refreshStatus.value !== 'idle' ? (
                <Text font={15} foregroundStyle={refreshStatus.value === 'success' ? '#34C759' : '#FF3B30'}>
                  {refreshStatus.value === 'success' ? '已刷新' : '刷新失败'}
                </Text>
              ) : null
            }
            onTap={async () => {
              try {
                await Widget.reloadAll();
                refreshStatus.setValue('success');
              } catch {
                refreshStatus.setValue('failed');
              }
              setTimeout(() => refreshStatus.setValue('idle'), 3000);
            }}
          />
          <ActionRow icon="gear" color="#8E8E93" title="设置" onTap={() => showSettings.setValue(true)} />
        </Section>

        <Section header={<Text>组件预览</Text>} footer={<Text>点击预览不同尺寸的小组件</Text>}>
          <PreviewRow title="大组件预览" onTap={() => Widget.preview({ family: 'systemLarge' })} />
          <PreviewRow title="中组件预览" onTap={() => Widget.preview({ family: 'systemMedium' })} />
          <PreviewRow title="小组件预览" onTap={() => Widget.preview({ family: 'systemSmall' })} />
        </Section>
      </List>
    </NavigationStack>
  );
}

export { Helper as QbHelper };