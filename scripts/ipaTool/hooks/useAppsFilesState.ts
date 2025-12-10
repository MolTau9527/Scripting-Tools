import { createGlobalState } from "../modules/createGlobalStateUtils";
import { AppConfig } from "../constants/AppConfig";
import { get, del } from "../utils/ipaMediaStorage";
import { Path } from "scripting";

interface InitState {
  [id: string | number]: {
    name: string;
    path: string;
    displayVersion: string;
    size: number;
    icon: string | null | undefined;
    bundleId: string;
  };
}

const udpDate = async () => {
  const dir = Path.join(FileManager.documentsDirectory, AppConfig.file.folder);
  const state: InitState = {};

  if (!FileManager.existsSync(dir)) return state;

  const flies = FileManager.readDirectorySync(dir);
  for (const fileName of flies) {
    if (!fileName.endsWith(".ipa")) continue;
    const [name, displayVersion, id] = fileName.split(".ipa")[0].split("@");
    const path = Path.join(dir, fileName);
    const { size } = FileManager.statSync(path);
    const info = get(id);
    if (!info) {
      await FileManager.remove(path);
      continue;
    }
    const { icon, bundleId } = info;
    state[id] = { name, path, displayVersion, size, icon, bundleId };
  }

  return state;
};

const ondelete = async (state: InitState, id: number) => {
  await FileManager.remove(state[String(id)].path);
  del(Number(id));
  delete state[String(id)];
  return { ...state };
};

const initStete: InitState = {};
export const useAppsFilesState = createGlobalState(
  (state, { id, type }: { type: string; id?: number }) => {
    switch (type) {
      case "udpDate":
        return udpDate();
      case "delete":
        return ondelete(state, id!);
      default:
        return state;
    }
  },
  initStete,
  { preciseUpdateOff: false }
);
