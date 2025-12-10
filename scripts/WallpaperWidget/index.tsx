import { Navigation, Script, useObservable } from "scripting";
import { PreviewHome } from "./utils/PreviewHome";
import { SettingsPage } from "./utils/SettingsPage";

function App() {
  const currentPage = useObservable<"home" | "settings">("home");

  if (currentPage.value === "settings") {
    return <SettingsPage onBack={() => currentPage.setValue("home")} />;
  }

  return (
    <PreviewHome 
      onClose={() => Script.exit()} 
      onSettings={() => currentPage.setValue("settings")} 
    />
  );
}

async function run() {
  await Navigation.present({
    element: <App />
  });
  Script.exit();
}

run();
