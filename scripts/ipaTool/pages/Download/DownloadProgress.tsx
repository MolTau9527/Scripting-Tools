import { ProgressView, Text, HStack, Spacer, useRef } from "scripting";
import { formatSize } from "../../utils";
import { useAppsState } from "../../hooks";

export default function DownloadProgress({ id }: { id: number | string }) {
  const { appState } = useAppsState(Number(id));
  const { progress, status } = appState;
  const data = useRef({ time: Date.now(), size: 0, speed: "0B/s" });
  if (!progress || status === "queued") return <></>;
  const { downloaded, total } = progress;
  const diff = Date.now() - data.current.time;
  if (status !== "downloading") {
    data.current.speed = "0B/s";
  } else if (diff >= 1000) {
    data.current.speed = `${formatSize(
      ((downloaded - data.current.size) / diff) * 1000
    )}/s`;
    data.current.time = Date.now();
    data.current.size = downloaded;
  }

  return (
    <ProgressView
      value={downloaded}
      total={total}
      title="任务进度"
      label={<></>}
      currentValueLabel={
        <HStack alignment={"center"}>
          {status === "failed" ? (
            <Text foregroundStyle={"systemRed"}>下载失败</Text>
          ) : (
            <>
              <Text>
                {formatSize(downloaded)} / {formatSize(total)}
              </Text>
              <Spacer />
              <Text>{data.current.speed}</Text>
            </>
          )}
        </HStack>
      }
      progressViewStyle="linear"
    />
  );
}
