import { useObservable, VStack, HStack, Text, TextField, SecureField, Button, useEffect, Picker, useState, List, Section, Widget, Image } from "scripting";

export interface QbConfigData {
  url: string;
  username: string;
  password: string;
  refreshMinutes?: number;
}

interface SettingsPageProps {
  onConfigSaved: (config: QbConfigData) => void;
  initialConfig?: QbConfigData;
  onBack?: () => void;
}

const DEFAULT_REFRESH = 0.5;

type SystemColor = "systemBlue" | "systemGreen" | "systemOrange" | "systemPurple" | "systemGray";

function SettingField({ icon, color, prompt, value, onChanged }: {
  icon: string;
  color: SystemColor;
  prompt: string;
  value: string;
  onChanged: (v: string) => void;
}) {
  return (
    <HStack spacing={12} alignment="center">
      <Image systemName={icon} foregroundStyle={color} font={18} />
      <TextField title="" prompt={prompt} value={value} onChanged={onChanged} frame={{ maxWidth: "infinity" }} />
    </HStack>
  );
}

export function SettingsPage({ onConfigSaved, initialConfig, onBack }: SettingsPageProps) {
  const url = useObservable(initialConfig?.url || '');
  const username = useObservable(initialConfig?.username || '');
  const password = useObservable(initialConfig?.password || '');
  const [refreshMinutes, setRefreshMinutes] = useState(initialConfig?.refreshMinutes ?? DEFAULT_REFRESH);
  const [showPassword, setShowPassword] = useState(false);
  const errorMsg = useObservable('');

  useEffect(() => {
    if (!initialConfig) return;
    url.setValue(initialConfig.url || '');
    username.setValue(initialConfig.username || '');
    password.setValue(initialConfig.password || '');
    setRefreshMinutes(initialConfig.refreshMinutes ?? DEFAULT_REFRESH);
  }, []);

  const validate = (): string | null => {
    if (!url.value.trim()) return '请输入服务器地址';
    if (!username.value.trim()) return '请输入用户名';
    if (!password.value.trim()) return '请输入密码';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      errorMsg.setValue(error);
      return;
    }
    errorMsg.setValue('');
    onConfigSaved({
      url: url.value.trim(),
      username: username.value.trim(),
      password: password.value,
      refreshMinutes
    });
    await Widget.reloadUserWidgets();
  };

  return (
    <List
      navigationTitle="设置"
      toolbar={{
        topBarLeading: onBack ? <Button title="返回" systemImage="chevron.left" action={onBack} /> : undefined,
        topBarTrailing: <Button title="保存" action={handleSave} />
      }}
    >
      {errorMsg.value ? (
        <Section>
          <HStack spacing={8} alignment="center">
            <Image systemName="exclamationmark.triangle.fill" foregroundStyle="systemOrange" />
            <Text foregroundStyle="red">{errorMsg.value}</Text>
          </HStack>
        </Section>
      ) : null}

      <Section header={<Text>服务器连接</Text>} footer={<Text>请输入 qBittorrent WebUI 的完整地址，包含端口号</Text>}>
        <SettingField icon="server.rack" color="systemBlue" prompt="http://192.168.1.1:8080" value={url.value} onChanged={v => url.setValue(v)} />
      </Section>

      <Section header={<Text>账户信息</Text>}>
        <SettingField icon="person.fill" color="systemGreen" prompt="用户名" value={username.value} onChanged={v => username.setValue(v)} />
        <HStack spacing={12} alignment="center">
          <Image systemName="lock.fill" foregroundStyle="systemOrange" font={18} />
          {showPassword ? (
            <TextField title="" prompt="密码" value={password.value} onChanged={v => password.setValue(v)} frame={{ maxWidth: "infinity" }} />
          ) : (
            <SecureField title="" prompt="密码" value={password.value} onChanged={v => password.setValue(v)} />
          )}
          <Button action={() => setShowPassword(!showPassword)}>
            <Image systemName={showPassword ? "eye.slash" : "eye"} foregroundStyle="systemGray" font={18} />
          </Button>
        </HStack>
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
    </List>
  );
}
