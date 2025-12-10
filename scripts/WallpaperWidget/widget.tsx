import { Image, ZStack, Text, VStack, Widget } from "scripting";
import { fetchACGImage } from "./util/api";
import { loadConfig } from "./util/storage";
import { DEFAULT_REFRESH_SECONDS, MIN_REFRESH_INTERVAL } from "./util/utils";
import { ACGConfig } from "./util/types";

async function main() {
  const config = loadConfig();
  let imageUrl = "";

  try {
    const imageId = config?.imageId ? parseInt(config.imageId, 10) : 0;
    imageUrl = await fetchACGImage(imageId || Math.floor(Math.random() * 9999) + 1);
  } catch (error) {
    console.error("加载ACG图片失败:", error);
  }

  // 计算刷新间隔
  const refreshSeconds = getRefreshInterval(config);

  Widget.present(
    <ZStack>
      {imageUrl ? (
        <Image
          imageUrl={imageUrl}
          resizable
          aspectRatio={{ value: null, contentMode: "fill" }}
        />
      ) : (
        <VStack alignment="center" frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
          <Image
            systemName="photo"
            font={40}
            foregroundStyle={{ light: "#C7C7CC", dark: "#48484A" }}
          />
          <Text
            font={12}
            foregroundStyle={{ light: "#8E8E93", dark: "#636366" }}
            padding={{ top: 8 }}
          >
            加载失败
          </Text>
        </VStack>
      )}
    </ZStack>,
    {
      policy: "after",
      date: new Date(Date.now() + refreshSeconds * 1000)
    }
  );
}

function getRefreshInterval(config: ACGConfig | null): number {
  if (!config || config.isAutoRefreshing !== 1 || !config.refreshInterval) {
    return DEFAULT_REFRESH_SECONDS;
  }

  const interval = parseInt(config.refreshInterval, 10);
  if (isNaN(interval) || interval < MIN_REFRESH_INTERVAL) {
    return DEFAULT_REFRESH_SECONDS;
  }

  return interval;
}

main();
