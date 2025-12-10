/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @param unit 单位（默认：B）
 * @returns 格式化后的文件大小字符串
 */

const units = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
type SizeUnit = (typeof units)[number];

export const formatSize = (size: number, unit: SizeUnit = "B") => {
  const currentIndex = Math.max(0, units.indexOf(unit));
  let bytes = size * 1024 ** currentIndex;
  let unitIndex = 0;
  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
  }
  const formattedSize =
    bytes < 10
      ? bytes.toFixed(2)
      : bytes < 100
      ? bytes.toFixed(1)
      : Math.round(bytes).toString();
  return `${formattedSize} ${units[unitIndex]}`;
};
