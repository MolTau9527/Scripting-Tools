import { Image, ZStack, Text, VStack, Widget } from "scripting";
import { fetchACGImage, getFallbackImageUrl } from "./utils/api";
import { loadConfig } from "./utils/storage";
import { loadAndCacheImage, getLatestCachedImage } from "./utils/imageCache";
import {
  DEFAULT_REFRESH_SECONDS,
  MIN_REFRESH_INTERVAL,
  generateRandomId,
} from "./utils/utils";
import { ACGConfig } from "./utils/types";

/** 一张图 404 就换一张，最多试这么多次 */
const MAX_IMAGE_ATTEMPTS = 5;

async function main() {
  const config = loadConfig();
  let imageFilePath: string | null = null;

  // 用户指定了 ID 就只试这一个；没指定就随机，404 了换下一个随机 ID 再试
  const fixedId = (() => {
    const raw = parseInt(config?.imageId ?? "", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  })();

  for (let attempt = 1; attempt <= MAX_IMAGE_ATTEMPTS; attempt++) {
    const id = fixedId ?? generateRandomId();
    try {
      const imageUrl = await fetchACGImage(id);
      // 下载图片并保存到本地（会自动清理旧缓存）
      imageFilePath = await loadAndCacheImage(imageUrl);
      if (imageFilePath) break;
      console.error(`第 ${attempt} 次下载失败(null)，换一张再试`);
    } catch (error) {
      console.error(`第 ${attempt} 次加载失败:`, error);
    }
    // 指定了 ID 就别换了，只试一次
    if (fixedId) break;
  }

  // 主源全挂（接口给的地址 404），按固定顺序走备用直链图源再试两张：
  // 第 1 次 dmoe（直连），第 2 次 mwm，两个都试到、不重复抽同一个
  if (!imageFilePath) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const fallbackUrl = getFallbackImageUrl(attempt - 1);
        imageFilePath = await loadAndCacheImage(fallbackUrl);
        if (imageFilePath) break;
        console.error(`备用图源第 ${attempt} 次下载失败，换一个再试`);
      } catch (error) {
        console.error(`备用图源第 ${attempt} 次失败:`, error);
      }
    }
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
