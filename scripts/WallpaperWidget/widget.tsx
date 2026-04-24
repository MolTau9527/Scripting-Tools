import { Image, ZStack, Text, VStack, Widget } from "scripting";
import { fetchACGImage } from "./utils/api";
import { loadConfig } from "./utils/storage";
import { loadAndCacheImage, getLatestCachedImage } from "./utils/imageCache";
import {
  DEFAULT_REFRESH_SECONDS,
  MIN_REFRESH_INTERVAL,
  generateRandomId,
} from "./utils/utils";
import { ACGConfig } from "./utils/types";

async function main() {
  const config = loadConfig();
  let imageFilePath: string | null = null;

  try {
    const raw = parseInt(config?.imageId ?? "", 10);
    const id = Number.isFinite(raw) && raw > 0 ? raw : generateRandomId();
    const imageUrl = await fetchACGImage(id);

    // 下载图片并保存到本地（会自动清理旧缓存）
    imageFilePath = await loadAndCacheImage(imageUrl);
  } catch (error) {
    console.error("加载ACG图片失败:", error);
  }

  // 下载失败时回退到最近一张缓存，避免直接显示"加载失败"
  if (!imageFilePath) {
    imageFilePath = getLatestCachedImage();
  }

  // 正常情况按用户配置；加载完全失败（无图片可显示）时强制 5 分钟后重试，
  // 避免首次无缓存 + 关闭自动刷新时永远停在“加载失败”。
  const reloadPolicy = imageFilePath
    ? getReloadPolicy(config)
    : { policy: "after" as const, date: new Date(Date.now() + 5 * 60 * 1000) };

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
  if (!config || !config.isAutoRefreshing || !config.refreshInterval) {
    return { policy: "atEnd" };
  }

  const interval = parseInt(config.refreshInterval, 10);
  const seconds =
    Number.isFinite(interval) && interval >= MIN_REFRESH_INTERVAL
      ? interval
      : DEFAULT_REFRESH_SECONDS;

  return {
    policy: "after",
    date: new Date(Date.now() + seconds * 1000),
  };
}

main();
