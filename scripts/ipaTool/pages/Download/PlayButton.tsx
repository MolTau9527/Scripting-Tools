import { Image, Button } from "scripting";
import { useDownload } from "../../hooks";
import type { DownloadTaskState } from "../../hooks/useAppsState";

interface prop {
  task: DownloadTaskState;
}

export default function PlayButton({ task }: prop) {
  const { startDownload } = useDownload(Number(task.down.id));

  return (
    <Button
      buttonStyle="plain"
      action={() => {
        HapticFeedback.mediumImpact();
        startDownload(task.down);
      }}
    >
      <Image
        systemName={
          /queued|cancelled|failed/.test(task.status)
            ? "play.circle.fill"
            : "pause.circle.fill"
        }
        symbolRenderingMode="hierarchical"
        contentTransition="symbolEffect"
        scaleEffect={2.3}
        frame={{ width: 40, height: 40 }}
        foregroundStyle="systemBlue"
      />
    </Button>
  );
}
