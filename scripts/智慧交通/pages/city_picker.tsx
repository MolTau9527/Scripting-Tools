import { Navigation, NavigationStack, List, Section, Text, HStack, VStack, Spacer, Image, useState, useEffect, fetch, TextField } from 'scripting'

var configPath = FileManager.appGroupDocumentsDirectory + '/traffic_config.json'

function getConfig(): { citycode: string, cityname: string } {
  if (FileManager.existsSync(configPath)) {
    return JSON.parse(FileManager.readAsStringSync(configPath))
  }
  return { citycode: '125', cityname: '海口' }
}

function saveConfig(config: { citycode: string, cityname: string }) {
  FileManager.writeAsStringSync(configPath, JSON.stringify(config))
}

export function CityPickerView() {
  const [config, setConfig] = useState(getConfig())
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const dismiss = Navigation.useDismiss()

  useEffect(() => {
    fetch('https://jiaotong.baidu.com/trafficindex/city/list/')
      .then(res => res.json())
      .then(json => {
        setCities(json.data.list)
        setLoading(false)
      })
  }, [])

  function selectCity(city: any) {
    const newConfig = { citycode: city.citycode, cityname: city.cityname }
    setConfig(newConfig)
    saveConfig(newConfig)
    dismiss(newConfig)
  }

  const filteredCities = searchText
    ? cities.filter((city: any) => 
        city.cityname.includes(searchText) || city.provincename.includes(searchText)
      )
    : cities

  return (
    <NavigationStack>
      <List
        listStyle="insetGroup"
        navigationTitle="选择城市"
        navigationBarTitleDisplayMode="inline"
      >
        <Section>
          <HStack padding={{ vertical: 8 }}>
            <Image systemName="magnifyingglass" foregroundStyle="secondaryLabel" font={16} />
            <TextField
              title="搜索城市名或省份"
              value={searchText}
              onChanged={setSearchText}
              autofocus={true}
            />
            {searchText ? (
              <Image 
                systemName="xmark.circle.fill" 
                foregroundStyle="tertiaryLabel" 
                font={16}
                onTapGesture={() => setSearchText('')}
              />
            ) : null}
          </HStack>
        </Section>

        <Section footer={<Text>共 {filteredCities.length} 个城市{searchText ? '匹配' : null}</Text>}>
          {loading ? (
            <HStack frame={{ height: 44 }}>
              <Spacer />
              <Text foregroundStyle="secondaryLabel">加载中...</Text>
              <Spacer />
            </HStack>
          ) : filteredCities.length === 0 ? (
            <HStack frame={{ height: 44 }}>
              <Spacer />
              <Text foregroundStyle="secondaryLabel">未找到匹配城市</Text>
              <Spacer />
            </HStack>
          ) : (
            filteredCities.map((city: any) => (
              <HStack
                key={city.citycode}
                padding={{ vertical: 10 }}
                onTapGesture={() => selectCity(city)}
              >
                <VStack alignment="leading" spacing={2}>
                  <Text font={17}>{city.cityname}</Text>
                  <Text font={13} foregroundStyle="secondaryLabel">{city.provincename}</Text>
                </VStack>
                <Spacer />
                {city.citycode === config.citycode && (
                  <Image systemName="checkmark" foregroundStyle="#007AFF" font={17} fontWeight="semibold" />
                )}
              </HStack>
            ))
          )}
        </Section>
      </List>
    </NavigationStack>
  )
}