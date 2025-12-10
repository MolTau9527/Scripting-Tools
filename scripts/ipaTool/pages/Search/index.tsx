import {
  List,
  NavigationStack,
  useState,
  Section,
  useEffect,
  useCallback,
  Text,
  VStack,
  HStack,
  Spacer,
  ProgressView,
} from "scripting";

import AppListItem from "./AppListItem/index";
import SearchPreview from "./SearchPreview";
import SearchSettings from "./SearchSettings";
import { PickerMenu } from "./PickerMenu";
import { isAppSearchError } from "../../types/appStore";
import { Spacing, FontStyles } from "../../constants/designTokens";
import { apiGetAppInfo } from "../../services/api";
import { toSearchApp } from "../../utils/appDataConverter";
import { storeIdToCode } from "../../utils/countries";
import { useAuth, useLoginToast } from "../../hooks";
import type { AppSearchResponse } from "../../types/appStore";
import CloseButton from "../../components/CloseButton";
import { onSearchShowToast } from "./toast";
import {
  apiSearchApp,
  searchAppIdAbort,
  apiSearchAppById,
  appIdSearchAbort,
} from "../../services/api";

/**
 * 搜索页面组件
 * 提供应用搜索功能
 */
export const SearchView = () => {
  const { toastConfig, showToast } = useLoginToast();
  onSearchShowToast.run = showToast;

  const { storeFront } = useAuth()?.authState ?? {};
  const [storeRegion, setStoreRegion] = useState(
    () => storeIdToCode(storeFront) ?? "CN"
  );

  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("关键字");
  const [searchCount, setSearchCount] = useState(10);
  const [searchType, setSearchType] = useState("software");
  const [presented, setPresented] = useState(false);
  const [apps, setApps] = useState<AppSearchResponse[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState<string | null>();
  /**
   * 处理搜索输入变化
   * 当用户选择一个应用时，将该应用移到列表顶部
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      if (!value) setApps([]);
      const index = apps.findIndex(app => app.name === value);
      if (index > -1) {
        const newApps = [...apps];

        const [element] = newApps.splice(index, 1);
        newApps.unshift(element);
        setApps(newApps);
      }

      setQuery(value);
    },
    [apps]
  );

  /**
   * 处理搜索展示状态变化
   * 当搜索面板关闭时清空应用列表
   */
  const handlePresentedChange = useCallback(
    (value: boolean) => {
      value || setApps([]);
      setPresented(value);
    },
    [presented]
  );

  /**
   * 处理APPID的搜索提交
   */
  const handleSearchSubmit = useCallback(() => {
    if (searchBy !== "APPID") return;
    if (
      isNaN(query as unknown as number) ||
      Math.abs(Number(query)).toString().length < 8
    ) {
      setApps([{ name: "未找到应用", description: "请检查 APPID 是否正确" }]);
      return;
    }

    setLoading("搜索中...");
    Promise.try(() =>
      Promise.any([
        apiGetAppInfo(Number(query)).then(data => toSearchApp(data)),
        apiSearchAppById(Number(query), storeRegion),
      ])
    )
      .then(setApps)
      .catch(({ errors }: { errors: Error[] }) => {
        setApps([
          {
            name: "未找到应用",
            description: errors.map(error => error.message).join(", "),
          },
        ]);
      })
      .finally(() => setLoading(null));
  }, [query]);

  /**
   * 关闭搜索时中止请求并清空状态
   */
  useEffect(() => {
    if (presented) return;
    searchAppIdAbort.current();
    appIdSearchAbort.current();
    setApps([]);
  }, [presented]);

  /**
   * 关键字的搜索逻辑
   */
  useEffect(() => {
    if (!query || apps[0]?.name === query) return;
    if (searchBy !== "关键字") return;
    apiSearchApp({
      term: query,
      country: storeRegion,
      entity: searchType,
      limit: searchCount,
    }).then(data => {
      if (data.length) return setApps(data);
      setApps([
        {
          name: "未找到应用",
          description: "请检查搜索关键词是否正确",
        },
      ]);
    });

    return () => apiSearchApp.cancel();
  }, [query]);

  return (
    <NavigationStack>
      <List
        listRowSpacing={Spacing.md}
        listRowSeparator="hidden"
        navigationTitle="App Store"
        toast={toastConfig}
        searchable={{
          value: query,
          onChanged: handleSearchChange,
          placement: "navigationBarDrawer",
          prompt: "搜索",
          presented: {
            value: presented,
            onChanged: handlePresentedChange,
          },
        }}
        onSubmit={{
          triggers: "search",
          action: handleSearchSubmit,
        }}
        searchSuggestions={
          Keyboard.visible ? (
            <Section>
              {apps.map(({ name }) => (
                <SearchPreview key={name} name={name} />
              ))}
            </Section>
          ) : (
            <></>
          )
        }
        safeAreaInset={{
          top: {
            alignment: "center",
            content: (
              <PickerMenu
                hidden={!presented}
                frame={{ height: presented ? 30 : 0 }}
                animation={{
                  animation: Animation.easeIn(0.4),
                  value: presented ? 30 : 0,
                }}
                safeAreaPadding={{ horizontal: true }}
                value={searchBy}
                options={["关键字", "APPID"]}
                onChanged={newSearchBy => {
                  setSearchBy(newSearchBy);
                }}
              />
            ),
          },
        }}
        toolbar={{
          topBarLeading: <CloseButton />,
        }}
      >
        <Section>
          {loading ? (
            <HStack>
              <Spacer />
              <ProgressView key={Date.now()} title={loading} />
              <Spacer />
            </HStack>
          ) : (
            apps.map(app =>
              isAppSearchError(app) ? (
                <AppListItem
                  key={app.id}
                  app={app}
                  selected={selected}
                  setSelected={setSelected}
                />
              ) : (
                <HStack key={app.description}>
                  <Spacer />
                  <VStack spacing={Spacing.xs}>
                    <Text {...FontStyles.sectionTitle}>{app.name}</Text>
                    <Text foregroundStyle="systemRed" {...FontStyles.body}>
                      {app.description}
                    </Text>
                  </VStack>
                  <Spacer />
                </HStack>
              )
            )
          )}
        </Section>

        <SearchSettings
          presented={presented}
          storeRegion={storeRegion}
          onStoreRegionChange={setStoreRegion}
          searchCount={searchCount}
          onSearchCountChange={setSearchCount}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />
      </List>
    </NavigationStack>
  );
};

// 默认导出
export default SearchView;
