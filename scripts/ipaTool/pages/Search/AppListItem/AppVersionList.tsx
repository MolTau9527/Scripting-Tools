/**
 * File: pages/Search/AppVersionList.tsx
 *
 * AppVersionList 组件 - 应用历史版本列表
 * 专门用于显示应用的历史版本信息，非通用组件
 */

import {
  List,
  Section,
  Text,
  Button,
  ProgressView,
  RoundedRectangle,
  HStack,
  Image,
  useState,
  useEffect,
  Spacer,
  Navigation,
  NavigationStack,
} from "scripting";
import {
  FontStyles,
  Colors,
  BorderRadius,
  BorderWidth,
  Spacing,
} from "../../../constants/designTokens";
import { type AppVersionItem } from "../../../types/appStore";
import {
  apiGetAppVersionList,
  apiGetAppVersions3rd,
} from "../../../services/api";
import { useAppVersionSelection } from "./store/useAppVersionSelection";
import { useAuth } from "../../../hooks/useAuth";

const appInfo = (app: AppVersionItem): Array<[string | number, string]> =>
  app.length ? app : [["暂无历史版本记录", "????"] as [string, string]];

// AppVersionList 组件 - 应用历史版本列表
export const AppVersionList = ({ id, name }: { id: number; name: string }) => {
  const { isLoggedIn } = useAuth().authState;
  const [versions, setVersions] = useState<AppVersionItem | null>(null);
  const AppVersionDispatch = useAppVersionSelection()[1];
  const dismiss = Navigation.useDismiss();

  useEffect(() => {
    Promise.try(() =>
      isLoggedIn ? apiGetAppVersionList(id) : apiGetAppVersions3rd(id)
    )
      .then(setVersions)
      .catch(e => setVersions([[`${e.toString()}`, "????"]]));
  }, [id]);

  return (
    <NavigationStack>
      <List
        navigationBarTitleDisplayMode="inline"
        listRowSpacing={Spacing.md}
        listRowSeparator="hidden"
        navigationTitle={name}
        padding={{ top: -Spacing.xl }}
      >
        <Section
          listRowBackground={
            <RoundedRectangle
              fill={Colors.background.tertiary}
              cornerRadius={BorderRadius.xl}
              stroke={{
                shapeStyle: Colors.border.primary,
                strokeStyle: {
                  lineWidth: BorderWidth.regular,
                },
              }}
            />
          }
        >
          {versions ? (
            appInfo(versions).map(item => {
              return (
                <Button
                  key={item[0]}
                  action={() => {
                    AppVersionDispatch([Number(id), item]);
                    dismiss();
                  }}
                >
                  <HStack spacing={Spacing.sm}>
                    <Image systemName="arrow.down.circle" imageScale="large" />
                    <Text
                      {...FontStyles.body}
                      foregroundStyle={Colors.text.primary}
                    >
                      版本 {item[0]} - {item[1]}
                    </Text>
                  </HStack>
                </Button>
              );
            })
          ) : (
            <HStack>
              <Spacer />
              <ProgressView title="加载中..." />
              <Spacer />
            </HStack>
          )}
        </Section>
      </List>
    </NavigationStack>
  );
};
