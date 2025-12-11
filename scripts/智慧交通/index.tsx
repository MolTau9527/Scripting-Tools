import { Navigation, Script } from 'scripting'
import { SettingsView } from './pages/settings'

async function main() {
  await Navigation.present(<SettingsView />)
  Script.exit()
}

main()