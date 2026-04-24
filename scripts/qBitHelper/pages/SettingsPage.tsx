import { VStack, HStack, Text, TextField, SecureField, Button, Toggle, useEffect, Picker, useState, useMemo, useCallback, List, Section, Widget, Image, Spacer, Color, Menu } from "scripting";
import { ClientType, ClientConfig, MultiClientConfig, ConfigData } from '../utils/public/types';
import {
  CLIENT_COUNT,
  DEFAULT_REFRESH_MINUTES,
  getDefaultMultiConfig,
  getMultiClientConfig,
  setMultiClientConfig,
  resetAllConfig,
  getIconPath,
} from '../utils/public/storage';
import { Colors, Spacing, FontSize, Neon, FontDesign } from '../utils/public/theme';
import { CyberBackground, sectionLabel, rowBg } from '../utils/public/cyber';

interface SettingsPageProps {
  onConfigSaved: (config: ConfigData) => void;
  initialConfig?: ConfigData;
  onBack?: () => void;
  onReset?: () => void;
}

const refreshLabel = (m: number): string => m === 0 ? '自动' : `${m} 分钟`;

const CLIENT_ICON_URLS: Record<ClientType, string> = {
  qb: 'https://avatars.githubusercontent.com/u/2131270',
  tr: 'https://avatars.githubusercontent.com/u/223312',
};

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
      } catch (e) {
        console.log(`Failed to download icon for ${type}:`, e);
      }
    }
  }
};

const SettingField = ({ icon, color, prompt, value, onChanged, secure }: {
  icon: string;
  color: Color;
  prompt: string;
  value: string;
  onChanged: (v: string) => void;
  secure?: boolean;
}) => {
  const fieldProps = {
    title: "",
    prompt,
    value,
    onChanged,
    frame: { maxWidth: "infinity" as const },
    foregroundStyle: Neon.text,
    tint: Neon.cyan,
  };
  return (
    <HStack spacing={Spacing.md} alignment="center">
      <Image systemName={icon} foregroundStyle={color} font={FontSize.body + 1} frame={{ width: 24 }} />
      {secure ? <SecureField {...fieldProps} /> : <TextField {...fieldProps} />}
    </HStack>
  );
};

const ClientIcon = ({ type, size = 18 }: { type: ClientType; size?: number }) => {
  const path = getIconPath(type);
  if (FileManager.existsSync(path)) {
    return <Image filePath={path} frame={{ width: size, height: size }} clipShape={{ type: 'rect', cornerRadius: size * 0.22 }} resizable />;
  }
  return <Image systemName={type === 'qb' ? 'q.circle.fill' : 't.circle.fill'} frame={{ width: size, height: size }} foregroundStyle={Neon.cyan} />;
};

function ClientEditor({ config, onUpdate, onReset }: {
  config: ClientConfig | null; onUpdate: (config: ClientConfig) => void; onReset: () => void;
}) {
  const [alias, setAlias] = useState(config?.alias || '');
  const [url, setUrl] = useState(config?.url || '');
  const [username, setUsername] = useState(config?.username || '');
  const [password, setPassword] = useState(config?.password || '');
  const [visible, setVisible] = useState(config?.visible ?? false);
  const [saved, setSaved] = useState(!!(config?.url && config?.username && config?.password));

  useEffect(() => {
    setAlias(config?.alias || '');
    setUrl(config?.url || '');
    setUsername(config?.username || '');
    setPassword(config?.password || '');
    setVisible(config?.visible ?? false);
    setSaved(!!(config?.url && config?.username && config?.password));
  }, [config]);

  const hasChanges = useMemo(() =>
    alias !== (config?.alias || '') ||
    url !== (config?.url || '') ||
    username !== (config?.username || '') ||
    password !== (config?.password || '') ||
    visible !== (config?.visible ?? false),
  [alias, url, username, password, visible, config]);

  const isConfigured = useMemo(() => !!(url && username && password), [url, username, password]);

  const handleSave = useCallback(() => {
    onUpdate({ url, username, password, alias, visible });
    setSaved(true);
  }, [url, username, password, alias, visible, onUpdate]);

  const bindText = useCallback((setter: (v: string) => void) => (v: string) => {
    setter(v);
    setSaved(false);
  }, []);

  const bindVisible = useCallback((v: boolean) => {
    setVisible(v);
    setSaved(false);
  }, []);

  const statusText = hasChanges && isConfigured ? 'UNSAVED'
    : !isConfigured ? 'INCOMPLETE'
    : saved ? 'SAVED' : '';
  const statusColor: Color = hasChanges && isConfigured ? Colors.warning
    : !isConfigured ? Colors.danger
    : Colors.success;

  return (
    <VStack spacing={0}>
      <Toggle value={visible} onChanged={bindVisible}>
        <HStack spacing={Spacing.sm}>
          <Image systemName="eye" foregroundStyle={Neon.cyan} font={FontSize.body} />
          <Text foregroundStyle={Neon.text}>在小组件中显示</Text>
        </HStack>
      </Toggle>
      <SettingField icon="tag" color={Colors.info} prompt="别名（可选）" value={alias} onChanged={bindText(setAlias)} />
      <SettingField icon="server.rack" color={Colors.brand} prompt="http://192.168.1.1:8080" value={url} onChanged={bindText(setUrl)} />
      <SettingField icon="person.fill" color={Colors.success} prompt="用户名" value={username} onChanged={bindText(setUsername)} />
      <SettingField icon="lock.fill" color={Colors.warning} prompt="密码" value={password} onChanged={bindText(setPassword)} secure />

      <HStack spacing={Spacing.sm} padding={{ vertical: 4 }}>
        {statusText ? <Text font={FontSize.footnote} foregroundStyle={statusColor}>{statusText}</Text> : null}
        <Spacer />
        <Button action={handleSave} disabled={!isConfigured || !hasChanges}>
          <HStack spacing={4}>
            <Image systemName="checkmark" foregroundStyle={Neon.lime} />
            <Text foregroundStyle={Neon.lime} fontWeight="semibold">保存</Text>
          </HStack>
        </Button>
        <Button role="destructive" action={onReset}>
          <HStack spacing={4}>
            <Image systemName="arrow.counterclockwise" foregroundStyle={Neon.magenta} />
            <Text foregroundStyle={Neon.magenta} fontWeight="semibold">重置</Text>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  );
}

