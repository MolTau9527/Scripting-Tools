import { 
  useObservable, 
  VStack, 
  HStack, 
  Image, 
  Text, 
  Button, 
  TextField, 
  useEffect, 
  Widget
} from "scripting";
import { fetchACGImage } from "./api";
import { loadConfig, saveConfig } from "./storage";
import { validateId, validateInterval, generateRandomId, MIN_REFRESH_INTERVAL } from "./utils";

// 常量配置
const SUCCESS_MESSAGE_DURATION = 2000;
const FRAME_CONSTRAINTS = {
  maxWidth: 600,
  imageMaxHeight: 500,
  textFieldWidth: 150,
  urlMaxWidth: 400
};

export function ACGPhotoWidget() {
  // 状态管理
  const photoUrl = useObservable<string>("");
  const isLoading = useObservable<boolean>(false);
  const error = useObservable<string>("");
  const successMsg = useObservable<string>("");
  const imageId = useObservable<string>("");
  const idError = useObservable<string>("");
  const refreshInterval = useObservable<string>("");
  const intervalError = useObservable<string>("");
  const isAutoRefreshing = useObservable<boolean>(false);

  // 初始化配置
  useEffect(() => {
    const config = loadConfig();
    if (config) {
      imageId.setValue(config.imageId || "");
      refreshInterval.setValue(config.refreshInterval || "");
      isAutoRefreshing.setValue(config.isAutoRefreshing === 1);
    }
  }, []);

  // 自动刷新定时器
  useEffect(() => {
    if (!isAutoRefreshing.value || !refreshInterval.value) {
      BackgroundKeeper.stopKeepAlive();
      return;
    }

    const validation = validateInterval(refreshInterval.value);
    if (!validation.valid || !validation.value) {
      return;
    }

    BackgroundKeeper.keepAlive();
    
    const executeRefresh = () => {
      loadPhoto();
      Widget.reloadAll();
    };
    
    const intervalMs = validation.value * 1000;
    let timerId: number | null = null;
    
    const runInterval = () => {
      executeRefresh();
      timerId = setTimeout(runInterval, intervalMs);
    };
    
    timerId = setTimeout(runInterval, intervalMs);

    return () => {
      if (timerId !== null) clearTimeout(timerId);
      BackgroundKeeper.stopKeepAlive();
    };
  }, [isAutoRefreshing.value, refreshInterval.value]);

  // 加载图片
  const loadPhoto = async () => {
    const validation = validateId(imageId.value);
    if (!validation.valid) {
      idError.setValue(validation.error || "ID 无效");
      return;
    }

    try {
      isLoading.setValue(true);
      error.setValue("");
      idError.setValue("");

      const effectiveId = validation.value || generateRandomId();
      const url = await fetchACGImage(effectiveId);
      photoUrl.setValue(url);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "未知错误，请稍后重试";
      error.setValue(errorMsg);
      photoUrl.setValue("");
    } finally {
      isLoading.setValue(false);
    }
  };

  // 保存配置
  const handleSaveConfig = () => {
    const validation = validateInterval(refreshInterval.value);
    if (!validation.valid) {
      intervalError.setValue(validation.error || "请输入有效的刷新间隔");
      return;
    }

    intervalError.setValue("");
    const shouldEnable = validation.shouldEnable || false;
    isAutoRefreshing.setValue(shouldEnable);
    
    saveConfig({
      imageId: imageId.value,
      refreshInterval: refreshInterval.value,
      isAutoRefreshing: shouldEnable ? 1 : 0
    });
    
    const message = shouldEnable 
      ? "✅ 设置已保存，定时刷新已启动！" 
      : "✅ 设置已保存！";
    successMsg.setValue(message);
    setTimeout(() => successMsg.setValue(""), SUCCESS_MESSAGE_DURATION);
  };

  // 随机换图
  const handleRandomImage = () => {
    imageId.setValue("");
    idError.setValue("");
    loadPhoto();
  };

  // 输入验证处理
  const handleIdChange = (value: string) => {
    imageId.setValue(value);
    if (value.trim()) {
      const validation = validateId(value);
      idError.setValue(validation.valid ? "" : validation.error || "");
    } else {
      idError.setValue("");
    }
  };

  const handleIntervalChange = (value: string) => {
    refreshInterval.setValue(value);
    if (value.trim()) {
      const validation = validateInterval(value);
      intervalError.setValue(validation.valid ? "" : validation.error || "");
    } else {
      intervalError.setValue("");
    }
  };

  return (
    <VStack 
      spacing={24} 
      alignment="center" 
      padding={24} 
      frame={{ maxWidth: FRAME_CONSTRAINTS.maxWidth }}
    >
      {/* 标题区域 */}
      <VStack spacing={15} alignment="center">
        <Text font={28}>🎨 ACG 每日图片</Text>
        <Text font={14} opacity={0.7}>每天一张精选二次元壁纸</Text>
      </VStack>

      {/* 图片ID输入 */}
      <VStack spacing={10} alignment="center">
        <HStack spacing={12} alignment="center">
          <Text font={14}>图片 ID:</Text>
          <TextField
            title=""
            prompt="留空则随机"
            value={imageId.value}
            onChanged={handleIdChange}
            keyboardType="numberPad"
            frame={{ width: FRAME_CONSTRAINTS.textFieldWidth }}
          />
        </HStack>
        <Text font={12} opacity={idError.value ? 1 : 0.6}>
          {idError.value || "💡 输入 1-9999 的数字，或留空随机获取"}
        </Text>
      </VStack>

      {/* 刷新间隔输入 */}
      <VStack spacing={10} alignment="center">
        <HStack spacing={12} alignment="center">
          <Text font={14}>刷新间隔:</Text>
          <TextField
            title=""
            prompt="秒数(≥5)"
            value={refreshInterval.value}
            onChanged={handleIntervalChange}
            keyboardType="numberPad"
            frame={{ width: FRAME_CONSTRAINTS.textFieldWidth }}
          />
        </HStack>
        <Text font={12} opacity={intervalError.value ? 1 : 0.6}>
          {intervalError.value || `⏱️ 输入≥${MIN_REFRESH_INTERVAL}秒启用定时刷新，<${MIN_REFRESH_INTERVAL}秒关闭刷新`}
        </Text>
      </VStack>

      {/* 操作按钮 */}
      <VStack spacing={12} alignment="center">
        <HStack spacing={16}>
          <Button title="🔍 加载图片" action={loadPhoto} />
          <Button title="🎲 随机换一张" action={handleRandomImage} />
        </HStack>
        <Button title="💾 保存设置" action={handleSaveConfig} />
        
        {successMsg.value ? (
          <Text font={14} opacity={0.9}>{successMsg.value}</Text>
        ) : null}
        
        {isAutoRefreshing.value && (
          <Text font={12} opacity={0.8}>
            🔄 定时刷新已启动，每 {refreshInterval.value} 秒刷新一次
          </Text>
        )}
      </VStack>

      {/* 内容展示区域 */}
      {renderContent({
        isLoading: isLoading.value,
        error: error.value,
        photoUrl: photoUrl.value,
        onRetry: loadPhoto
      })}
    </VStack>
  );
}

