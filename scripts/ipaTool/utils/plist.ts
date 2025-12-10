/**
 * File: utils/plist.ts
 *
 * iTunesMetadata.plist 处理工具
 */

// 转义正则表达式特殊字符
const escapeRegex = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 替换 plist 中指定 key 的 integer 值
const replaceIntegerValue = (xml: string, key: string, newValue: number) =>
  xml.replace(
    new RegExp(`(<key>${escapeRegex(key)}</key>\\s*<integer>)\\d+(<\\/integer>)`, "g"),
    `$1${newValue}$2`
  );

// 从 plist 中移除指定的 key 及其值
const removeKey = (xml: string, key: string) =>
  xml.replace(
    new RegExp(`\\s*<key>${escapeRegex(key)}</key>\\s*<[^>]+>[^<]*</[^>]+>`, "g"),
    ""
  );

/**
 * 修改 iTunesMetadata.plist 以禁用 App Store 更新检测
 *
 * 原理：
 * 1. 将 softwareVersionExternalIdentifier 设置为极大值，让系统认为已是最新版
 * 2. 移除 com.apple.iTunesStore.downloadInfo 追踪信息
 * 3. 保留显示版本号 (bundleShortVersionString) 不变
 */
export const disableUpdateCheck = (metadataXml: string): string => {
  if (!metadataXml) return metadataXml;

  let result = replaceIntegerValue(
    metadataXml,
    "softwareVersionExternalIdentifier",
    999999999999
  );
  result = removeKey(result, "com.apple.iTunesStore.downloadInfo");

  return result;
};
