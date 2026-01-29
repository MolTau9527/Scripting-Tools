import { Image, ZStack, Text, VStack, Widget } from "scripting";
import { fetchACGImage } from "./utils/api";
import { loadConfig } from "./utils/storage";
import { loadAndCacheImage } from "./utils/imageCache";
import { DEFAULT_REFRESH_SECONDS, MIN_REFRESH_INTERVAL } from "./utils/utils";
import { ACGConfig } from "./utils/types";

async function main() {
  const config = loadConfig();
  let imageFilePath: string | null = null;

  try {
    const imageId = config?.imageId ? parseInt(config.imageId, 10) : 0;
    const imageUrl = await fetchACGImage(imageId || Math.floor(Math.random() * 9999) + 1);

    // 下载图片并保存到本地（会自动清理旧缓存）
    imageFilePath = await loadAndCacheImage(imageUrl);
  } catch (error) {
    console.error("加载ACG图片失败:", error);
  }

  const reloadPolicy = getReloadPolicy(config);

  Widget.present(
    <ZStack>
      {imageFilePath ? (
        <Image
          filePath={imageFilePath}
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
    reloadPolicy
  );
}

function getReloadPolicy(
  config: ACGConfig | null
): { policy: "after"; date: Date } | { policy: "atEnd" } {
  if (!config || config.isAutoRefreshing !== 1 || !config.refreshInterval) {
    return { policy: "atEnd" };
  }

  const interval = parseInt(config.refreshInterval, 10);
  if (isNaN(interval) || interval < MIN_REFRESH_INTERVAL) {
    return {
      policy: "after",
      date: new Date(Date.now() + DEFAULT_REFRESH_SECONDS * 1000)
    };
  }

  return {
    policy: "after",
    date: new Date(Date.now() + interval * 1000)
  };
}

main();