// 内容渲染组件
function renderContent({ 
  isLoading, 
  error, 
  photoUrl, 
  onRetry 
}: {
  isLoading: boolean;
  error: string;
  photoUrl: string;
  onRetry: () => void;
}) {
  if (isLoading) return (
    <VStack spacing={12} alignment="center" padding={40}>
      <Text font={16}>⏳ 正在加载精美壁纸...</Text>
    </VStack>
  );

  if (error) return (
    <VStack spacing={16} alignment="center" frame={{ minHeight: 320 }} padding={24}>
      <Text font={16}>❌ {error}</Text>
      <Button title="🔄 重新加载" action={onRetry} />
    </VStack>
  );

  if (photoUrl) return (
    <VStack spacing={12} alignment="center">
      <Image imageUrl={photoUrl} resizable frame={{ maxHeight: FRAME_CONSTRAINTS.imageMaxHeight }} />
      <Text font={12} opacity={0.5}>✨ 图片加载成功！可点击"随机换一张"查看更多</Text>
      <VStack spacing={8} alignment="center" padding={12}>
        <Text font={12} opacity={0.7}>图片链接:</Text>
        <HStack spacing={8} alignment="center">
          <Text font={11} opacity={0.6} frame={{ maxWidth: FRAME_CONSTRAINTS.urlMaxWidth }} lineLimit={1}>
            {photoUrl}
          </Text>
          <Button title="📋 复制" action={() => Pasteboard.setString(photoUrl)} />
        </HStack>
      </VStack>
    </VStack>
  );

  return (
    <VStack spacing={12} alignment="center" padding={40}>
      <Text font={16} opacity={0.6}>📷 点击上方按钮开始浏览</Text>
    </VStack>
  );
}
