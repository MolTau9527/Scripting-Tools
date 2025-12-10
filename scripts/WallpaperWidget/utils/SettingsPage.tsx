import {
  NavigationStack,
  ScrollView,
  VStack,
  HStack,
  Text,
  Button,
  TextField,
  Divider,
  Image,
  Toggle,
  useObservable,
  useEffect,
  type DynamicShapeStyle,
  type ShapeStyle
} from "scripting";
import { loadConfig, saveConfig } from "./storage";
import { validateId, validateInterval, generateRandomId, MIN_REFRESH_INTERVAL } from "./utils";
import { fetchACGImage } from "./api";

interface SettingsPageProps {
  onBack: () => void;
}

// iOS 风格卡片组件
function SettingsCard({ children }: { children: any }) {
  return (
    <VStack
      spacing={0}
      background={{ light: "#FFFFFF", dark: "#1C1C1E" } as DynamicShapeStyle}
      clipShape={{ type: "rect", cornerRadius: 12 }}
    >
      {children}
    </VStack>
  );
}

// iOS 风格分组标题
function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      font={13}
      foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" } as DynamicShapeStyle}
      padding={{ leading: 16, bottom: 8 }}
    >
      {title}
    </Text>
  );
}

// iOS 风格设置行
function SettingsRow({
  icon,
  iconBgColor,
  title,
  children
}: {
  icon: string;
  iconBgColor: ShapeStyle;
  title: string;
  children?: any;
}) {
  return (
    <HStack spacing={12} alignment="center" padding={16}>
      <VStack
        frame={{ width: 29, height: 29 }}
        background={iconBgColor}
        clipShape={{ type: "rect", cornerRadius: 6 }}
        alignment="center"
      >
        <Image
          systemName={icon}
          font={15}
          foregroundStyle="#FFFFFF"
        />
      </VStack>
      <Text font={17}>{title}</Text>
      <VStack frame={{ maxWidth: Infinity }} />
      {children}
    </HStack>
  );
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  // 状态管理
  const imageId = useObservable<string>("");
  const refreshInterval = useObservable<string>("");
  const isAutoRefreshing = useObservable<boolean>(false);
  const showToast = useObservable<boolean>(false);
  const toastMessage = useObservable<string>("✅ 设置已保存");

  // 预览相关状态
  const previewUrl = useObservable<string>("");
  const isLoadingPreview = useObservable<boolean>(false);

  // 验证错误
  const idError = useObservable<string>("");
  const intervalError = useObservable<string>("");

  // 初始化配置
  useEffect(() => {
    const config = loadConfig();
    if (config) {
      imageId.setValue(config.imageId || "");
      refreshInterval.setValue(config.refreshInterval || "");
      isAutoRefreshing.setValue(config.isAutoRefreshing === 1);
    }
  }, []);

  // 加载预览图片
  const loadPreview = async (useRandom: boolean = false) => {
    try {
      isLoadingPreview.setValue(true);

      let id: number;
      if (useRandom) {
        id = generateRandomId();
        imageId.setValue(String(id));
      } else {
        const validation = validateId(imageId.value);
        if (!validation.valid) {
          idError.setValue(validation.error || "ID 无效");
          isLoadingPreview.setValue(false);
          return;
        }
        id = validation.value || generateRandomId();
      }

      idError.setValue("");
      const url = await fetchACGImage(id);
      previewUrl.setValue(url);
    } catch (error) {
      console.error("加载预览失败:", error);
      showToastMessage("❌ 加载失败，请重试");
    } finally {
      isLoadingPreview.setValue(false);
    }
  };

  // 显示 Toast 消息
  const showToastMessage = (message: string) => {
    toastMessage.setValue(message);
    showToast.setValue(true);
    setTimeout(() => showToast.setValue(false), 2000);
  };

  // 保存设置
  const handleSave = () => {
    // 验证刷新间隔
    if (isAutoRefreshing.value && refreshInterval.value) {
      const validation = validateInterval(refreshInterval.value);
      if (!validation.valid) {
        intervalError.setValue(validation.error || "间隔无效");
        return;
      }
      if (validation.value && validation.value < MIN_REFRESH_INTERVAL) {
        intervalError.setValue(`间隔不能小于 ${MIN_REFRESH_INTERVAL} 秒`);
        return;
      }
    }

    intervalError.setValue("");

    saveConfig({
      imageId: imageId.value,
      refreshInterval: refreshInterval.value,
      isAutoRefreshing: isAutoRefreshing.value ? 1 : 0
    });

    showToastMessage("✅ 设置已保存");
  };

  // 输入变化处理
  const handleIdChange = (value: string) => {
    imageId.setValue(value);
    if (value.trim()) {
      const validation = validateId(value);
      idError.setValue(validation.valid ? "" : validation.error || "");
    } else {
      idError.setValue("");
    }
  };

  const handleIntervalChange = (value: string) => {
    refreshInterval.setValue(value);
    if (value.trim()) {
      const validation = validateInterval(value);
      if (!validation.valid) {
        intervalError.setValue(validation.error || "");
      } else if (validation.value && validation.value < MIN_REFRESH_INTERVAL) {
        intervalError.setValue(`间隔不能小于 ${MIN_REFRESH_INTERVAL} 秒`);
      } else {
        intervalError.setValue("");
      }
    } else {
      intervalError.setValue("");
    }
  };

  // 计算刷新状态文本
  const getRefreshStatusText = () => {
    if (!isAutoRefreshing.value) {
      return "定时刷新已关闭";
    }
    const interval = parseInt(refreshInterval.value, 10);
    if (isNaN(interval) || interval < MIN_REFRESH_INTERVAL) {
      return "请设置有效的刷新间隔";
    }
    return `每 ${interval} 秒自动更新壁纸`;
  };

  return (
    <NavigationStack>
      <ScrollView
        navigationTitle="设置"
        navigationBarTitleDisplayMode="inline"
        background={{ light: "#F2F2F7", dark: "#000000" } as DynamicShapeStyle}
        toast={{
          duration: 2,
          position: "center",
          isPresented: showToast.value,
          onChanged: (v) => showToast.setValue(v),
          content: <Text font={15}>{toastMessage.value}</Text>
        }}
        toolbar={{
          topBarLeading: (
            <Button
              title="返回"
              action={onBack}
            />
          )
        }}
      >
        <VStack spacing={24} padding={{ top: 20, horizontal: 16, bottom: 40 }}>

          {/* 图片配置 */}
          <VStack spacing={8} alignment="leading">
            <SectionHeader title="图片配置" />
            <SettingsCard>
              <SettingsRow icon="photo.fill" iconBgColor="#007AFF" title="图片 ID">
                <TextField
                  title=""
                  prompt="0 为随机"
                  value={imageId.value}
                  onChanged={handleIdChange}
                  keyboardType="numberPad"
                  frame={{ width: 100 }}
                  multilineTextAlignment="trailing"
                />
              </SettingsRow>
              {idError.value ? (
                <VStack padding={{ horizontal: 16, bottom: 12 }}>
                  <Text font={13} foregroundStyle="#FF3B30">{idError.value}</Text>
                </VStack>
              ) : (
                <VStack padding={{ horizontal: 16, bottom: 12 }}>
                  <Text font={13} foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" } as DynamicShapeStyle}>
                    输入 1-9999 的数字，0 或留空为随机
                  </Text>
                </VStack>
              )}
            </SettingsCard>
          </VStack>

          {/* 刷新设置 */}
          <VStack spacing={8} alignment="leading">
            <SectionHeader title="刷新设置" />
            <SettingsCard>
              <SettingsRow icon="arrow.clockwise" iconBgColor="#34C759" title="自动刷新">
                <Toggle
                  value={isAutoRefreshing.value}
                  onChanged={(v) => isAutoRefreshing.setValue(v)}
                />
              </SettingsRow>

              <Divider padding={{ leading: 57 }} />

              <SettingsRow icon="clock.fill" iconBgColor="#FF9500" title="刷新间隔">
                <TextField
                  title=""
                  prompt="秒"
                  value={refreshInterval.value}
                  onChanged={handleIntervalChange}
                  keyboardType="numberPad"
                  frame={{ width: 80 }}
                  multilineTextAlignment="trailing"
                />
              </SettingsRow>
              {intervalError.value ? (
                <VStack padding={{ horizontal: 16, bottom: 12 }}>
                  <Text font={13} foregroundStyle="#FF3B30">{intervalError.value}</Text>
                </VStack>
              ) : (
                <VStack padding={{ horizontal: 16, bottom: 12 }}>
                  <Text font={13} foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" } as DynamicShapeStyle}>
                    最小 {MIN_REFRESH_INTERVAL} 秒
                  </Text>
                </VStack>
              )}
            </SettingsCard>
          </VStack>

          {/* 刷新状态 */}
          <VStack spacing={8} alignment="leading">
            <SectionHeader title="刷新状态" />
            <SettingsCard>
              <HStack spacing={12} alignment="center" padding={16}>
                {isAutoRefreshing.value ? (
                  <VStack
                    frame={{ width: 29, height: 29 }}
                    background="#34C759"
                    clipShape={{ type: "rect", cornerRadius: 6 }}
                    alignment="center"
                  >
                    <Image
                      systemName="checkmark.circle.fill"
                      font={15}
                      foregroundStyle="#FFFFFF"
                    />
                  </VStack>
                ) : (
                  <VStack
                    frame={{ width: 29, height: 29 }}
                    background="#8E8E93"
                    clipShape={{ type: "rect", cornerRadius: 6 }}
                    alignment="center"
                  >
                    <Image
                      systemName="xmark.circle.fill"
                      font={15}
                      foregroundStyle="#FFFFFF"
                    />
                  </VStack>
                )}
                <VStack spacing={4} alignment="leading">
                  <Text font={17}>
                    {isAutoRefreshing.value ? "定时刷新已启动" : "定时刷新已关闭"}
                  </Text>
                  <Text font={13} foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" } as DynamicShapeStyle}>
                    {getRefreshStatusText()}
                  </Text>
                </VStack>
              </HStack>
            </SettingsCard>
          </VStack>

          {/* 预览 */}
          <VStack spacing={8} alignment="leading">
            <SectionHeader title="预览" />
            <SettingsCard>
              <VStack spacing={16} padding={16} alignment="center">
                {isLoadingPreview.value ? (
                  <VStack
                    frame={{ height: 200 }}
                    alignment="center"
                  >
                    <Text font={15} foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" } as DynamicShapeStyle}>
                      加载中...
                    </Text>
                  </VStack>
                ) : previewUrl.value ? (
                  <Image
                    imageUrl={previewUrl.value}
                    resizable
                    aspectRatio={{ value: null, contentMode: "fit" }}
                    frame={{ maxHeight: 300 }}
                    clipShape={{ type: "rect", cornerRadius: 8 }}
                  />
                ) : (
                  <VStack
                    frame={{ height: 200 }}
                    alignment="center"
                    background={{ light: "#F2F2F7", dark: "#2C2C2E" } as DynamicShapeStyle}
                    clipShape={{ type: "rect", cornerRadius: 8 }}
                  >
                    <Image
                      systemName="photo"
                      font={40}
                      foregroundStyle={{ light: "#C7C7CC", dark: "#48484A" } as DynamicShapeStyle}
                    />
                    <Text
                      font={13}
                      foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" } as DynamicShapeStyle}
                      padding={{ top: 8 }}
                    >
                      点击下方按钮加载预览
                    </Text>
                  </VStack>
                )}

                <HStack spacing={12}>
                  <Button
                    title="加载预览"
                    action={() => loadPreview(false)}
                  />
                  <Button
                    title="随机换图"
                    action={() => loadPreview(true)}
                  />
                </HStack>
              </VStack>
            </SettingsCard>
          </VStack>

          {/* 保存按钮 */}
          <Button
            title="保存设置"
            action={handleSave}
          />

        </VStack>
      </ScrollView>
    </NavigationStack>
  );
}
