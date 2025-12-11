import {
  NavigationStack,
  List,
  Section,
  Text,
  HStack,
  VStack,
  Spacer,
  Image,
  Toggle,
  Picker,
  TextField,
  TapGesture,
  Widget,
  useObservable,
  useEffect,
  type Color
} from "scripting";
import { loadConfig, saveConfig } from "./storage";

interface SettingsPageProps {
  onBack: () => void;
}

const refreshOptions = [
  { value: 60, label: '1分钟' },
  { value: 120, label: '2分钟' },
  { value: 300, label: '5分钟' },
  { value: 600, label: '10分钟' },
  { value: 1800, label: '30分钟' },
  { value: 3600, label: '1小时' },
]


function RowIcon({ name, color }: { name: string; color: Color }) {
  return (
    <HStack
      frame={{ width: 32, height: 32 }}
      background={color}
      clipShape={{ type: "rect", cornerRadius: 7 }}
    >
      <Image systemName={name} foregroundStyle="white" font={16} />
    </HStack>
  );
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const imageId = useObservable<string>("0");
  const refreshInterval = useObservable<number>(300);
  const isAutoRefreshing = useObservable<boolean>(false);

  useEffect(() => {
    const config = loadConfig();
    if (config) {
      imageId.setValue(config.imageId || "0");
      const interval = parseInt(config.refreshInterval, 10);
      refreshInterval.setValue(isNaN(interval) ? 300 : interval);
      isAutoRefreshing.setValue(config.isAutoRefreshing === 1);
    }
  }, []);

  function saveAndUpdate(updates: {
    imageId?: string;
    refreshInterval?: number;
    isAutoRefreshing?: boolean;
  }) {
    const newImageId = updates.imageId ?? imageId.value;
    const newInterval = updates.refreshInterval ?? refreshInterval.value;
    const newAutoRefresh = updates.isAutoRefreshing ?? isAutoRefreshing.value;

    if (updates.imageId !== undefined) imageId.setValue(newImageId);
    if (updates.refreshInterval !== undefined) refreshInterval.setValue(newInterval);
    if (updates.isAutoRefreshing !== undefined) isAutoRefreshing.setValue(newAutoRefresh);

    saveConfig({
      imageId: newImageId,
      refreshInterval: String(newInterval),
      isAutoRefreshing: newAutoRefresh ? 1 : 0
    });
  }

  async function previewWidget() {
    await Widget.preview({
      family: "systemMedium"
    });
  }

  return (
    <NavigationStack>
      <List
        listStyle="insetGroup"
        navigationTitle="壁纸组件"
        navigationBarTitleDisplayMode="large"
        toolbar={{
          topBarLeading: (
            <Text
              foregroundStyle="#007AFF"
              gesture={{
                gesture: TapGesture().onEnded(onBack),
                mask: "gesture"
              }}
            >
              返回
            </Text>
          )
        }}
      >
        <Section>
          <HStack
            padding={{ vertical: 14 }}
            frame={{ maxWidth: Infinity }}
            contentShape="rect"
            gesture={{
              gesture: TapGesture().onEnded(previewWidget),
              mask: "gesture"
            }}
          >
            <RowIcon name="eye.fill" color="#007AFF" />
            <Text padding={{ leading: 12 }} font={17}>
              预览组件
            </Text>
            <Spacer />
            <Image
              systemName="chevron.right"
              foregroundStyle="tertiaryLabel"
              font={14}
              fontWeight="semibold"
            />
          </HStack>
        </Section>

        <Section
          header={<Text>图片设置</Text>}
          footer={<Text padding={{ top: 8, horizontal: 16 }}>输入 1-9999 的数字，0 或留空为随机</Text>}
        >
          <HStack padding={{ vertical: 6 }}>
            <RowIcon name="photo.fill" color="#FF9500" />
            <Text padding={{ leading: 12 }} font={17}>
              图片 ID
            </Text>
            <Spacer />
            <TextField
              title=""
              prompt="随机"
              value={imageId.value}
              onChanged={(v: string) => saveAndUpdate({ imageId: v })}
              keyboardType="numberPad"
              frame={{ width: 80 }}
              multilineTextAlignment="trailing"
              foregroundStyle="secondaryLabel"
            />
          </HStack>
        </Section>

        <Section
          header={<Text>刷新设置</Text>}
          footer={
            <Text padding={{ top: 8, horizontal: 16 }}>
              {isAutoRefreshing.value
                ? `组件将每 ${refreshInterval.value >= 60 ? Math.floor(refreshInterval.value / 60) + ' 分钟' : refreshInterval.value + ' 秒'}自动刷新`
                : "自动刷新已关闭，组件将保持当前图片"}
            </Text>
          }
        >
          <HStack padding={{ vertical: 6 }}>
            <RowIcon name="arrow.clockwise" color="#34C759" />
            <Text padding={{ leading: 12 }} font={17}>
              自动刷新
            </Text>
            <Spacer />
            <Toggle
              title=" "
              frame={{ width: 50 }}
              value={isAutoRefreshing.value}
              onChanged={(v: boolean) => saveAndUpdate({ isAutoRefreshing: v })}
            />
          </HStack>

          <Picker
            value={refreshInterval.value}
            onChanged={(v: number) => saveAndUpdate({ refreshInterval: v })}
            pickerStyle="menu"
            label={
              <HStack padding={{ vertical: 14 }}>
                <RowIcon name="clock.fill" color="#5856D6" />
                <Text padding={{ leading: 12 }} font={17}>
                  刷新间隔
                </Text>
              </HStack>
            }
          >
            {refreshOptions.map((o) => (
              <Text key={o.value} tag={o.value}>
                {o.label}
              </Text>
            ))}
          </Picker>
        </Section>

        <Section header={<Text>关于</Text>}>
          <HStack padding={{ vertical: 12 }}>
            <RowIcon name="info.circle.fill" color="#8E8E93" />
            <Text padding={{ leading: 12 }} font={17}>
              数据来源
            </Text>
            <Spacer />
            <Text foregroundStyle="secondaryLabel" font={15}>
              ACG 图库
            </Text>
          </HStack>
        </Section>
      </List>
    </NavigationStack>
  );
}
