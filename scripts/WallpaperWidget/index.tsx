import { Navigation, Script } from "scripting";
import { SettingsPage } from "./utils/SettingsPage";

async function main() {
  await Navigation.present({
    element: <SettingsPage onBack={() => Script.exit()} />
  });
  Script.exit();
}

main();
