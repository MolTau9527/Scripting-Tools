import { useObservable, useEffect, useRef, VStack, HStack, Text, List, Section, NavigationStack, Navigation, Widget, Image, Spacer, Button, Color } from "scripting";
import { SettingsPage } from '../../pages/SettingsPage';
import { ClientData, HistoryPoint, ConfigData } from './types';
import { updateHistory, getConfig, setConfig, getQbitHelperData, resetAllConfig, getCacheKey, DEFAULT_REFRESH_MINUTES } from './storage';
import { Colors, Spacing, FontSize, Neon, FontDesign } from './theme';
import { NeonIcon, CyberBackground, rowBg, sectionLabel } from './cyber';
import { fetchData, clearSession } from '../api';

const isValidConfig = (cfg: ConfigData | null): cfg is ConfigData =>
  !!(cfg?.url && cfg?.username && cfg?.password);

function SettingsRow({ icon, color, title, onTap, showArrow = true, trailing }: {
  icon: string; color: Color; title: string; onTap: () => void; showArrow?: boolean; trailing?: any;
}) {
  return (
    <Button action={onTap} buttonStyle="plain">
      <HStack spacing={Spacing.md} padding={{ vertical: 4 }} frame={{ maxWidth: "infinity" }}>
        <NeonIcon name={icon} color={color} />
        <Text font={FontSize.headline} foregroundStyle={Neon.text}>{title}</Text>
        <Spacer />
        {trailing}
        {showArrow ? (
          <Image systemName="chevron.right" foregroundStyle={Neon.cyan} font={13} fontWeight="semibold" opacity={0.6} />
        ) : null}
      </HStack>
    </Button>
  );
}

function StatusSection({ icon, iconColor, title, message }: {
  icon: string; iconColor: Color; title: string; message: string;
}) {
  return (
    <Section listRowBackground={rowBg()}>
      <HStack spacing={Spacing.md} padding={{ vertical: 6 }}>
        <NeonIcon name={icon} color={iconColor} />
        <VStack spacing={2} alignment="leading" frame={{ maxWidth: "infinity" }}>
          <Text font={FontSize.headline} fontWeight="semibold" foregroundStyle={Neon.text}>{title}</Text>
          <Text font={FontSize.footnote} foregroundStyle={Neon.textDim}>{message}</Text>
        </VStack>
      </HStack>
    </Section>
  );
}

const CHANGELOG = [
  { version: "1.0.7", date: "2026-04-24", changes: ["全赛博朋克霓虹风皮肤", "强制深色主题 + 等宽字体", "霓虹描边 / 发光 / 渐变底"] },
  { version: "1.0.6", date: "2025-12-17", changes: ["优化组件渲染速度"] },
  { version: "1.0.5", date: "2025-12-17", changes: ["优化底部切换按钮，使用图标直接切换", "合并组件预览为单个选项", "新增更新日志功能"] },
  { version: "1.0.0", date: "2025-12-10", changes: ["支持 qBittorrent 和 Transmission", "支持多客户端配置", "小组件显示上传/下载统计", "支持自定义刷新间隔"] },
];

