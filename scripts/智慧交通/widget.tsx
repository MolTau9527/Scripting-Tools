import { VStack, HStack, Text, Spacer, Widget, fetch, Color } from 'scripting'

var param = { citycode: '125', cityname: '北京' }
if (Widget.parameter) {
  param = JSON.parse(Widget.parameter)
}
var citycode = param.citycode

function getTraffic(index: number): { status: string, color: Color } {
  if (index >= 2) return { status: '严重拥堵', color: '#FF0000' }
  if (index >= 1.8) return { status: '拥堵', color: '#FF5500' }
  if (index >= 1.5) return { status: '缓行', color: '#FFA500' }
  return { status: '畅通', color: '#00C400' }
}

async function getDetails() {
  var res = await fetch('https://jiaotong.baidu.com/trafficindex/city/details/?cityCode=' + citycode)
  var json = await res.json()
  return json.data.detail
}

async function getRoadPredict(hours: number) {
  var res = await fetch('https://jiaotong.baidu.com/trafficindex/predict/road?cityCode=' + citycode)
  var json = await res.json()
  return json.data[hours > 10 && hours < 19 ? 'pm' : 'am']
}

async function getDistrictRoad() {
  var res = await fetch('https://jiaotong.baidu.com/trafficindex/city/roadrank/?cityCode=' + citycode + '&roadtype=11')
  var json = await res.json()
  var count = json.data.list.length
  var hours = new Date().getHours()
  if (count === 9) json.data.list.pop()
  var title = count >= 8 ? '实时拥堵道路排行' : '明日' + (hours > 10 && hours < 19 ? '晚' : '早') + '高峰拥堵预测'
  var data = count >= 8 ? json.data.list : await getRoadPredict(hours)
  return { title: title, data: data }
}

function RoadItem(props: { item: any, index: number }) {
  var item = props.item
  var index = props.index
  var textColor: Color = index <= 3 ? '#FF0000' : index <= 6 ? '#FCA100' : '#00C400'
  var congestIndex = Number(item.index).toFixed(2)
  var roadName = item.roadname || item.road_name

  return (
    <HStack frame={{ height: 19 }}>
      <Text font={14} fontWeight="bold" foregroundStyle={textColor} frame={{ width: 18 }}>{index}</Text>
      <Text font={13} fontWeight="medium" foregroundStyle="secondaryLabel" lineLimit={1}>{roadName}</Text>
      <Spacer minLength={4} />
      <Text font={14} fontWeight="medium" foregroundStyle="#007AFF">{congestIndex}</Text>
    </HStack>
  )
}

async function main() {
  var detail = await getDetails()
  var traffic = getTraffic(detail.index)
  var roadData = await getDistrictRoad()

  var leftData = roadData.data ? roadData.data.slice(0, 4) : []
  var rightData = roadData.data ? roadData.data.slice(4, 8) : []

  function WidgetView() {
    return (
      <VStack alignment="leading" padding={15}>
        <HStack>
          <HStack frame={{ width: 5, height: 23 }} background={traffic.color} clipShape={{ type: 'rect', cornerRadius: 2.5 }} />
          <Text font={17} fontWeight="bold" padding={{ leading: 8 }}>{detail.city_name}</Text>
          <Text font={17} padding={{ leading: 2 }}>{roadData.title}</Text>
          <Spacer minLength={8} />
          <HStack padding={{ horizontal: 12, vertical: 2 }} background={traffic.color} clipShape={{ type: 'rect', cornerRadius: 7 }}>
            <Text font={13} fontWeight="bold" foregroundStyle="#FFFFFF">{traffic.status}</Text>
          </HStack>
        </HStack>
        <Spacer />
        <HStack>
          <VStack alignment="leading" spacing={0}>
            {leftData.map(function(item: any, i: number) { return <RoadItem key={String(i)} item={item} index={i + 1} /> })}
          </VStack>
          <Spacer />
          <VStack alignment="leading" spacing={0}>
            {rightData.map(function(item: any, i: number) { return <RoadItem key={String(i)} item={item} index={i + 5} /> })}
          </VStack>
        </HStack>
      </VStack>
    )
  }

  Widget.present(<WidgetView />, { policy: 'after', date: new Date(Date.now() + 1000 * 60 * 15) })
}

main()