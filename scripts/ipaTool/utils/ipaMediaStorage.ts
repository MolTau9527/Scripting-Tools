import { AppConfig } from "../constants/AppConfig";

type IpaMediaInfoValue = {
  name: string;
  displayVersion: string;
  bundleId: string;
  icon: string;
};

interface IpaMediaInfo {
  [id: string]: IpaMediaInfoValue;
}

export const get = (id: string) => {
  return Storage.get<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo)?.[id];
};

export const set = (id: number, info: IpaMediaInfoValue) => {
  const ipaMediaInfo =
    Storage.get<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo) ?? {};
  ipaMediaInfo[id] = info;
  Storage.set<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo, ipaMediaInfo);
};

export const del = (id: Number) => {
  const ipaMediaInfo = Storage.get<IpaMediaInfo>(
    AppConfig.storageKeys.ipaMediaInfo
  );
  if (!ipaMediaInfo) return;
  delete ipaMediaInfo[String(id)];
  Storage.set<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo, ipaMediaInfo);
};
