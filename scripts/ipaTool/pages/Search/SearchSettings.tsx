import { Text, Picker } from "scripting";
import SearchConfigSection from "./SearchConfigSection";
import { COUNTRIES, countryCodeToFlag } from "../../utils";

interface SearchSettingsProps {
  presented: boolean;
  storeRegion: string;
  onStoreRegionChange: (value: string) => void;
  searchCount: number;
  onSearchCountChange: (value: number) => void;
  searchType: string;
  onSearchTypeChange: (value: string) => void;
}

/**
 * 搜索设置组件
 * 包含商店区域、搜索数量、搜索类型的配置选项
 */
export default function SearchSettings({
  presented,
  storeRegion,
  onStoreRegionChange,
  searchCount,
  onSearchCountChange,
  searchType,
  onSearchTypeChange,
}: SearchSettingsProps) {
  if (presented) return <></>;

  return (
    <>
      {/* 商店区域配置 */}
      <SearchConfigSection
        title="商店区域（Store Region）"
        description="说明：选择要查询的 App Store 区域"
      >
        <Picker
          label={<Text>Country</Text>}
          pickerStyle="menu"
          value={storeRegion}
          onChanged={onStoreRegionChange}
        >
          {COUNTRIES.map(c => (
            <Text key={c.code} tag={c.code}>
              {countryCodeToFlag(c.code)} {c.name} - {c.code}
            </Text>
          ))}
        </Picker>
      </SearchConfigSection>

      {/* 搜索数量配置 */}
      <SearchConfigSection
        title="搜索数量（Search Quantity）"
        description="说明：控制返回的搜索结果数量"
        details={[
          "• 5：快速预览少量结果",
          "• 10：默认数量，兼顾速度与范围",
          "• 20：更全面的结果（可能稍慢）",
        ]}
      >
        <Picker
          label={<Text>Count</Text>}
          pickerStyle="menu"
          value={searchCount}
          onChanged={onSearchCountChange}
        >
          <Text tag={5}>5</Text>
          <Text tag={10}>10</Text>
          <Text tag={20}>20</Text>
        </Picker>
      </SearchConfigSection>

      {/* 搜索类型配置 */}
      <SearchConfigSection
        title="搜索类型（Search Type）"
        description="类型说明：搜索不同设备类型的应用"
        details={[
          "• software：仅 iPhone 应用",
          "• iPadSoftware：仅 iPad 应用",
          "• software,iPadSoftware：同时检索 iPhone 与 iPad 应用",
        ]}
      >
        <Picker
          label={<Text>Type</Text>}
          pickerStyle="menu"
          value={searchType}
          onChanged={onSearchTypeChange}
        >
          <Text tag={"software"}>software</Text>
          <Text tag={"iPadSoftware"}>iPadSoftware</Text>
          <Text tag={"software,iPadSoftware"}>software,iPadSoftware</Text>
        </Picker>
      </SearchConfigSection>
    </>
  );
}
