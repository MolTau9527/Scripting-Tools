import { HStack, Spacer, Image, RoundedRectangle, Button } from "scripting";
import {
  Colors,
  BorderRadius,
  Spacing,
  BorderWidth,
} from "../../../constants/designTokens";
import { type AppSearchSuccess } from "../../../types/appStore";
import DownloadButton from "./DownloadButton";
import AppInfo from "./AppInfo";
import { useDownload } from "../../../hooks";

export interface Props {
  app: AppSearchSuccess;
  selected: number;
  setSelected: (id: number) => void;
}

export default function AppListItem({ app, selected, setSelected }: Props) {
  const { removeTask } = useDownload(app.id);
  console.log(app.icon)
  return (
    <HStack
      spacing={Spacing.md}
      trailingSwipeActions={{
        allowsFullSwipe: false,
        actions: [
          <Button title="删除" tint="systemRed" action={() => removeTask()} />,
        ],
      }}
      listRowBackground={
        <RoundedRectangle
          scaleEffect={Device.systemVersion >= "26" ? 0.97 : 1}
          fill={Colors.background.tertiary}
          cornerRadius={BorderRadius.xxl}
          stroke={{
            shapeStyle:
              selected === app?.id
                ? Colors.border.selected
                : "rgba(0, 0, 0, 0.1)",
            strokeStyle: {
              lineWidth: BorderWidth.regular,
            },
          }}
        />
      }
    >
      {/* 应用图标 */}
      <Image
        imageUrl={app.icon}
        resizable={true}
        frame={{ width: 80, height: 80 }}
        clipShape={{
          type: "rect",
          cornerRadius: BorderRadius.xl,
          style: "continuous",
        }}
      />

      {/* 应用信息 */}
      <AppInfo app={app} />

      <Spacer />

      {/* 下载按钮 */}
      <DownloadButton app={app} setSelected={setSelected} />
    </HStack>
  );
}
