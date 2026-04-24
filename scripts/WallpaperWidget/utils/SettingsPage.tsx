import {
  NavigationStack,
  ScrollView,
  VStack,
  HStack,
  ZStack,
  Text,
  Image,
  Spacer,
  Toggle,
  Picker,
  TextField,
  TapGesture,
  Widget,
  gradient,
  useObservable,
  useEffect,
  useRef,
  type Color,
  type VirtualNode,
} from "scripting";
import { loadConfig, saveConfig } from "./storage";
import {
  DEFAULT_REFRESH_SECONDS,
  MAX_RANDOM_ID,
  validateId,
} from "./utils";
import {
  bgCard,
  bgPage,
  danger,
  divider,
  iconLilac,
  iconMauve,
  iconMint,
  iconPeach,
  iconRose,
  primary,
  primaryDeep,
  primaryLight,
  shadow,
  textPrimary,
  textSecondary,
} from "./theme";

interface SettingsPageProps {
  onBack: () => void;
}

const refreshOptions = [
  { value: 60, label: "1分钟" },
  { value: 120, label: "2分钟" },
  { value: 300, label: "5分钟" },
  { value: 600, label: "10分钟" },
  { value: 1800, label: "30分钟" },
  { value: 3600, label: "1小时" },
];

/** imageId 输入防抖延时（毫秒） */
const IMAGE_ID_DEBOUNCE_MS = 400;

/* ---------- 小部件 ---------- */

function RowIcon({
  name,
  color,
}: {
  name: string;
  color: { light: Color; dark: Color };
}) {
  return (
    <ZStack
      frame={{ width: 34, height: 34 }}
      background={{
        style: color,
        shape: { type: "rect", cornerRadius: 9 },
      }}
    >
      <Image
        systemName={name}
        foregroundStyle="white"
        font={15}
        fontWeight="semibold"
      />
    </ZStack>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      padding={{ leading: 20, bottom: 6, top: 4 }}
      font={13}
      fontWeight="semibold"
      foregroundStyle={primary}
      textCase="uppercase"
    >
      {children}
    </Text>
  );
}

function SectionFooter({ children }: { children: string }) {
  return (
    <Text
      padding={{ leading: 20, trailing: 20, top: 6 }}
      font={12}
      foregroundStyle={textSecondary}
    >
      {children}
    </Text>
  );
}

function Card({
  children,
}: {
  children:
    | VirtualNode
    | boolean
    | undefined
    | null
    | (VirtualNode | boolean | undefined | null)[];
}) {
  return (
    <VStack
      alignment="leading"
      spacing={0}
      padding={{ horizontal: 14 }}
      frame={{ maxWidth: Infinity, alignment: "leading" }}
      background={{
        style: bgCard,
        shape: { type: "rect", cornerRadius: 18 },
      }}
      shadow={{ color: shadow.light, radius: 10, y: 4 }}
    >
      {children}
    </VStack>
  );
}

function RowDivider() {
  return (
    <HStack
      frame={{ maxWidth: Infinity, height: 1 }}
      background={divider}
    />
  );
}

/* ---------- 主页面 ---------- */

