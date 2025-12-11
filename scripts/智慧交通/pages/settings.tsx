import { Navigation, NavigationStack, List, Section, Text, HStack, VStack, Spacer, Image, useState, Widget, Picker, TapGesture, Color } from 'scripting'
import { CityPickerView } from './city_picker'

const configPath = FileManager.appGroupDocumentsDirectory + '/traffic_config.json'

const refreshOptions = [
  { value: 30, label: '30秒' },
  { value: 60, label: '1分钟' },
  { value: 120, label: '2分钟' },
  { value: 300, label: '5分钟' },
  { value: 600, label: '10分钟' },
  { value: 1800, label: '30分钟' },
]

function getConfig() {
  if (FileManager.existsSync(configPath)) {
    const saved = JSON.parse(FileManager.readAsStringSync(configPath))
    return { citycode: saved.citycode || '125', cityname: saved.cityname || '海口', refreshInterval: saved.refreshInterval || 300 }
  }
  return { citycode: '125', cityname: '海口', refreshInterval: 300 }
}

function RowIcon({ name, color }: { name: string, color: Color }) {
  return (
    <HStack frame={{ width: 32, height: 32 }} background={color} clipShape={{ type: 'rect', cornerRadius: 7 }}>
      <Image systemName={name} foregroundStyle="white" font={16} />
    </HStack>
  )
}

export function SettingsView() {
  const [config, setConfig] = useState(getConfig())

  function saveAndUpdate(newConfig: typeof config) {
    setConfig(newConfig)
    FileManager.writeAsStringSync(configPath, JSON.stringify(newConfig))
  }

  async function previewWidget() {
    await Widget.preview({
      family: 'systemMedium',
      parameters: { options: { [config.cityname]: JSON.stringify(config) }, default: config.cityname }
    })
  }

  async function openCityPicker() {
    const result = await Navigation.present(<CityPickerView />)
    if (result) saveAndUpdate({ ...config, ...result })
  }

  return (
    <NavigationStack>
      <List listStyle="insetGroup" navigationTitle="智慧交通" navigationBarTitleDisplayMode="large">
        <Section>
          <VStack alignment="leading" gesture={{ gesture: TapGesture().onEnded(previewWidget), mask: 'gesture' }}>
            <HStack padding={{ vertical: 14 }}>
              <RowIcon name="eye.fill" color="#007AFF" />
              <Text padding={{ leading: 12 }} font={17}>预览组件</Text>
              <Spacer />
              <Image systemName="chevron.right" foregroundStyle="tertiaryLabel" font={14} fontWeight="semibold" />
            </HStack>
          </VStack>
        </Section>

        <Section header={<Text>设置</Text>}>
          <VStack alignment="leading" gesture={{ gesture: TapGesture().onEnded(openCityPicker), mask: 'gesture' }}>
            <HStack padding={{ vertical: 14 }}>
              <RowIcon name="location.fill" color="#34C759" />
              <Text padding={{ leading: 12 }} font={17}>当前城市</Text>
              <Spacer />
              <Text foregroundStyle="secondaryLabel" font={15}>{config.cityname}</Text>
              <Image systemName="chevron.right" foregroundStyle="tertiaryLabel" font={14} fontWeight="semibold" padding={{ leading: 4 }} />
            </HStack>
          </VStack>

          <Picker value={config.refreshInterval} onChanged={(v: number) => saveAndUpdate({ ...config, refreshInterval: v })} pickerStyle="menu"
            label={<HStack padding={{ vertical: 14 }}><RowIcon name="arrow.clockwise" color="#5856D6" /><Text padding={{ leading: 12 }} font={17}>刷新频率</Text></HStack>}>
            {refreshOptions.map(o => <Text key={o.value} tag={o.value}>{o.label}</Text>)}
          </Picker>
        </Section>

        <Section header={<Text>关于</Text>}>
          <HStack padding={{ vertical: 12 }}>
            <RowIcon name="info.circle.fill" color="#FF9500" />
            <Text padding={{ leading: 12 }} font={17}>数据来源</Text>
            <Spacer />
            <Text foregroundStyle="secondaryLabel" font={15}>百度交通指数</Text>
          </HStack>
        </Section>
      </List>
    </NavigationStack>
  )
}