export default function Helper() {
  const dismiss = Navigation.useDismiss();
  const data = useObservable<ClientData | null>(null);
  const config = useObservable<ConfigData | null>(null);
  const error = useObservable("");
  const isLoading = useObservable(false);
  const showSettings = useObservable(false);
  const showChangelog = useObservable(false);
  const history = useObservable<HistoryPoint[]>([]);
  const refreshStatus = useObservable<'idle' | 'success' | 'failed'>('idle');

  const handleReset = async () => {
    const selectedIndex = await Dialog.actionSheet({
      title: "重新配置",
      message: "确定要清空所有服务器配置信息吗？此操作不可撤销。",
      actions: [{ label: "确认", destructive: true }],
    });
    if (selectedIndex === 0) {
      resetAllConfig();
      clearSession('qb');
      clearSession('tr');
      config.setValue(null);
      data.setValue(null);
      history.setValue([]);
      error.setValue("");
    }
  };

  useEffect(() => {
    const saved = getQbitHelperData();
    if (isValidConfig(saved.config)) config.setValue(saved.config);
    const key = getCacheKey(saved.config?.clientType ?? 'qb', saved.config?.clientIndex ?? 0);
    const savedHistory = saved.historyByClient[key];
    if (savedHistory?.length) history.setValue(savedHistory);
  }, []);

  const loadData = async () => {
    if (!config.value) return;
    isLoading.setValue(true);
    error.setValue("");
    const newData = await fetchData(config.value);
    isLoading.setValue(false);
    if (newData) {
      data.setValue(newData);
      const clientKey = getCacheKey(config.value.clientType ?? 'qb', config.value.clientIndex ?? 0);
      history.setValue(updateHistory(newData, clientKey));
    } else {
      error.setValue("获取数据失败，请检查配置");
    }
  };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!config.value) return;
    loadData();
    const refreshMinutes = config.value.refreshMinutes ?? DEFAULT_REFRESH_MINUTES;
    if (refreshMinutes <= 0) return;

    cancelledRef.current = false;
    const scheduleNext = () => {
      if (cancelledRef.current) return;
      timerRef.current = setTimeout(async () => {
        if (cancelledRef.current) return;
        await loadData();
        scheduleNext();
      }, refreshMinutes * 60 * 1000);
    };
    scheduleNext();

    return () => {
      cancelledRef.current = true;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [config.value]);

  const handleConfigSaved = (newConfig: ConfigData) => {
    if (!isValidConfig(newConfig)) { error.setValue("请填写完整的配置信息"); return; }
    clearSession(newConfig.clientType);
    setConfig(newConfig);
    config.setValue(newConfig);
    showSettings.setValue(false);
  };

  // 更新日志
  if (showChangelog.value) {
    return (
      <NavigationStack preferredColorScheme="dark" foregroundStyle={Neon.text} tint={Neon.cyan}>
        <CyberBackground>
          <List
            listStyle="insetGroup"
            scrollContentBackground="hidden"
            tint={Neon.cyan}
            fontDesign={FontDesign}
            foregroundStyle={Neon.text}
            navigationTitle=""
            navigationBarTitleDisplayMode="inline"
            toolbar={{
              topBarLeading: (
                <Button action={() => showChangelog.setValue(false)} buttonStyle="plain">
                  <HStack spacing={4}>
                    <Image systemName="chevron.left" font={17} fontWeight="semibold" foregroundStyle={Neon.cyan} />
                    <Text foregroundStyle={Neon.cyan} fontWeight="semibold">BACK</Text>
                  </HStack>
                </Button>
              ),
            }}
          >
            <Section listRowBackground={rowBg()}>
              <HStack spacing={Spacing.sm} alignment="bottom" padding={{ vertical: Spacing.xs }}>
                <Text font="largeTitle" fontWeight="bold" foregroundStyle={Neon.cyan} shadow={{ color: Neon.cyan, radius: 8 }}>CHANGELOG</Text>
                <Spacer />
              </HStack>
            </Section>
            {CHANGELOG.map((log: any) => (
              <Section
                key={log.version}
                listRowBackground={rowBg()}
                header={
                  <HStack>
                    <Text foregroundStyle={Neon.cyan}>{log.version.toUpperCase()}</Text>
                    <Spacer />
                    <Text foregroundStyle={Neon.textDim}>{log.date}</Text>
                  </HStack>
                }
              >
                {log.changes.map((change: string, idx: number) => (
                  <HStack key={idx} spacing={Spacing.sm} padding={{ vertical: 4 }} alignment="top">
                    <Text font={FontSize.body} foregroundStyle={Neon.cyan}>▸</Text>
                    <Text font={FontSize.body} foregroundStyle={Neon.text}>{change}</Text>
                  </HStack>
                ))}
              </Section>
            ))}
          </List>
        </CyberBackground>
      </NavigationStack>
    );
  }

  // 设置页
  if (showSettings.value) {
    return (
      <NavigationStack preferredColorScheme="dark" foregroundStyle={Neon.text} tint={Neon.cyan}>
        <SettingsPage
          onConfigSaved={handleConfigSaved}
          initialConfig={config.value || undefined}
          onBack={() => showSettings.setValue(false)}
          onReset={handleReset}
        />
      </NavigationStack>
    );
  }

  // 主页
  return (
    <NavigationStack preferredColorScheme="dark" foregroundStyle={Neon.text} tint={Neon.cyan}>
      <CyberBackground>
        <List
          listStyle="insetGroup"
          scrollContentBackground="hidden"
          tint={Neon.cyan}
          fontDesign={FontDesign}
          foregroundStyle={Neon.text}
          navigationTitle=""
          navigationBarTitleDisplayMode="inline"
          toolbar={{
            topBarTrailing: (
              <Button action={dismiss} buttonStyle="plain">
                <Image systemName="xmark" font={15} fontWeight="semibold" foregroundStyle={Neon.cyan} />
              </Button>
            ),
          }}
        >
          <Section listRowBackground={rowBg()}>
            <VStack spacing={2} alignment="leading" padding={{ vertical: Spacing.xs }} frame={{ maxWidth: "infinity" }}>
              <Text font="largeTitle" fontWeight="bold" foregroundStyle={Neon.cyan} shadow={{ color: Neon.cyan, radius: 10 }}>qBitHelper</Text>
              <Text font={FontSize.caption} fontWeight="semibold" foregroundStyle={Neon.magenta}>CYBER CONTROL PANEL</Text>
            </VStack>
          </Section>
          <Section
            listRowBackground={rowBg()}
            footer={
              <Text font={FontSize.caption} foregroundStyle={Neon.textFade}>
                远程监控·qBittorrent / Transmission
              </Text>
            }
          >
            {!config.value ? (
              <VStack spacing={Spacing.md} alignment="center" padding={{ vertical: Spacing.xl }} frame={{ maxWidth: "infinity" }}>
                <Image
                  systemName="server.rack"
                  foregroundStyle={Neon.cyan}
                  font="largeTitle"
                  shadow={{ color: Neon.cyan, radius: 8 }}
                />
                <VStack spacing={Spacing.xs} alignment="center">
                  <Text font="title3" fontWeight="semibold" foregroundStyle={Neon.text}>{'> WELCOME_'}</Text>
                  <Text font={FontSize.footnote} foregroundStyle={Neon.textDim}>请先配置服务器</Text>
                </VStack>
              </VStack>
            ) : (
              <HStack spacing={Spacing.md} padding={{ vertical: 4 }}>
                <NeonIcon name="checkmark.circle.fill" color={Colors.success} />
                <VStack spacing={2} alignment="leading" frame={{ maxWidth: "infinity" }}>
                  <Text font={FontSize.headline} fontWeight="semibold" foregroundStyle={Neon.lime}>CONNECTED</Text>
                  <Text font={FontSize.footnote} foregroundStyle={Neon.textDim} lineLimit={1}>{config.value.url}</Text>
                </VStack>
              </HStack>
            )}
          </Section>

          {error.value ? (
            <StatusSection icon="exclamationmark.triangle.fill" iconColor={Colors.warning} title="CONN_FAILED" message={error.value} />
          ) : null}

          {isLoading.value && !data.value ? (
            <StatusSection icon="arrow.triangle.2.circlepath" iconColor={Colors.neutral} title="LOADING…" message="正在获取数据…" />
          ) : null}

          <Section
            listRowBackground={rowBg()}
            header={<Text foregroundStyle={Neon.cyan}>{sectionLabel('Operations')}</Text>}
          >
            <SettingsRow
              icon="square.grid.2x2"
              color={Colors.brand}
              title="组件预览"
              onTap={async () => {
                const index = await Dialog.actionSheet({
                  title: "选择预览尺寸",
                  actions: [{ label: "大组件" }, { label: "中组件" }, { label: "小组件" }],
                });
                if (index === 0) Widget.preview({ family: 'systemLarge' });
                else if (index === 1) Widget.preview({ family: 'systemMedium' });
                else if (index === 2) Widget.preview({ family: 'systemSmall' });
              }}
            />
            <SettingsRow
              icon="arrow.clockwise"
              color={Colors.success}
              title="刷新组件"
              showArrow={false}
              trailing={
                refreshStatus.value !== 'idle' ? (
                  <Text
                    font={FontSize.footnote}
                    foregroundStyle={refreshStatus.value === 'success' ? Neon.lime : Neon.magenta}
                  >
                    {refreshStatus.value === 'success' ? 'OK' : 'ERR'}
                  </Text>
                ) : null
              }
              onTap={async () => {
                try { await Widget.reloadAll(); refreshStatus.setValue('success'); }
                catch { refreshStatus.setValue('failed'); }
                setTimeout(() => refreshStatus.setValue('idle'), 3000);
              }}
            />
            <SettingsRow icon="gearshape.fill" color={Colors.neutral} title="设置" onTap={() => showSettings.setValue(true)} />
          </Section>

          <Section
            listRowBackground={rowBg()}
            header={<Text foregroundStyle={Neon.cyan}>{sectionLabel('About')}</Text>}
          >
            <SettingsRow icon="doc.text.fill" color={Colors.info} title="更新日志" onTap={() => showChangelog.setValue(true)} />
          </Section>
        </List>
      </CyberBackground>
    </NavigationStack>
  );
}
