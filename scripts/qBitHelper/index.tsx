import { Navigation, Script } from "scripting";
import QbHelper from './util/qbhelper';

async function run() {
  await Navigation.present({
    element: <QbHelper />,
    modalPresentationStyle: "fullScreen",
  });
  Script.exit();
}

run();