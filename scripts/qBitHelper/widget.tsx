import { VStack, Text, Widget } from "scripting";
import { Display, ConfigData, STORAGE_KEY, DEFAULT_REFRESH_MINUTES, updateHistory } from './utils/public';
import { fetchData } from './utils/api';

async function main() {
  const config = Storage.get<ConfigData>(STORAGE_KEY);

  if (!config) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Text>请先在应用中配置</Text>
      </VStack>
    );
    return;
  }

  const data = await fetchData(config);

  if (!data) {
    Widget.present(
      <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16} alignment="center">
        <Text>获取数据失败</Text>
      </VStack>
    );
    return;
  }

  const history = updateHistory(data);
  const refreshMinutes = config.refreshMinutes ?? DEFAULT_REFRESH_MINUTES;
  const showChart = Widget.family === 'systemLarge';
  const clientType = config.clientType || 'qb';

  Widget.present(
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={16}>
      <Display data={data} history={history} showChart={showChart} clientType={clientType} />
    </VStack>,
    refreshMinutes > 0
      ? {
          policy: "after",
          date: new Date(Date.now() + 1000 * 60 * refreshMinutes)
        }
      : undefined
  );
}

main();
