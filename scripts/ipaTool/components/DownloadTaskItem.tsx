import { HStack, Spacer, Image, useMemo } from "scripting";
import { Colors, BorderRadius, Spacing } from "../constants/designTokens";

interface Props {
  id: number;
  icon: string;
  content?: JSX.Element;
  actionNode?: JSX.Element;
}

const b64toImagData = (input: string) => {
  try {
    const imageData = Data.fromBase64String(input);
    if (!imageData) throw "转图片失败";
    return UIImage.fromData(imageData);
  } catch (error) {
    throw error;
  }
};

const DownloadTaskItem = ({ icon, content, actionNode }: Props) => {
  const photo = useMemo(() => {
    if (!icon) return { systemName: "app.badge.checkmark" };
    return icon.startsWith("http")
      ? { imageUrl: icon }
      : { image: b64toImagData(icon)! };
  }, [icon]);

  return (
    <HStack spacing={Spacing.md}>
      {/* 应用图标 */}
      <Image
        {...photo}
        resizable
        frame={{ width: 60, height: 60 }}
        clipShape={{
          type: "rect",
          cornerRadius: BorderRadius.xl,
          style: "continuous",
        }}
        foregroundStyle={Colors.status.warning}
      />

      <Spacer />

      {/* 应用信息 */}
      {content}
      <Spacer />

      {/* 操作按钮 */}
      {actionNode}
    </HStack>
  );
};

export default DownloadTaskItem;
