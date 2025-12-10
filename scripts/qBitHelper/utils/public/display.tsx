import { VStack, HStack, Text, Chart, LineChart, Spacer } from "scripting";
import { ClientData, HistoryPoint } from './types';

interface DisplayProps {
  data: ClientData;
  history?: HistoryPoint[];
  showChart?: boolean;
  clientType?: 'qb' | 'tr';
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
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
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

function RateChart({ history, data }: { history: HistoryPoint[]; data: ClientData }) {
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
        <HStack frame={{ maxWidth: "infinity" }}>
          <Text font={11} opacity={0.7}>下载速率</Text>
          <Spacer />
          <Text font={9} opacity={0.5}>数据点: {history.length}</Text>
        </HStack>
        <Chart frame={{ maxHeight: 80 }}>
          <LineChart marks={toChartMarks(history, 'downloadRate')} foregroundStyle="red" />
        </Chart>
        <HStack frame={{ maxWidth: "infinity" }}>
          <Text font={11} opacity={0.7}>上传速率</Text>
          <Spacer />
          <Text font={9} opacity={0.5}>最后更新: {formatTime(Date.now())}</Text>
        </HStack>
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

const getClientName = (clientType?: 'qb' | 'tr', large?: boolean) => {
  if (clientType === 'tr') {
    return large ? 'Transmission' : 'TR';
  }
  return large ? 'qBittorrent' : 'qBit';
};

export function Display({ data, history = [], showChart = true, clientType = 'qb' }: DisplayProps) {
  const version = formatVersion(data.version);
  const clientName = getClientName(clientType, showChart);

  return (
    <VStack spacing={showChart ? 12 : 8} frame={{ maxWidth: "infinity" }}>
      <HStack alignment="center" spacing={8}>
        <Text font={showChart ? "title2" : "headline"}>{clientName}</Text>
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

// 保持向后兼容的别名
export { Display as QbDisplay };
