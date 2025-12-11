import { useObservable, VStack, HStack, Text, TextField, SecureField, Button, useEffect, Picker, useState, List, Section, Widget, Image, Spacer, TapGesture, Color } from "scripting";

export type ClientType = 'qb' | 'tr';

export interface ConfigData {
  url: string;
  username: string;
  password: string;
  refreshMinutes?: number;
  clientType?: ClientType;
}

interface ClientConfig {
  url: string;
  username: string;
  password: string;
}

interface SettingsPageProps {
  onConfigSaved: (config: ConfigData) => void;
  initialConfig?: ConfigData;
  onBack?: () => void;
  onReset?: () => void;
}

const DEFAULT_REFRESH = 0.5;
const QB_CONFIG_KEY = 'qbClientConfig';
const TR_CONFIG_KEY = 'trClientConfig';

type SystemColor = "systemBlue" | "systemGreen" | "systemOrange" | "systemPurple" | "systemGray";

const SettingField = ({ icon, color, prompt, value, onChanged }: {
  icon: string; color: SystemColor; prompt: string; value: string; onChanged: (v: string) => void;
}) => (
  <HStack spacing={12} alignment="center">
    <Image systemName={icon} foregroundStyle={color} font={18} />
    <TextField title="" prompt={prompt} value={value} onChanged={onChanged} frame={{ maxWidth: "infinity" }} />
  </HStack>
);

const SecureSettingField = ({ icon, color, prompt, value, onChanged, show, onToggle }: {
  icon: string; color: SystemColor; prompt: string; value: string; onChanged: (v: string) => void; show: boolean; onToggle: () => void;
}) => (
  <HStack spacing={12} alignment="center">
    <Image systemName={icon} foregroundStyle={color} font={18} />
    {show ? (
      <TextField title="" prompt={prompt} value={value} onChanged={onChanged} frame={{ maxWidth: "infinity" }} />
    ) : (
      <SecureField title="" prompt={prompt} value={value} onChanged={onChanged} />
    )}
    <Button action={onToggle}>
      <Image systemName={show ? "eye.slash" : "eye"} foregroundStyle="systemGray" font={18} />
    </Button>
  </HStack>
);

