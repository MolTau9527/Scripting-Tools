import { Navigation, Script } from "scripting";
import Helper from './utils/public/helper';

async function run() {
  await Navigation.present({
    element: <Helper />,
    modalPresentationStyle: "fullScreen",
  });
  Script.exit();
}

run();