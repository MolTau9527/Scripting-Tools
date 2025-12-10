import {
  useObservable,
  VStack,
  HStack,
  Image,
  Text,
  Button,
  NavigationStack,
  ScrollView,
  useEffect
} from "scripting";
import { fetchACGImage } from "./api";
import { loadConfig } from "./storage";
import { generateRandomId } from "./utils";

interface PreviewHomeProps {
  onClose: () => void;
  onSettings: () => void;
}

export function PreviewHome({ onClose, onSettings }: PreviewHomeProps) {
  const photoUrl = useObservable<string>("");
  const isLoading = useObservable<boolean>(true);
  const currentId = useObservable<number>(0);
  const hasError = useObservable<boolean>(false);

  // 加载图片
  const loadImage = async (useRandom: boolean = false) => {
    try {
      isLoading.setValue(true);
      hasError.setValue(false);

      let id: number;
      if (useRandom) {
        id = generateRandomId();
      } else {
        const config = loadConfig();
        const idStr = config?.imageId;
        id = idStr ? parseInt(idStr, 10) : generateRandomId();
        if (isNaN(id) || id <= 0) {
          id = generateRandomId();
        }
      }

      currentId.setValue(id);
      const url = await fetchACGImage(id);
      photoUrl.setValue(url);
    } catch (err) {
      console.error("加载图片失败:", err);
      hasError.setValue(true);
      photoUrl.setValue("");
    } finally {
      isLoading.setValue(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadImage(false);
  }, []);

  // 刷新当前图片
  const handleRefresh = () => {
    loadImage(false);
  };

  // 随机换图
  const handleRandom = () => {
    loadImage(true);
  };

  return (
    <NavigationStack>
      <ScrollView
        navigationTitle="壁纸预览"
        navigationBarTitleDisplayMode="inline"
        background={{ light: "#F2F2F7", dark: "#000000" }}
        toolbar={{
          topBarLeading: (
            <Button title="关闭" action={onClose} />
          ),
          topBarTrailing: (
            <HStack spacing={16}>
              <Image
                systemName="arrow.clockwise"
                font={17}
                foregroundStyle="#007AFF"
                onTapGesture={handleRefresh}
              />
              <Image
                systemName="gearshape"
                font={17}
                foregroundStyle="#007AFF"
                onTapGesture={onSettings}
              />
            </HStack>
          )
        }}
      >
        <VStack spacing={24} alignment="center" padding={{ top: 20, horizontal: 16, bottom: 40 }}>

          {/* 当前图片 ID */}
          {currentId.value > 0 && !isLoading.value && (
            <HStack spacing={8} alignment="center">
              <Image
                systemName="number"
                font={14}
                foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" }}
              />
              <Text font={14} foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" }}>
                当前图片 ID: {currentId.value}
              </Text>
            </HStack>
          )}

          {/* 主预览区域 */}
          <VStack
            spacing={0}
            background={{ light: "#FFFFFF", dark: "#1C1C1E" }}
            clipShape={{ type: "rect", cornerRadius: 12 }}
            frame={{ maxWidth: 400 }}
          >
            {isLoading.value ? (
              <VStack
                frame={{ height: 300 }}
                alignment="center"
                padding={40}
              >
                <Image
                  systemName="arrow.clockwise"
                  font={32}
                  foregroundStyle={{ light: "#C7C7CC", dark: "#48484A" }}
                />
                <Text
                  font={15}
                  foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" }}
                  padding={{ top: 12 }}
                >
                  加载中...
                </Text>
              </VStack>
            ) : hasError.value ? (
              <VStack
                frame={{ height: 300 }}
                alignment="center"
                padding={40}
              >
                <Image
                  systemName="exclamationmark.triangle"
                  font={32}
                  foregroundStyle="#FF3B30"
                />
                <Text
                  font={15}
                  foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" }}
                  padding={{ top: 12 }}
                >
                  加载失败
                </Text>
                <Button
                  title="重试"
                  action={handleRefresh}
                />
              </VStack>
            ) : (
              <VStack spacing={0}>
                <Image
                  imageUrl={photoUrl.value}
                  resizable
                  aspectRatio={{ value: null, contentMode: "fit" }}
                  frame={{ maxHeight: 400 }}
                />
              </VStack>
            )}
          </VStack>

          {/* 操作按钮 */}
          {!isLoading.value && !hasError.value && (
            <HStack spacing={16}>
              <Button title="刷新" action={handleRefresh} />
              <Button title="随机换图" action={handleRandom} />
            </HStack>
          )}

          {/* 小组件尺寸预览 */}
          {!isLoading.value && !hasError.value && !!photoUrl.value && (
            <VStack spacing={16} alignment="center">
              <Text
                font={13}
                foregroundStyle={{ light: "#6D6D72", dark: "#8E8E93" }}
              >
                小组件尺寸预览
              </Text>

              <HStack spacing={16} alignment="top">
                {/* 小尺寸 */}
                <VStack spacing={8} alignment="center">
                  <Image
                    imageUrl={photoUrl.value}
                    resizable
                    aspectRatio={{ value: 1, contentMode: "fill" }}
                    frame={{ width: 80, height: 80 }}
                    clipShape={{ type: "rect", cornerRadius: 16 }}
                  />
                  <Text font={11} foregroundStyle={{ light: "#8E8E93", dark: "#636366" }}>
                    小
                  </Text>
                </VStack>

                {/* 中尺寸 */}
                <VStack spacing={8} alignment="center">
                  <Image
                    imageUrl={photoUrl.value}
                    resizable
                    aspectRatio={{ value: 2, contentMode: "fill" }}
                    frame={{ width: 160, height: 80 }}
                    clipShape={{ type: "rect", cornerRadius: 16 }}
                  />
                  <Text font={11} foregroundStyle={{ light: "#8E8E93", dark: "#636366" }}>
                    中
                  </Text>
                </VStack>
              </HStack>

              {/* 大尺寸 */}
              <VStack spacing={8} alignment="center">
                <Image
                  imageUrl={photoUrl.value}
                  resizable
                  aspectRatio={{ value: 2, contentMode: "fill" }}
                  frame={{ width: 160, height: 160 }}
                  clipShape={{ type: "rect", cornerRadius: 20 }}
                />
                <Text font={11} foregroundStyle={{ light: "#8E8E93", dark: "#636366" }}>
                  大
                </Text>
              </VStack>
            </VStack>
          )}

        </VStack>
      </ScrollView>
    </NavigationStack>
  );
}
