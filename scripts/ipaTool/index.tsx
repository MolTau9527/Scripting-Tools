import { Navigation, Script } from "scripting";
import { dismissApp } from "./utils";
import { surge } from "./utils/surge";
import "./services/server";

import TabViewApp from "./pages";

const App = () => {
  dismissApp.current = Navigation.useDismiss();
  return <TabViewApp />;
};

(async () => {
  try {
    await surge.setModule(true);

    await Navigation.present({
      element: <App />,
      modalPresentationStyle: "fullScreen",
    });

    await Script.exit();
  } catch (e) {
    await console.present();
    console.error(e);
  } finally {
    await surge.setModule(false);
  }
})();