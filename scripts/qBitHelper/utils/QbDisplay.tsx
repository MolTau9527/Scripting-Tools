import { VStack, HStack, Text, Chart, LineChart, Spacer } from "scripting";
import { QbData, HistoryPoint } from './qbApi';

interface QbDisplayProps {
  data: QbData;
  history?: HistoryPoint[];
  showChart?: boolean;
}

const SIZES = ['B', 'KB', 'MB', 'GB', 'TB'];

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${SIZES[i]}`;
};

const formatRate = (bps: number) => `${formatBytes(bps)}/s`;

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const toChartMarks = (history: HistoryPoint[], key: 'uploadRate' | 'downloadRate') =>
  history.map(p => ({ label: formatTime(p.timestamp), value: p[key] / (1024 * 1024) }));

const formatVersion = (v?: string) => v ? (v.toLowerCase().startsWith('v') ? v : `v${v}`) : undefined;

type TextColor = "green" | "red" | "blue";

function StatItem({ label, value, color, large }: { label: string; value: string; color: TextColor; large: boolean }) {
  return (
    <VStack spacing={4} alignment="center" frame={{ minWidth: large ? 65 : 50 }}>
      <Text font={large ? 11 : 9} opacity={0.7}>{label}</Text>
      <Text font={large ? "title3" : "subheadline"} foregroundStyle={color}>{value}</Text>
    </VStack>
  );
}

function RateChart({ history, data }: { history: HistoryPoint[]; data: QbData }) {
  return (
    <VStack spacing={6} frame={{ maxWidth: "infinity" }}>
      <HStack frame={{ maxWidth: "infinity" }}>
        <Text font="headline" opacity={0.8}>速率 (MB/s)</Text>
        <Spacer />
        <VStack spacing={4} alignment="trailing">
          <HStack spacing={4}>
            <Text font={10} opacity={0.7}>下载: {formatRate(data.downloadRate)}</Text>
            <Text font={10} foregroundStyle="red">●</Text>
          </HStack>
          <HStack spacing={4}>
            <Text font={10} opacity={0.7}>上传: {formatRate(data.uploadRate)}</Text>
            <Text font={10} foregroundStyle="green">●</Text>
          </HStack>
        </VStack>
      </HStack>
      <VStack spacing={8}>
        <Text font={11} opacity={0.7}>下载速率</Text>
        <Chart frame={{ maxHeight: 80 }}>
          <LineChart marks={toChartMarks(history, 'downloadRate')} foregroundStyle="red" />
        </Chart>
        <Text font={11} opacity={0.7}>上传速率</Text>
        <Chart frame={{ maxHeight: 80 }}>
          <LineChart marks={toChartMarks(history, 'uploadRate')} foregroundStyle="green" />
        </Chart>
      </VStack>
      <HStack frame={{ maxWidth: "infinity" }} spacing={20}>
        <Text font={10} opacity={0.6}>正在下载: {data.downloadingSeeds}</Text>
        <Text font={10} opacity={0.6}>正在上传: {data.uploadingSeeds}</Text>
      </HStack>
    </VStack>
  );
}

export function QbDisplay({ data, history = [], showChart = true }: QbDisplayProps) {
  const version = formatVersion(data.version);

  return (
    <VStack spacing={showChart ? 12 : 8} frame={{ maxWidth: "infinity" }}>
      <HStack alignment="center" spacing={8}>
        <Text font={showChart ? "title2" : "headline"}>{showChart ? "qBittorrent" : "qBit"}</Text>
        {version ? <Text font={showChart ? 12 : 9} opacity={0.6}>{version}</Text> : null}
      </HStack>

      <HStack spacing={showChart ? 20 : 12} frame={{ maxWidth: "infinity" }}>
        <StatItem label="上传量" value={formatBytes(data.upload)} color="green" large={showChart} />
        <StatItem label="下载量" value={formatBytes(data.download)} color="red" large={showChart} />
        <StatItem label="种子数" value={String(data.seeds)} color="blue" large={showChart} />
      </HStack>

      {showChart ? (
        <RateChart history={history} data={data} />
      ) : (
        <HStack frame={{ maxWidth: "infinity" }} spacing={12}>
          <Text font={9} opacity={0.6}>正在下载: {data.downloadingSeeds}</Text>
          <Text font={9} opacity={0.6}>正在上传: {data.uploadingSeeds}</Text>
        </HStack>
      )}
    </VStack>
  );
}
