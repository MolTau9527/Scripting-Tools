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

export const get = (id: string | number) => {
  return Storage.get<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo)?.[String(id)];
};

export const set = (id: string | number, info: IpaMediaInfoValue) => {
  const ipaMediaInfo =
    Storage.get<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo) ?? {};
  ipaMediaInfo[String(id)] = info;
  Storage.set<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo, ipaMediaInfo);
};

export const del = (id: string | number) => {
  const ipaMediaInfo = Storage.get<IpaMediaInfo>(
    AppConfig.storageKeys.ipaMediaInfo
  );
  if (!ipaMediaInfo) return;
  delete ipaMediaInfo[String(id)];
  Storage.set<IpaMediaInfo>(AppConfig.storageKeys.ipaMediaInfo, ipaMediaInfo);
};
