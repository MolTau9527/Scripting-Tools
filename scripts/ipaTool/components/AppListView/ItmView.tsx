// 文件：scripts/ipaTool/components/ItmView.tsx
// 作用：将 AppListView.tsx 中的内联 View 抽取为独立组件 ItmView；在内部通过 node.props.key 读取业务键并转换为数字
// 约束：所有样式使用 designTokens（Colors、BorderRadius）；所有函数使用箭头函数；中文注释；不在未确认时修改其他文件

import {
  Button,
  useMemo,
  RoundedRectangle,
  useState,
  Image,
  ZStack,
  Link,
  Text,
  Path,
} from "scripting";
import { Colors, BorderRadius } from "../../constants/designTokens";
import { AppConfig } from "../../constants/AppConfig";
import type { Seletsed } from "./index";

// 动画与偏移的配置类型
type BtnMotion = {
  // 显隐透明度（[隐藏态, 显示态]）
  opacity: [number, number];
  // X 方向偏移量（[隐藏态, 显示态]）
  offset_X: [number, number];
};

// 默认动画/偏移配置s
const motion: BtnMotion = {
  opacity: [0, 1],
  offset_X: [0, 35],
};

// 组件入参类型（不显式传 itemKey，改为使用 node.props.key）
type ItmViewProps = {
  id: number;
  // 子节点（例如 DownloadTaskItem 的 JSX 元素，必须自身已有 key）
  node: JSX.Element;
  // 是否处于“显示态”，影响透明度与偏移
  show: boolean;
  //删除方法
  onDelete: (id: number) => (message?: string) => void;
  // 取消方法
  onCancel?: (id: number) => () => void;
  seletsed: Seletsed;
};

export const ItmView = ({
  node,
  show,
  onDelete,
  onCancel,
  seletsed,
  id,
}: ItmViewProps) => {
  const [select, setSelect] = useState(false);
  const deleteFn = onDelete(id);
  const cancelFn = onCancel?.(id);
  const anim = useMemo(() => Animation.smooth({ duration: 0.4 }), []);

  // 给子节点注入偏移与动画
  Object.assign(node.props, {
    offset: { x: motion.offset_X[Number(show)], y: 0 },
    animation: {
      animation: anim,
      value: motion.offset_X[Number(show)],
    },
  });

  seletsed.set(id, {
    type: select,
    deleteFn,
    cancelFn,
    setSelect,
  });

  const count = [...seletsed].filter(([, { type }]) => type).length;
  seletsed.setCount?.(count);
  seletsed.setIsDelete?.(!!count);
  seletsed.setisCance?.(!!count);

  return (
    <ZStack
      alignment="leading"
      listRowBackground={
        <RoundedRectangle
          fill={Colors.background[select ? "selected" : "tertiary"]}
          cornerRadius={BorderRadius.lg}
        />
      }
      trailingSwipeActions={{
        actions: !show
          ? [
              <Button
                title="删除"
                tint={Colors.button.red}
                action={deleteFn}
              />,
              <Link
                url={Path.join(
                  "shareddocuments://",
                  FileManager.documentsDirectory,
                  AppConfig.file.folder
                )}
              >
                <Text>打开</Text>
              </Link>,
            ]
          : [],
      }}
    >
      <Button
        buttonStyle="plain"
        opacity={motion.opacity[Number(show)]}
        animation={{ animation: anim, value: motion.opacity[Number(show)] }}
        action={() => setSelect(!select)}
      >
        {select ? (
          <Image
            systemName="checkmark.circle.fill"
            foregroundStyle={Colors.button.blue}
          />
        ) : (
          <Image systemName="circle" foregroundStyle={Colors.button.gray} />
        )}
      </Button>
      {node}
    </ZStack>
  );
};
