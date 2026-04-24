import { VStack, HStack, Text, Chart, LineChart, Spacer, RoundedRectangle, Color } from "scripting";
import { ClientData, HistoryPoint, ClientType } from './types';
import { Colors, Spacing, FontSize, Radius, WidgetMetrics, Neon } from './theme';

const FULL_WIDTH = { maxWidth: "infinity" as const };
const FULL_SIZE = { maxWidth: "infinity" as const, maxHeight: "infinity" as const };

interface DisplayProps {
  data: ClientData;
  history?: HistoryPoint[];
  size?: 'small' | 'medium' | 'large';
  clientType?: ClientType;
}

const SIZES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const MAX_POINTS = 12;

const formatBytes = (bytes: number) => {
  // 防御：NaN / Infinity / 负数 → '0 B'；超范围 → 夹到最大单位
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const raw = Math.floor(Math.log(bytes) / Math.log(1024));
  const i = Math.min(Math.max(raw, 0), SIZES.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${SIZES[i]}`;
};

const formatRate = (bps: number) => `${formatBytes(bps)}/s`;

const formatTime = (ts: number) => {
  if (!Number.isFinite(ts)) return '--:--';
  const d = new Date(ts);
  const t = d.getTime();
  if (Number.isNaN(t)) return '--:--';
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatVersion = (v?: string) => {
  if (!v) return undefined;
  return v.toLowerCase().startsWith('v') ? v : `v${v}`;
};

const getClientName = (clientType: ClientType | undefined, short: boolean): string => {
  const full = clientType === 'tr' ? 'Transmission' : 'qBittorrent';
  if (!short) return full;
  return clientType === 'tr' ? 'Trans' : 'qBit';
};

// ============================================================
// 原子组件
// ============================================================

/**
 * 大号速率行：↓/↑ + 数值（霓虹发光）。
 * 供 Small / Medium 使用。
 */
function RateLine({ direction, bps, compact }: {
  direction: 'down' | 'up';
  bps: number;
  compact?: boolean;
}) {
  const isDown = direction === 'down';
  const color: Color = isDown ? Colors.download : Colors.upload;
  const arrow = isDown ? '↓' : '↑';
  const numFont = compact ? FontSize.body : FontSize.headline;
  return (
    <HStack spacing={Spacing.xs + 2} frame={FULL_WIDTH}>
      <Text
        font={numFont}
        fontWeight="bold"
        foregroundStyle={color}
        shadow={{ color, radius: WidgetMetrics.neonGlow.radius }}
      >{arrow}</Text>
      <Text
        font={numFont}
        fontWeight="bold"
        foregroundStyle={color}
        lineLimit={1}
        shadow={{ color, radius: WidgetMetrics.neonGlow.radius }}
      >{formatRate(bps)}</Text>
      <Spacer />
    </HStack>
  );
}

/**
 * 紧凑 KV 行：[icon] LABEL ......... VALUE
 * 供 Medium 右栏 / Small 底部使用。
 */
function MiniStat({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: string;
  color: Color;
}) {
  return (
    <HStack spacing={Spacing.xs + 2} frame={FULL_WIDTH}>
      <Text font={FontSize.caption}>{icon}</Text>
      <Text font={FontSize.caption} foregroundStyle={Neon.textDim}>{label}</Text>
      <Spacer />
      <Text
        font={FontSize.footnote}
        fontWeight="semibold"
        foregroundStyle={color}
        lineLimit={1}
        shadow={{ color, radius: WidgetMetrics.neonGlow.radius }}
      >{value}</Text>
    </HStack>
  );
}

/**
 * StatCard：Large 用的 3 列累计 + 种子卡。
 */
function StatCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: string;
  color: Color;
}) {
  const cornerRadius = Radius.md + 2;
  return (
    <VStack
      spacing={2}
      padding={{ horizontal: Spacing.sm, vertical: Spacing.sm }}
      background={Neon.surface}
      clipShape={{ type: 'rect', cornerRadius }}
      frame={{ minWidth: 0, maxWidth: "infinity" }}
      overlay={
        <RoundedRectangle
          cornerRadius={cornerRadius}
          stroke={{ shapeStyle: color, strokeStyle: { lineWidth: 1 } }}
        />
      }
    >
      <HStack spacing={Spacing.xs} frame={FULL_WIDTH}>
        <Text font={FontSize.caption}>{icon}</Text>
        <Text font={FontSize.caption - 1} foregroundStyle={Neon.textDim}>{label}</Text>
        <Spacer />
      </HStack>
      <HStack frame={FULL_WIDTH}>
        <Text
          font={FontSize.body}
          fontWeight="bold"
          foregroundStyle={color}
          lineLimit={1}
          shadow={{ color, radius: WidgetMetrics.neonGlow.radius }}
        >{value}</Text>
        <Spacer />
      </HStack>
    </VStack>
  );
}

/**
 * 双色叠加折线图：↓ cyan / ↑ magenta，共享坐标，MB/s。
 */
function DualLineChart({ history }: { history: HistoryPoint[] }) {
  const recent = history.slice(-MAX_POINTS);
  const toMB = (bps: number) => bps / (1024 * 1024);

  // 单个 LineChart + foregroundStyleBy 分组：硬保证只有 两条系列线。
  // 颜色由 chartForegroundStyleScale 映射，不与 foregroundStyle 同时设置（官方要求）。
  const marks: { label: string; value: number; series: 'DN' | 'UP' }[] = [];
  recent.forEach(p => {
    const label = formatTime(p.timestamp);
    marks.push({ label, value: toMB(p.downloadRate), series: 'DN' });
    marks.push({ label, value: toMB(p.uploadRate),   series: 'UP' });
  });

  return (
    <Chart
      chartYAxis="hidden"
      chartLegend="hidden"
      chartForegroundStyleScale={{ DN: Colors.download, UP: Colors.upload }}
      frame={{ maxWidth: "infinity", maxHeight: WidgetMetrics.chartHeight + 20 }}
    >
      <LineChart marks={marks.map(m => ({
        label: m.label,
        value: m.value,
        foregroundStyleBy: m.series,
      }))} />
    </Chart>
  );
}

// ============================================================
// SmallWidget：顶部客户端名+版本 / 中部双速率大号 / 底部累计+种子活跃
// ============================================================
function SmallWidget({ data, clientType }: { data: ClientData; clientType?: ClientType }) {
  const version = formatVersion(data.version);
  return (
    <VStack spacing={Spacing.xs} alignment="leading" frame={FULL_SIZE}>
      {/* 顶部：名字 + 版本 */}
      <HStack alignment="firstTextBaseline" frame={FULL_WIDTH}>
        <Text
          font={FontSize.footnote}
          fontWeight="bold"
          lineLimit={1}
          foregroundStyle={Neon.cyan}
          shadow={{ color: Neon.cyan, radius: WidgetMetrics.neonGlow.radius }}
        >{getClientName(clientType, true)}</Text>
        <Spacer />
        {version ? (
          <Text font={FontSize.caption - 1} foregroundStyle={Neon.textFade} lineLimit={1}>{version}</Text>
        ) : null}
      </HStack>

      <Spacer />

      {/* 中部：实时双速率大号 */}
      <VStack spacing={Spacing.xs} frame={FULL_WIDTH}>
        <RateLine direction="down" bps={data.downloadRate} />
        <RateLine direction="up" bps={data.uploadRate} />
      </VStack>

      <Spacer />

      {/* 底部：单行紧凑统计（累计 + 种子） */}
      <HStack spacing={Spacing.xs + 2} frame={FULL_WIDTH}>
        <Text font={FontSize.caption - 1} foregroundStyle={Neon.textDim} lineLimit={1}>
          ⬇{formatBytes(data.download)}
        </Text>
        <Text font={FontSize.caption - 1} foregroundStyle={Neon.textDim} lineLimit={1}>
          ⬆{formatBytes(data.upload)}
        </Text>
        <Spacer />
        <Text font={FontSize.caption - 1} foregroundStyle={Colors.seed} lineLimit={1}>
          🌱{data.seeds}
        </Text>
      </HStack>
    </VStack>
  );
}

// ============================================================
// MediumWidget：顶部标题+时间 / 左速率 · 右累计+种子+活跃
// ============================================================
function MediumWidget({ data, clientType }: { data: ClientData; clientType?: ClientType }) {
  const version = formatVersion(data.version);
  const time = formatTime(Date.now());

  return (
    <VStack spacing={Spacing.sm} alignment="leading" frame={FULL_SIZE}>
      {/* 顶部：标题 + 版本 + 时间 */}
      <HStack alignment="firstTextBaseline" spacing={Spacing.sm} frame={FULL_WIDTH}>
        <Text
          font="headline"
          fontWeight="bold"
          foregroundStyle={Neon.cyan}
          shadow={{ color: Neon.cyan, radius: WidgetMetrics.neonGlow.radius }}
        >{getClientName(clientType, false)}</Text>
        {version ? (
          <Text font={FontSize.caption - 1} foregroundStyle={Neon.textDim}>{version}</Text>
        ) : null}
        <Spacer />
        <Text font={FontSize.caption - 1} foregroundStyle={Neon.textFade}>{time}</Text>
      </HStack>

      {/* 主体：左速率 / 右 KV 列表 */}
      <HStack spacing={Spacing.md} frame={FULL_WIDTH}>
        {/* 左栏：双速率大号 */}
        <VStack spacing={Spacing.sm} alignment="leading" frame={FULL_WIDTH}>
          <RateLine direction="down" bps={data.downloadRate} />
          <RateLine direction="up" bps={data.uploadRate} />
        </VStack>

        {/* 右栏：累计 / 种子 / 活跃 */}
        <VStack spacing={Spacing.xs + 2} alignment="leading" frame={FULL_WIDTH}>
          <MiniStat icon="⬇" label="TOTAL" value={formatBytes(data.download)} color={Colors.download} />
          <MiniStat icon="⬆" label="TOTAL" value={formatBytes(data.upload)} color={Colors.upload} />
          <MiniStat icon="🌱" label="SEEDS" value={String(data.seeds)} color={Colors.seed} />
          <MiniStat icon="▶" label="ACTIVE" value={`↓${data.downloadingSeeds} ↑${data.uploadingSeeds}`} color={Colors.active} />
        </VStack>
      </HStack>
    </VStack>
  );
}

// ============================================================
// LargeWidget：顶部标题+时间 / 单图双线 / 速率标签 / 3 StatCard / 活跃 chip
// ============================================================
function LargeWidget({ data, history, clientType }: { data: ClientData; history: HistoryPoint[]; clientType?: ClientType }) {
  const version = formatVersion(data.version);
  const time = formatTime(Date.now());

  return (
    <VStack spacing={Spacing.md} alignment="leading" frame={FULL_WIDTH}>
      {/* 顶部：标题 + 版本 + 时间 */}
      <HStack alignment="firstTextBaseline" spacing={Spacing.sm} frame={FULL_WIDTH}>
        <Text
          font="title2"
          fontWeight="bold"
          foregroundStyle={Neon.cyan}
          shadow={{ color: Neon.cyan, radius: WidgetMetrics.neonGlow.radius + 2 }}
        >{getClientName(clientType, false)}</Text>
        {version ? (
          <Text font={FontSize.footnote - 1} foregroundStyle={Neon.textDim}>{version}</Text>
        ) : null}
        <Spacer />
        <Text font={FontSize.caption} foregroundStyle={Neon.textFade}>{time}</Text>
      </HStack>

      {/* 图表 + 速率标签 */}
      {history.length > 0 ? (
        <VStack spacing={Spacing.xs} frame={FULL_WIDTH}>
          <DualLineChart history={history} />
          <HStack spacing={Spacing.md} frame={FULL_WIDTH}>
            <HStack spacing={Spacing.xs}>
              <Text
                font={FontSize.footnote}
                fontWeight="bold"
                foregroundStyle={Colors.download}
                shadow={{ color: Colors.download, radius: WidgetMetrics.neonGlow.radius }}
              >↓</Text>
              <Text
                font={FontSize.footnote}
                fontWeight="semibold"
                foregroundStyle={Colors.download}
                shadow={{ color: Colors.download, radius: WidgetMetrics.neonGlow.radius }}
              >{formatRate(data.downloadRate)}</Text>
            </HStack>
            <HStack spacing={Spacing.xs}>
              <Text
                font={FontSize.footnote}
                fontWeight="bold"
                foregroundStyle={Colors.upload}
                shadow={{ color: Colors.upload, radius: WidgetMetrics.neonGlow.radius }}
              >↑</Text>
              <Text
                font={FontSize.footnote}
                fontWeight="semibold"
                foregroundStyle={Colors.upload}
                shadow={{ color: Colors.upload, radius: WidgetMetrics.neonGlow.radius }}
              >{formatRate(data.uploadRate)}</Text>
            </HStack>
            <Spacer />
            <Text font={FontSize.caption - 1} foregroundStyle={Neon.textFade}>
              {history.length} PTS
            </Text>
          </HStack>
        </VStack>
      ) : (
        <HStack frame={{ maxWidth: "infinity", maxHeight: WidgetMetrics.chartHeight }}>
          <Spacer />
          <Text font={FontSize.caption} foregroundStyle={Neon.textFade}>// NO HISTORY</Text>
          <Spacer />
        </HStack>
      )}

      {/* 3 列累计卡 */}
      <HStack spacing={Spacing.sm} frame={FULL_WIDTH}>
        <StatCard icon="⬇" label="DOWN" value={formatBytes(data.download)} color={Colors.download} />
        <StatCard icon="⬆" label="UP" value={formatBytes(data.upload)} color={Colors.upload} />
        <StatCard icon="🌱" label="SEEDS" value={String(data.seeds)} color={Colors.seed} />
      </HStack>

      {/* 活跃 chip 行 */}
      <HStack spacing={Spacing.md} frame={FULL_WIDTH}>
        <Text font={FontSize.caption} foregroundStyle={Neon.textDim}>▶ ACTIVE</Text>
        <Text
          font={FontSize.caption}
          fontWeight="semibold"
          foregroundStyle={Colors.download}
          shadow={{ color: Colors.download, radius: WidgetMetrics.neonGlow.radius }}
        >↓ {data.downloadingSeeds}</Text>
        <Text
          font={FontSize.caption}
          fontWeight="semibold"
          foregroundStyle={Colors.upload}
          shadow={{ color: Colors.upload, radius: WidgetMetrics.neonGlow.radius }}
        >↑ {data.uploadingSeeds}</Text>
        <Spacer />
      </HStack>
    </VStack>
  );
}

export function Display({ data, history = [], size = 'large', clientType = 'qb' }: DisplayProps) {
  if (size === 'small') return <SmallWidget data={data} clientType={clientType} />;
  if (size === 'medium') return <MediumWidget data={data} clientType={clientType} />;
  return <LargeWidget data={data} history={history} clientType={clientType} />;
}