export function SettingsPage({ onBack }: SettingsPageProps) {
  const imageId = useObservable<string>("");
  const imageIdError = useObservable<string>("");
  const refreshInterval = useObservable<number>(DEFAULT_REFRESH_SECONDS);
  const isAutoRefreshing = useObservable<boolean>(false);

  const imageIdDebounceTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const config = loadConfig();
    if (config) {
      imageId.setValue(config.imageId || "");
      const interval = parseInt(config.refreshInterval, 10);
      refreshInterval.setValue(
        Number.isFinite(interval) ? interval : DEFAULT_REFRESH_SECONDS
      );
      isAutoRefreshing.setValue(Boolean(config.isAutoRefreshing));
    }
    return () => {
      if (imageIdDebounceTimer.current != null) {
        clearTimeout(imageIdDebounceTimer.current);
      }
    };
  }, []);

  function persistNow(overrides?: {
    imageId?: string;
    refreshInterval?: number;
    isAutoRefreshing?: boolean;
  }) {
    saveConfig({
      imageId: overrides?.imageId ?? imageId.value,
      refreshInterval: String(
        overrides?.refreshInterval ?? refreshInterval.value
      ),
      isAutoRefreshing:
        overrides?.isAutoRefreshing ?? isAutoRefreshing.value,
    });
  }

  function onImageIdChanged(v: string) {
    imageId.setValue(v);
    const result = validateId(v);
    imageIdError.setValue(result.valid ? "" : result.error ?? "");

    if (imageIdDebounceTimer.current != null) {
      clearTimeout(imageIdDebounceTimer.current);
    }
    if (!result.valid) return;
    imageIdDebounceTimer.current = setTimeout(() => {
      persistNow({ imageId: v });
    }, IMAGE_ID_DEBOUNCE_MS);
  }

  function onRefreshIntervalChanged(v: number) {
    refreshInterval.setValue(v);
    persistNow({ refreshInterval: v });
  }

  function onAutoRefreshingChanged(v: boolean) {
    isAutoRefreshing.setValue(v);
    persistNow({ isAutoRefreshing: v });
  }

  async function previewWidget() {
    await Widget.preview({ family: "systemMedium" });
  }

  /* ---------- Banner ---------- */
  const banner = (
    <ZStack
      alignment="leading"
      frame={{ maxWidth: Infinity, height: 140 }}
      background={{
        style: gradient("linear", {
          colors: [primaryLight.light, primaryDeep.light],
          startPoint: "topLeading",
          endPoint: "bottomTrailing",
        }),
        shape: { type: "rect", cornerRadius: 24 },
      }}
      shadow={{ color: shadow.light, radius: 16, y: 8 }}
      clipped
    >
      {/* 右侧装饰 sparkles */}
      <HStack frame={{ maxWidth: Infinity, alignment: "trailing" }}>
        <Image
          systemName="sparkles"
          font={88}
          fontWeight="bold"
          foregroundStyle="rgba(255,255,255,0.22)"
          padding={{ trailing: 18 }}
        />
      </HStack>

      {/* 左侧文案 */}
      <VStack
        alignment="leading"
        spacing={6}
        padding={{ leading: 22, vertical: 22 }}
      >
        <HStack spacing={6}>
          <Image
            systemName="heart.fill"
            font={13}
            foregroundStyle="rgba(255,255,255,0.85)"
          />
          <Text
            font={12}
            fontWeight="semibold"
            foregroundStyle="rgba(255,255,255,0.9)"
          >
            ACG · 二次元壁纸
          </Text>
        </HStack>
        <Text
          font={28}
          fontWeight="bold"
          foregroundStyle="white"
        >
          壁纸组件
        </Text>
        <Text
          font={13}
          foregroundStyle="rgba(255,255,255,0.88)"
        >
          每次刷新都是一期一会
        </Text>
      </VStack>
    </ZStack>
  );

  /* ---------- 预览按钮（全宽粉色大按钮） ---------- */
  const previewButton = (
    <HStack
      spacing={8}
      padding={{ vertical: 14, horizontal: 18 }}
      frame={{ maxWidth: Infinity }}
      background={{
        style: gradient("linear", {
          colors: [primary.light, primaryDeep.light],
          startPoint: "leading",
          endPoint: "trailing",
        }),
        shape: { type: "rect", cornerRadius: 16 },
      }}
      shadow={{ color: shadow.light, radius: 10, y: 4 }}
      contentShape="rect"
      gesture={{
        gesture: TapGesture().onEnded(previewWidget),
        mask: "gesture",
      }}
    >
      <Image
        systemName="eye.fill"
        font={16}
        fontWeight="semibold"
        foregroundStyle="white"
      />
      <Text
        font={16}
        fontWeight="semibold"
        foregroundStyle="white"
      >
        预览组件效果
      </Text>
      <Spacer />
      <Image
        systemName="chevron.right"
        font={13}
        fontWeight="bold"
        foregroundStyle="rgba(255,255,255,0.85)"
      />
    </HStack>
  );

  /* ---------- Row: 图片 ID ---------- */
  const imageIdRow = (
    <HStack padding={{ vertical: 14 }}>
      <RowIcon name="number" color={iconPeach} />
      <VStack alignment="leading" spacing={2} padding={{ leading: 12 }}>
        <Text font={16} fontWeight="medium" foregroundStyle={textPrimary}>
          图片 ID
        </Text>
        <Text font={11} foregroundStyle={textSecondary}>
          留空为随机
        </Text>
      </VStack>
      <Spacer />
      <TextField
        title=""
        prompt="随机"
        value={imageId.value}
        onChanged={onImageIdChanged}
        keyboardType="numberPad"
        frame={{ width: 90 }}
        multilineTextAlignment="trailing"
        foregroundStyle={textPrimary}
      />
    </HStack>
  );

  /* ---------- Row: 自动刷新 Toggle ---------- */
  const autoRefreshRow = (
    <HStack padding={{ vertical: 14 }}>
      <RowIcon name="arrow.triangle.2.circlepath" color={iconRose} />
      <Text
        padding={{ leading: 12 }}
        font={16}
        fontWeight="medium"
        foregroundStyle={textPrimary}
      >
        自动刷新
      </Text>
      <Spacer />
      <Toggle
        title=""
        frame={{ width: 50 }}
        value={isAutoRefreshing.value}
        onChanged={onAutoRefreshingChanged}
        tint={primary}
      />
    </HStack>
  );

  /* ---------- Row: 刷新间隔 Picker ---------- */
  const currentIntervalLabel =
    refreshOptions.find((o) => o.value === refreshInterval.value)?.label ??
    `${refreshInterval.value} 秒`;

  const intervalRow = (
    <HStack padding={{ vertical: 14 }}>
      <RowIcon name="clock.fill" color={iconLilac} />
      <Text
        padding={{ leading: 12 }}
        font={16}
        fontWeight="medium"
        foregroundStyle={textPrimary}
      >
        刷新间隔
      </Text>
      <Spacer />
      <Picker
        value={refreshInterval.value}
        onChanged={onRefreshIntervalChanged}
        pickerStyle="menu"
        label={
          <HStack spacing={4}>
            <Text
              font={14}
              fontWeight="medium"
              foregroundStyle={primary}
            >
              {currentIntervalLabel}
            </Text>
            <Image
              systemName="chevron.up.chevron.down"
              font={11}
              fontWeight="semibold"
              foregroundStyle={textSecondary}
            />
          </HStack>
        }
      >
        {refreshOptions.map((o) => (
          <Text key={o.value} tag={o.value}>
            {o.label}
          </Text>
        ))}
      </Picker>
    </HStack>
  );

  /* ---------- Row: 关于 ---------- */
  const aboutRow = (
    <HStack padding={{ vertical: 14 }}>
      <RowIcon name="sparkles" color={iconMauve} />
      <Text
        padding={{ leading: 12 }}
        font={16}
        fontWeight="medium"
        foregroundStyle={textPrimary}
      >
        数据来源
      </Text>
      <Spacer />
      <Text font={14} foregroundStyle={textSecondary}>
        ACG 图库
      </Text>
    </HStack>
  );

  const versionRow = (
    <HStack padding={{ vertical: 14 }}>
      <RowIcon name="checkmark.seal.fill" color={iconMint} />
      <Text
        padding={{ leading: 12 }}
        font={16}
        fontWeight="medium"
        foregroundStyle={textPrimary}
      >
        版本
      </Text>
      <Spacer />
      <Text font={14} foregroundStyle={textSecondary}>
        v1.0.3
      </Text>
    </HStack>
  );

  /* ---------- Footer 文本 ---------- */
  const imageFooterText = imageIdError.value
    ? imageIdError.value
    : `输入 1-${MAX_RANDOM_ID} 的数字，留空则每次随机`;

  const refreshFooterText = isAutoRefreshing.value
    ? `每 ${
        refreshInterval.value >= 60
          ? Math.floor(refreshInterval.value / 60) + " 分钟"
          : refreshInterval.value + " 秒"
      }为你换一张 ✨`
    : "自动刷新已关闭，组件会乖乖保持当前图片 (｡･ω･｡)";

  const imageFooterColor = imageIdError.value ? danger : textSecondary;

  return (
    <NavigationStack>
      <ScrollView
        navigationTitle="壁纸组件"
        navigationBarTitleDisplayMode="inline"
        toolbarTitleDisplayMode="inline"
        background={bgPage}
        toolbar={{
          topBarLeading: (
            <HStack
              spacing={4}
              contentShape="rect"
              gesture={{
                gesture: TapGesture().onEnded(onBack),
                mask: "gesture",
              }}
            >
              <Image
                systemName="chevron.left"
                font={15}
                fontWeight="semibold"
                foregroundStyle={primary}
              />
              <Text
                font={16}
                foregroundStyle={primary}
              >
                返回
              </Text>
            </HStack>
          ),
        }}
      >
        <VStack
          alignment="leading"
          spacing={18}
          padding={{ horizontal: 16, top: 8, bottom: 40 }}
        >
          {/* Banner */}
          {banner}

          {/* 预览大按钮 */}
          {previewButton}

          {/* 图片设置 */}
          <VStack alignment="leading" spacing={0}>
            <SectionTitle>图片设置</SectionTitle>
            <Card>{imageIdRow}</Card>
            <Text
              padding={{ leading: 20, trailing: 20, top: 6 }}
              font={12}
              foregroundStyle={imageFooterColor}
            >
              {imageFooterText}
            </Text>
          </VStack>

          {/* 刷新设置（C：Toggle 打开才展开间隔行） */}
          <VStack alignment="leading" spacing={0}>
            <SectionTitle>刷新设置</SectionTitle>
            <Card>
              {autoRefreshRow}
              {isAutoRefreshing.value && <RowDivider />}
              {isAutoRefreshing.value && intervalRow}
            </Card>
            <SectionFooter>{refreshFooterText}</SectionFooter>
          </VStack>

          {/* 关于 */}
          <VStack alignment="leading" spacing={0}>
            <SectionTitle>关于</SectionTitle>
            <Card>
              {aboutRow}
              <RowDivider />
              {versionRow}
            </Card>
          </VStack>

          {/* 底部装饰 */}
          <HStack
            frame={{ maxWidth: Infinity }}
            padding={{ top: 8 }}
            spacing={6}
          >
            <Spacer />
            <Image
              systemName="heart.fill"
              font={10}
              foregroundStyle={primaryLight}
            />
            <Text font={11} foregroundStyle={textSecondary}>
              Made with love
            </Text>
            <Image
              systemName="heart.fill"
              font={10}
              foregroundStyle={primaryLight}
            />
            <Spacer />
          </HStack>
        </VStack>
      </ScrollView>
    </NavigationStack>
  );
}
