// File: utils/fileCleanup.ts
// 说明：文件清理工具 - 检查文件是否存在，如果不存在则删除

import { Path } from "scripting"
import { AppConfig } from "../constants/AppConfig"

/**
 * 检查指定文件是否存在，如果不存在则删除该文件
 * @param fileName 要检查的文件名
 * @returns 返回是否执行了删除操作
 */
export const removeFileIfNotExists = (appName: string | undefined) => {
  const dir = Path.join(FileManager.documentsDirectory, AppConfig.file.folder)
  if (!FileManager.existsSync(dir) || !appName) return
  FileManager.readDirectorySync(dir).forEach(fileName => {
    if (!fileName.endsWith(".zip")) return
    fileName.includes(appName) || FileManager.remove(Path.join(dir, fileName))
  })
}