export function SettingsPage({ onConfigSaved, initialConfig, onBack, onReset }: SettingsPageProps) {
  const [clientType, setClientType] = useState<ClientType>(initialConfig?.clientType || 'qb');
  const url = useObservable('');
  const username = useObservable('');
  const password = useObservable('');
  const [refreshMinutes, setRefreshMinutes] = useState(initialConfig?.refreshMinutes ?? DEFAULT_REFRESH);
  const [showPassword, setShowPassword] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const errorMsg = useObservable('');

  const getConfigKey = (type: ClientType) => type === 'qb' ? QB_CONFIG_KEY : TR_CONFIG_KEY;

  const loadClientConfig = (type: ClientType) => {
    const saved = Storage.get<ClientConfig>(getConfigKey(type));
    url.setValue(saved?.url || '');
    username.setValue(saved?.username || '');
    password.setValue(saved?.password || '');
  };

  const saveClientConfig = (type: ClientType) => {
    Storage.set<ClientConfig>(getConfigKey(type), { url: url.value, username: username.value, password: password.value });
  };

  useEffect(() => {
    if (initialConfig) {
      const key = getConfigKey(initialConfig.clientType || 'qb');
      if (!Storage.get<ClientConfig>(key)) {
        Storage.set<ClientConfig>(key, { url: initialConfig.url || '', username: initialConfig.username || '', password: initialConfig.password || '' });
      }
    }
    loadClientConfig(clientType);
  }, []);

  const handleClientTypeChange = (newType: string) => {
    saveClientConfig(clientType);
    const type = newType as ClientType;
    setClientType(type);
    loadClientConfig(type);
  };

  const handleSave = async () => {
    if (!url.value.trim()) { errorMsg.setValue('请输入服务器地址'); return; }
    if (!username.value.trim()) { errorMsg.setValue('请输入用户名'); return; }
    if (!password.value.trim()) { errorMsg.setValue('请输入密码'); return; }
    errorMsg.setValue('');
    saveClientConfig(clientType);
    onConfigSaved({ url: url.value.trim(), username: username.value.trim(), password: password.value, refreshMinutes, clientType });
    await Widget.reloadUserWidgets();
  };

  const clientName = clientType === 'qb' ? 'qBittorrent WebUI' : 'Transmission WebUI';

  return (
    <List navigationTitle="设置" toolbar={{
      topBarLeading: onBack ? <Button title="返回" systemImage="chevron.left" action={onBack} /> : undefined,
      topBarTrailing: <Button title="保存" action={handleSave} />
    }}>
      {errorMsg.value ? (
        <Section>
          <HStack spacing={8} alignment="center">
            <Image systemName="exclamationmark.triangle.fill" foregroundStyle="systemOrange" />
            <Text foregroundStyle="red">{errorMsg.value}</Text>
          </HStack>
        </Section>
      ) : null}

      <Section header={<Text>客户端类型</Text>} footer={<Text>选择您使用的 BT 客户端，每个客户端独立保存配置</Text>}>
        <HStack spacing={12} alignment="center">
          <Image systemName="app.connected.to.app.below.fill" foregroundStyle="systemBlue" font={18} />
          <Picker title="客户端" pickerStyle="segmented" value={clientType} onChanged={handleClientTypeChange} frame={{ maxWidth: "infinity" }}>
            <Text tag="qb">qBittorrent</Text>
            <Text tag="tr">Transmission</Text>
          </Picker>
        </HStack>
      </Section>

      <Section header={<Text>服务器连接</Text>} footer={<Text>请输入 {clientName} 的完整地址，包含端口号</Text>}>
        <SecureSettingField icon="server.rack" color="systemBlue" prompt="http://192.168.1.1:8080" value={url.value} onChanged={v => url.setValue(v)} show={showUrl} onToggle={() => setShowUrl(!showUrl)} />
      </Section>

      <Section header={<Text>账户信息</Text>}>
        <SettingField icon="person.fill" color="systemGreen" prompt="用户名" value={username.value} onChanged={v => username.setValue(v)} />
        <SecureSettingField icon="lock.fill" color="systemOrange" prompt="密码" value={password.value} onChanged={v => password.setValue(v)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
      </Section>

      <Section header={<Text>小组件设置</Text>} footer={<Text>设置小组件自动刷新的时间间隔。实际刷新频率由系统根据电量和使用情况决定。</Text>}>
        <HStack spacing={12} alignment="center">
          <Image systemName="clock.fill" foregroundStyle="systemPurple" font={18} />
          <Picker title="刷新间隔" pickerStyle="menu" value={refreshMinutes} onChanged={setRefreshMinutes} frame={{ maxWidth: "infinity" }}>
            <Text tag={0}>不刷新</Text>
            <Text tag={0.5}>30秒</Text>
            <Text tag={1}>1分钟</Text>
            <Text tag={2}>2分钟</Text>
            <Text tag={5}>5分钟</Text>
          </Picker>
        </HStack>
      </Section>

      {onReset ? (
        <Section header={<Text>危险操作</Text>} footer={<Text>清空所有服务器配置信息，此操作不可撤销</Text>}>
          <HStack
            padding={{ vertical: 14 }}
            frame={{ maxWidth: Infinity }}
            contentShape="rect"
            gesture={{ gesture: TapGesture().onEnded(onReset), mask: 'gesture' }}
          >
            <HStack frame={{ width: 32, height: 32 }} background={"#FF3B30" as Color} clipShape={{ type: 'rect', cornerRadius: 7 }}>
              <Image systemName="arrow.counterclockwise" foregroundStyle="white" font={16} />
            </HStack>
            <Text padding={{ leading: 12 }} font={17} foregroundStyle="#FF3B30">重新配置</Text>
            <Spacer />
          </HStack>
        </Section>
      ) : null}
    </List>
  );
}