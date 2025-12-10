import { Navigation, Script } from "scripting";
import QbHelper from './utils/qbhelper';

async function run() {
  await Navigation.present({
    element: <QbHelper />,
    modalPresentationStyle: "fullScreen",
  });
  Script.exit();
}

run();