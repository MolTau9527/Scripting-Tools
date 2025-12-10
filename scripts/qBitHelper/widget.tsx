import { VStack, Text, Widget } from "scripting";
import { QbDisplay } from './utils/QbDisplay';
import { QbConfigData } from './pages/SettingsPage';
import { fetchQbData, HistoryPoint, STORAGE_KEY, HISTORY_KEY, MAX_HISTORY_POINTS, DEFAULT_REFRESH_MINUTES } from './utils/qbApi';

async function main() {
  const config = Storage.get<QbConfigData>(STORAGE_KEY);
  
  if (!config) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Text>请先在应用中配置</Text>
      </VStack>
    );
    return;
  }

  const data = await fetchQbData(config);
  
  if (!data) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Text>获取数据失败</Text>
      </VStack>
    );
    return;
  }

  // 获取历史数据
  const now = Date.now();
  let history = Storage.get<HistoryPoint[]>(HISTORY_KEY) || [];
  
  // 添加当前数据点
  history = [...history, {
    timestamp: now,
    uploadRate: data.uploadRate,
    downloadRate: data.downloadRate
  }].slice(-MAX_HISTORY_POINTS);
  
  // 保存历史数据
  Storage.set(HISTORY_KEY, history);

  const refreshMinutes = config.refreshMinutes ?? DEFAULT_REFRESH_MINUTES;
  
  const showChart = Widget.family === 'systemLarge';
  
  Widget.present(
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16}>
      <QbDisplay data={data} history={history} showChart={showChart} />
    </VStack>,
    refreshMinutes === 0
      ? undefined
      : {
          policy: "after",
          date: new Date(Date.now() + 1000 * 60 * refreshMinutes)
        }
  );
}

main();