// File: pages/Search/AppListItem/DownloadIcon.tsx
import {
  ZStack,
  Image,
  Gauge,
  useObservable,
  useEffect,
  useMemo,
} from "scripting";
import { Colors } from "../../../constants/designTokens";
import type { DownloadStatus, Progress } from "../../../modules/download";

interface DownloadIconProps {
  status: DownloadStatus;
  progress: Progress;
}

/**
 * 进度循环环动画组件
 */
const ProgressRingAnimation = () => {
  const deg = useObservable(0);
  const animation = useMemo(() => {
    return {
      rotationEffect: deg.value,
      animation: {
        animation: Animation.linear(1).repeatForever(false),
        value: deg.value,
      },
    };
  }, [deg.value]);

  useEffect(() => {
    deg.setValue(360);
  }, []);

  return (
    <Gauge
      {...animation}
      tint="systemBlue"
      scaleEffect={0.41}
      label={<></>}
      gaugeStyle="accessoryCircularCapacity"
      value={0.75}
    />
  );
};

/**
 * 下载图标组件
 * 封装了带进度环的下载图标，使用固定配置
 */
const DownloadIcon = ({ status = "pending", progress }: DownloadIconProps) => {
  const { percent = 0 } = progress ?? {};
  const isHidden = /queued|fetching|downloading|cancelled/.test(status);

  return (
    <ZStack padding={{ leading: -40, trailing: -10 }}>
      <Gauge
        hidden={!isHidden}
        tint="systemBlue"
        scaleEffect={0.41}
        label={<></>}
        gaugeStyle="accessoryCircularCapacity"
        value={percent}
        overlay={
          <Image
            hidden={!isHidden || status === "fetching"}
            systemName={
              /queued|cancelled/.test(status) ? "play.fill" : "pause.fill"
            }
            contentTransition="symbolEffect"
            scaleEffect={0.6}
            tint="systemBlue"
          />
        }
      />
      {status === "fetching" && <ProgressRingAnimation />}
      <Image
        hidden={isHidden}
        systemName="icloud.and.arrow.down"
        contentTransition="symbolEffect"
        scaleEffect={1.2}
        tint={Colors.status.info.light}
      />
    </ZStack>
  );
};

export default DownloadIcon;
