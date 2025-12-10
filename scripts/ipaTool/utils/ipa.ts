import { Path } from "scripting";
import type { DownloadTaskState } from "../hooks/useAppsState";
import { set } from "./ipaMediaStorage";
import { disableUpdateCheck } from "./plist";
import { AppConfig } from "../constants/AppConfig";

/**
 * 授权 IPA 文件（本地处理）
 * @param params 授权参数
 * @returns IPA 文件路径
 */
export const authorizeApp = ({
  id,
  name,
  folder,
  metadata,
  sinf,
  displayVersion = "",
  bundleId = "",
  icon = "",
}: DownloadTaskState["down"]) => {
  const dir = Path.join(FileManager.documentsDirectory, folder);
  const ipaPath = Path.join(dir, `${id}-${name}.zip`);
  const archive = Archive.openForMode(ipaPath, "update");

  const sc_Info = archive
    .getEntryPaths()
    .find(p => p.includes("app/SC_Info/") && p.endsWith(".supp"))
    ?.replace("supp", "sinf");
  if (!sc_Info) throw new Error("SC_Info not found in IPA");

  // 处理 iTunesMetadata.plist（免更新模式下修改版本标识）
  let processedMetadata = metadata ?? "";
  if (AppConfig.ipa.disableUpdateCheck && processedMetadata) {
    processedMetadata = disableUpdateCheck(processedMetadata);
  }

  const iTunesMetadata = Data.fromRawString(processedMetadata);
  archive.addFileEntrySync(
    Path.join("iTunesMetadata.plist"),
    iTunesMetadata?.size!,
    (offset, length) => iTunesMetadata?.slice(offset, offset + length)!
  );

  const sinfData = Data.fromIntArray(sinf?.data!);
  archive.addFileEntrySync(
    Path.join(sc_Info),
    sinfData.size,
    (offset, length) => sinfData.slice(offset, offset + length)
  );
  FileManager.renameSync(
    ipaPath,
    Path.join(dir, `${name}@${displayVersion}@${id}.ipa`)
  );

  set(Number(id), {
    name,
    displayVersion,
    bundleId,
    icon,
  });

  console.log(`${name}授权成功`);
};
