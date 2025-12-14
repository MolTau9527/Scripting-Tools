import { VStack, HStack, Text, Chart, LineChart, Spacer } from "scripting";
import { ClientData, HistoryPoint } from './types';

type TextColor = "systemGreen" | "systemRed" | "systemBlue";
const FULL_WIDTH = { maxWidth: "infinity" as const };
const FULL_SIZE = { maxWidth: "infinity" as const, maxHeight: "infinity" as const };

interface DisplayProps {
  data: ClientData;
  history?: HistoryPoint[];
  size?: 'small' | 'medium' | 'large';
  clientType?: 'qb' | 'tr';
}

const SIZES = ['B', 'KB', 'MB', 'GB', 'TB'];
const MAX_POINTS = 10;

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${SIZES[i]}`;
};

const formatRate = (bps: number) => `${formatBytes(bps)}/s`;

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const formatVersion = (v?: string) => v ? (v.toLowerCase().startsWith('v') ? v : `v${v}`) : undefined;

const getClientName = (clientType?: 'qb' | 'tr') => {
  return clientType === 'tr' ? 'Transmission' : 'qBittorrent';
};

function StatCard({ icon, label, value, color, compact }: { icon: string; label: string; value: string; color: TextColor; compact?: boolean }) {
  return (
    <HStack spacing={compact ? 6 : 8} padding={{ horizontal: 10, vertical: 8 }} background="secondarySystemBackground" clipShape={{ type: 'rect', cornerRadius: 10 }} frame={{ minWidth: 0, maxWidth: "infinity" }}>
      <Text font={14}>{icon}</Text>
      <VStack spacing={2} alignment="leading" frame={{ minWidth: 0, maxWidth: "infinity" }}>
        <Text font={9} opacity={0.5}>{label}</Text>
        <Text font={compact ? 13 : 12} fontWeight="semibold" foregroundStyle={color}>{value}</Text>
      </VStack>
    </HStack>
  );
}

function RateChart({ history, data, rateKey, color, label }: {
  history: HistoryPoint[]; data: ClientData; rateKey: 'uploadRate' | 'downloadRate'; color: TextColor; label: string;
}) {
  const recentHistory = history.slice(-MAX_POINTS);
  const values = recentHistory.map(p => p[rateKey] / (1024 * 1024));
  const minY = Math.min(...values);

  return (
    <VStack spacing={4} frame={FULL_WIDTH}>
      <HStack frame={FULL_WIDTH}>
        <Text font={11} opacity={0.7}>{label}</Text>
        <Spacer />
        <Text font={10} foregroundStyle={color}>{formatRate(data[rateKey])}</Text>
      </HStack>
      <Chart chartYAxis="hidden" frame={{ maxHeight: 80 }}>
        <LineChart marks={recentHistory.map((p, idx) => ({
          label: formatTime(p.timestamp), value: values[idx] - minY, foregroundStyle: color,
          shadow: { color, radius: 7, y: 7 }
        }))} />
      </Chart>
      <HStack frame={FULL_WIDTH}>
        <Text font={9} opacity={0.5}>数据点: {history.length}</Text>
        <Spacer />
        <Text font={9} opacity={0.5}>更新: {formatTime(Date.now())}</Text>
      </HStack>
    </VStack>
  );
}

function SmallWidget({ data, clientType }: { data: ClientData; clientType?: 'qb' | 'tr' }) {
  return (
    <VStack spacing={6} alignment="leading" frame={FULL_SIZE}>
      <HStack alignment="center" frame={FULL_WIDTH}>
        <Text font={14} fontWeight="bold">{getClientName(clientType)}</Text>
        <Spacer />
        <Text font={11} opacity={0.5}>🌱{data.seeds}</Text>
      </HStack>
      <Spacer />
      <HStack frame={FULL_WIDTH}>
        <Text font={13}>⬆️</Text>
        <Text font={12} opacity={0.6}>上传</Text>
        <Spacer />
        <Text font={14} fontWeight="semibold" foregroundStyle="systemGreen">{formatBytes(data.upload)}</Text>
      </HStack>
      <HStack frame={FULL_WIDTH}>
        <Text font={13}>⬇️</Text>
        <Text font={12} opacity={0.6}>下载</Text>
        <Spacer />
        <Text font={14} fontWeight="semibold" foregroundStyle="systemRed">{formatBytes(data.download)}</Text>
      </HStack>
      <Spacer />
      <HStack frame={FULL_WIDTH}>
        <Spacer />
        <Text font={9} opacity={0.4}>{formatTime(Date.now())}</Text>
        <Spacer />
      </HStack>
    </VStack>
  );
}

function MediumWidget({ data, clientType }: { data: ClientData; clientType?: 'qb' | 'tr' }) {
  const version = formatVersion(data.version);
  const time = formatTime(Date.now());
  return (
    <VStack spacing={8} alignment="center" frame={FULL_WIDTH}>
      <HStack alignment="center" frame={FULL_WIDTH}>
        <Text font={9} opacity={0}>{time}</Text>
        <Spacer />
        <HStack spacing={6}>
          <Text font="headline" fontWeight="bold">{getClientName(clientType)}</Text>
          {version ? <Text font={10} opacity={0.5}>{version}</Text> : null}
        </HStack>
        <Spacer />
        <Text font={9} opacity={0.4}>{time}</Text>
      </HStack>
      <HStack spacing={8} frame={FULL_WIDTH}>
        <VStack spacing={8} frame={FULL_WIDTH}>
          <StatCard icon="⬆️" label="上传" value={formatBytes(data.upload)} color="systemGreen" compact />
          <StatCard icon="⬇️" label="下载" value={formatBytes(data.download)} color="systemRed" compact />
        </VStack>
        <VStack spacing={8} frame={FULL_WIDTH}>
          <StatCard icon="🌱" label="种子" value={String(data.seeds)} color="systemBlue" compact />
          <StatCard icon="📊" label="活跃" value={`↓${data.downloadingSeeds} ↑${data.uploadingSeeds}`} color="systemBlue" compact />
        </VStack>
      </HStack>
    </VStack>
  );
}

function LargeWidget({ data, history, clientType }: { data: ClientData; history: HistoryPoint[]; clientType?: 'qb' | 'tr' }) {
  const version = formatVersion(data.version);
  const stats = [
    { label: "上传量", value: formatBytes(data.upload), color: "systemGreen" as TextColor },
    { label: "下载量", value: formatBytes(data.download), color: "systemRed" as TextColor },
    { label: "种子数", value: String(data.seeds), color: "systemBlue" as TextColor }
  ];
  return (
    <VStack spacing={12} alignment="center" frame={FULL_WIDTH}>
      <HStack alignment="center" spacing={8}>
        <Text font="title2">{getClientName(clientType)}</Text>
        {version ? <Text font={12} opacity={0.6}>{version}</Text> : null}
      </HStack>
      <HStack spacing={20}>
        {stats.map(s => (
          <VStack key={s.label} spacing={4} alignment="center" frame={{ minWidth: 65 }}>
            <Text font={11} opacity={0.6}>{s.label}</Text>
            <Text font="title3" fontWeight="semibold" foregroundStyle={s.color}>{s.value}</Text>
          </VStack>
        ))}
      </HStack>
      {history.length > 0 ? (
        <VStack spacing={12} frame={FULL_WIDTH}>
          <RateChart history={history} data={data} rateKey="downloadRate" color="systemRed" label="下载速率" />
          <RateChart history={history} data={data} rateKey="uploadRate" color="systemGreen" label="上传速率" />
          <HStack spacing={20}>
            <Text font={10} opacity={0.6}>正在下载: {data.downloadingSeeds}</Text>
            <Text font={10} opacity={0.6}>正在上传: {data.uploadingSeeds}</Text>
          </HStack>
        </VStack>
      ) : null}
    </VStack>
  );
}

export function Display({ data, history = [], size = 'large', clientType = 'qb' }: DisplayProps) {
  if (size === 'small') return <SmallWidget data={data} clientType={clientType} />;
  if (size === 'medium') return <MediumWidget data={data} clientType={clientType} />;
  return <LargeWidget data={data} history={history} clientType={clientType} />;
}

export { Display as QbDisplay };