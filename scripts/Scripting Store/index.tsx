import { Navigation, Script } from 'scripting'
import { StoreScreen } from './screens/StoreScreen'

const run = async () => {
  await Navigation.present({
    element: <StoreScreen />,
    modalPresentationStyle: 'fullScreen'
  })
  Script.exit()
}

run()