export function SettingsPage({ onConfigSaved, initialConfig, onBack, onReset }: SettingsPageProps) {
  const [multiConfig, setMultiConfigState] = useState<MultiClientConfig>(getMultiClientConfig);
  const [currentType, setCurrentType] = useState<ClientType>('qb');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [refreshMinutes, setRefreshMinutes] = useState(initialConfig?.refreshMinutes ?? DEFAULT_REFRESH_MINUTES);

  useEffect(() => { ensureIcons(); }, []);

  const handleUpdateClient = useCallback((type: ClientType, index: number, cfg: ClientConfig) => {
    setMultiConfigState(prev => {
      const next = { ...prev };
      next[type][index] = cfg;
      next.activeClient = { type, index };
      setMultiClientConfig(next);
      Widget.reloadUserWidgets();
      return next;
    });
  }, []);

  const handleResetClient = useCallback((type: ClientType, index: number) => {
    setMultiConfigState(prev => {
      const next = { ...prev };
      next[type][index] = null;
      if (next.activeClient?.type === type && next.activeClient?.index === index) {
        next.activeClient = { type: 'qb', index: 0 };
      }
      setMultiClientConfig(next);
      Widget.reloadUserWidgets();
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    const active = multiConfig.activeClient || { type: 'qb', index: 0 };
    const activeConfig = multiConfig[active.type][active.index];
    if (activeConfig) {
      onConfigSaved({
        url: activeConfig.url,
        username: activeConfig.username,
        password: activeConfig.password,
        refreshMinutes,
        clientType: active.type,
        clientIndex: active.index,
      });
    }
    await Widget.reloadUserWidgets();
  }, [multiConfig, refreshMinutes, onConfigSaved]);

  const handleResetAll = useCallback(async () => {
    const idx = await Dialog.actionSheet({
      title: "重置所有配置",
      message: "将清空所有客户端配置信息，此操作不可撤销。",
      actions: [{ label: "重置", destructive: true }],
    });
    if (idx !== 0) return;
    const fresh = getDefaultMultiConfig();
    setMultiConfigState(fresh);
    resetAllConfig();
    onReset?.();
  }, [onReset]);

  const clientName = currentType === 'qb' ? 'qBittorrent' : 'Transmission';
  const sectionHeader = (t: string) => <Text foregroundStyle={Neon.cyan}>{sectionLabel(t)}</Text>;

  return (
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
          topBarLeading: onBack
            ? (
              <Button action={onBack} buttonStyle="plain">
                <HStack spacing={2}>
                  <Image systemName="chevron.left" font={15} fontWeight="semibold" foregroundStyle={Neon.cyan} />
                  <Text foregroundStyle={Neon.cyan}>返回</Text>
                </HStack>
              </Button>
            )
            : undefined,
          topBarTrailing: (
            <Button action={handleSave}>
              <Text foregroundStyle={Neon.cyan} fontWeight="semibold">保存</Text>
            </Button>
          ),
        }}
      >
        {/* 自绘大标题 */}
        <Section listRowBackground={rowBg()}>
          <VStack spacing={2} alignment="leading" padding={{ vertical: Spacing.xs }} frame={{ maxWidth: "infinity" }}>
            <Text font="largeTitle" fontWeight="bold" foregroundStyle={Neon.cyan} shadow={{ color: Neon.cyan, radius: 10 }}>SETTINGS</Text>
            <Text font={FontSize.caption} foregroundStyle={Neon.magenta}>SYSTEM CONFIGURATION</Text>
          </VStack>
        </Section>
        {/* 客户端类型切换 */}
        <Section listRowBackground={rowBg()} header={sectionHeader('客户端类型')}>
          <HStack spacing={Spacing.sm} frame={{ maxWidth: "infinity" }} padding={{ vertical: 4 }}>
            {(['qb', 'tr'] as ClientType[]).map((t) => {
              const isActive = currentType === t;
              const label = t === 'qb' ? 'qBittorrent' : 'Transmission';
              return (
                <Button
                  key={t}
                  action={() => { setCurrentType(t); setExpandedIndex(null); }}
                  buttonStyle="plain"
                  frame={{ maxWidth: "infinity" }}
                >
                  <HStack
                    spacing={6}
                    alignment="center"
                    padding={{ vertical: 8, horizontal: 10 }}
                    frame={{ maxWidth: "infinity" }}
                    background={isActive ? Neon.cyan : Neon.surface}
                    clipShape={{ type: 'rect', cornerRadius: 8 }}
                    overlay={{
                      alignment: 'center',
                      content: <VStack
                        frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
                        border={{ style: isActive ? Neon.cyan : Neon.border, width: 1 }}
                        clipShape={{ type: 'rect', cornerRadius: 8 }}
                      />,
                    }}
                  >
                    <ClientIcon type={t} size={16} />
                    <Text
                      foregroundStyle={isActive ? Neon.bg : Neon.text}
                      fontWeight={isActive ? "bold" : "regular"}
                    >{label}</Text>
                  </HStack>
                </Button>
              );
            })}
          </HStack>
        </Section>

        {/* 客户端列表 */}
        <Section
          listRowBackground={rowBg()}
          header={sectionHeader(`${clientName} 客户端`)}
          footer={<Text foregroundStyle={Neon.textFade}>点击卡片编辑客户端配置</Text>}
        >
          {Array.from({ length: CLIENT_COUNT }, (_, i) => {
            const cfg = multiConfig[currentType][i];
            const name = cfg?.alias || `${clientName} ${i + 1}`;
            const isConfigured = !!(cfg?.url && cfg?.username && cfg?.password);
            const isExpanded = expandedIndex === i;
            return (
              <VStack key={`${currentType}-${i}`} spacing={0}>
                <Button buttonStyle="plain" action={() => setExpandedIndex(prev => prev === i ? null : i)}>
                  <HStack spacing={Spacing.md} padding={{ vertical: 4 }} frame={{ maxWidth: "infinity" }}>
                    <ClientIcon type={currentType} size={22} />
                    <Text font={FontSize.body} foregroundStyle={Neon.text}>{name}</Text>
                    <Spacer />
                    <Text font={FontSize.footnote} foregroundStyle={isConfigured ? Colors.success : Neon.textFade}>
                      {isConfigured ? 'READY' : 'EMPTY'}
                    </Text>
                    <Image
                      systemName={isExpanded ? "chevron.up" : "chevron.down"}
                      foregroundStyle={Neon.textFade}
                      font={12}
                      fontWeight="semibold"
                    />
                  </HStack>
                </Button>
                {isExpanded ? (
                  <ClientEditor
                    config={cfg}
                    onUpdate={(cc) => handleUpdateClient(currentType, i, cc)}
                    onReset={() => handleResetClient(currentType, i)}
                  />
                ) : null}
              </VStack>
            );
          })}
        </Section>

        {/* 小组件设置 */}
        <Section
          listRowBackground={rowBg()}
          header={sectionHeader('小组件设置')}
          footer={<Text foregroundStyle={Neon.textFade}>实际刷新频率由系统决定</Text>}
        >
          <Menu
            label={
              <HStack spacing={Spacing.sm} frame={{ maxWidth: "infinity" }}>
                <Image systemName="clock" foregroundStyle={Neon.cyan} />
                <Text foregroundStyle={Neon.text}>刷新间隔</Text>
                <Spacer />
                <Text foregroundStyle={Neon.lime} fontWeight="semibold">{refreshLabel(refreshMinutes)}</Text>
                <Image systemName="chevron.up.chevron.down" font={FontSize.caption} foregroundStyle={Neon.cyan} />
              </HStack>
            }
          >
            <Button action={() => setRefreshMinutes(0)}><Text>自动</Text></Button>
            <Button action={() => setRefreshMinutes(5)}><Text>5 分钟</Text></Button>
            <Button action={() => setRefreshMinutes(10)}><Text>10 分钟</Text></Button>
            <Button action={() => setRefreshMinutes(15)}><Text>15 分钟</Text></Button>
            <Button action={() => setRefreshMinutes(30)}><Text>30 分钟</Text></Button>
          </Menu>
        </Section>

        {/* 危险操作 */}
        {onReset ? (
          <Section
            listRowBackground={rowBg()}
            footer={<Text foregroundStyle={Neon.textFade}>操作不可恢复</Text>}
          >
            <Button role="destructive" action={handleResetAll}>
              <HStack spacing={Spacing.sm}>
                <Image systemName="arrow.counterclockwise" foregroundStyle={Neon.magenta} />
                <Text foregroundStyle={Neon.magenta} fontWeight="semibold">RESET ALL</Text>
              </HStack>
            </Button>
          </Section>
        ) : null}
      </List>
    </CyberBackground>
  );
}
