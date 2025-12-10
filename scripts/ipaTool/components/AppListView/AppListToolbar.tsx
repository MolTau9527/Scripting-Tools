import { Text, Button, useState, useEffect, HStack } from "scripting";
import { Colors, Spacing } from "../../constants/designTokens";
import type { Seletsed } from "./index";
import CloseButton from "../CloseButton";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  seletsed: Seletsed;
  isCancel: boolean;
}

/* 全选/取消全选按钮 */
const SelectAllBtn = ({ show, seletsed }: Props) => {
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    !show && setAllSelected(false);
  }, [show]);

  return show ? (
    <Button
      title={allSelected ? "取消全选" : "全选"}
      action={() => {
        setAllSelected(!allSelected);
        seletsed.forEach(({ setSelect }) => setSelect(!allSelected));
      }}
    />
  ) : (
    <CloseButton />
  );
};

/* 选择数量展示组件 */
const SelectedCounter = ({ seletsed, show }: Props) => {
  const [count, setCount] = useState(0);
  seletsed.setCount = setCount;

  return (
    <Text
      hidden={!!!count || !show}
      foregroundStyle={Colors.button.gray}
    >{`选择： ${count}`}</Text>
  );
};

/* 顶部完成/更多按钮 */
const TopBarTrailingBtn = ({ show, seletsed, setShow }: Props) => {
  return (
    <Button
      title="完成"
      systemImage={show ? undefined : "ellipsis"}
      action={() => {
        if (show) {
          seletsed.forEach(({ setSelect }) => setSelect(false));
          seletsed.clear();
        }
        setShow(!show);
      }}
    />
  );
};

/* 底部操作按钮配置类型 */
interface BottomActionBtnConfig {
  stateKey: "setIsDelete" | "setisCance";
  systemImage: string;
  actionKey: "deleteFn" | "cancelFn";
  scaleEffect: number;
}

/* 通用底部操作按钮 */
const BottomActionBtn = ({
  seletsed,
  setShow,
  config,
}: Props & { config: BottomActionBtnConfig }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  seletsed[config.stateKey] = setIsEnabled;

  return (
    <Button
      title=""
      opacity={isEnabled ? 1 : 0.1}
      scaleEffect={config.scaleEffect}
      buttonStyle="plain"
      systemImage={config.systemImage}
      action={() => {
        if (!isEnabled) return;
        seletsed.forEach(({ type, [config.actionKey]: actionFn }) => {
          type && actionFn?.();
        });
        seletsed.clear();
        setShow?.(false);
      }}
    />
  );
};

/* 底部删除按钮*/
const BottomDeleBtn = (props: Props) => (
  <BottomActionBtn
    {...props}
    config={{
      stateKey: "setIsDelete",
      systemImage: "trash",
      scaleEffect: 1.2,
      actionKey: "deleteFn",
    }}
  />
);

/* 底部取消按钮 */
const BottomCancelBtn = (props: Props) => (
  <BottomActionBtn
    {...props}
    config={{
      stateKey: "setisCance",
      systemImage: "pause.circle",
      scaleEffect: 1.3,
      actionKey: "cancelFn",
    }}
  />
);

/* 构建 App 列表的工具栏对象 */
export const buildAppListToolbar = (prop: Props) => ({
  topBarTrailing: <TopBarTrailingBtn {...prop} />,
  principal: <SelectedCounter {...prop} />,
  topBarLeading: <SelectAllBtn {...prop} />,
  bottomBar: [
    <BottomDeleBtn {...prop} />,
    prop.isCancel ? <BottomCancelBtn {...prop} /> : <></>,
  ],
});
