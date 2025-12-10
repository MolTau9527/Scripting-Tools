// 文件：scripts/ipaTool/components/AppListView.tsx
// 说明：通用列表组件，将页面中的 List + Section 结构抽取封装，统一接收标题、数据与 item 渲染

import { useState, useMemo, List, Section, Text } from "scripting";
import { Spacing, FontStyles, Colors } from "../../constants/designTokens";
import { buildAppListToolbar } from "./AppListToolbar";
import { ItmView } from "./ItmView";
import CloseButton from "../CloseButton";

// 使用泛型 T 表示任意类型的数据项
type Props<T> = {
  // 导航栏大标题
  navigationTitle: string;
  // Section 小标题（当有数据时显示）
  header?: string;
  // 列表数据数组
  data: T[];
  // 每条数据的渲染函数（返回一个 JSX 元素，建议在内部设置 key）
  renderItem: (item: T, index: number) => JSX.Element;
  // 空列表时显示的组件（如 <EmptyState />）
  emptyComponent?: JSX.Element;
  // 删除Item方法
  onDelete: (id: number) => (message?: string) => void;
  // 取消下载方法
  onCancel?: (id: number) => () => void;
};

// 选择项集合类型（使用 Map，以业务键为 key；中文注释）
export type Seletsed = globalThis.Map<
  number,
  {
    // 当前是否选中
    type: boolean;
    // 删除方法
    deleteFn: (message?: string) => void;
    // 取消下载
    cancelFn?: () => void;
    // 设置选择状态的方法
    setSelect: (state: boolean) => void;
  }
> & {
  setCount?: (n: number) => void;
  setIsDelete?: (n: boolean) => void;
  setisCance?: (n: boolean) => void;
};

// 采用箭头函数定义组件，遵循项目规范
const AppListView = <T,>({
  navigationTitle,
  header,
  data,
  renderItem,
  onDelete,
  onCancel,
  emptyComponent,
}: Props<T>) => {
  const [show, setShow] = useState(false);
  const seletsed = useMemo<Seletsed>(() => new Map(), []);

  return (
    <List
      bottomBarVisibility={show ? "visible" : "hidden"}
      tabBarVisibility={!show ? "visible" : "hidden"}
      listRowSpacing={Spacing.md}
      listRowSeparator="hidden"
      navigationBarTitleDisplayMode="automatic"
      navigationTitle={navigationTitle}
      toolbar={
        data.length
          ? buildAppListToolbar({
              show,
              setShow,
              seletsed,
              isCancel: !!onCancel,
            })
          : { topBarLeading: <CloseButton /> }
      }
    >
      <Section
        header={
          <Text {...FontStyles.caption} {...Colors.text.secondary}>
            {data?.length ? String(header) : ""}
          </Text>
        }
      >
        {data?.length
          ? data.map((item, index) => {
              const node = renderItem(item, index);
              return (
                <ItmView
                  key={Number(node.props.id)}
                  id={Number(node.props.id)}
                  show={show}
                  node={node}
                  onDelete={onDelete}
                  onCancel={onCancel}
                  seletsed={seletsed}
                />
              );
            })
          : emptyComponent}
      </Section>
    </List>
  );
};

export default AppListView;
