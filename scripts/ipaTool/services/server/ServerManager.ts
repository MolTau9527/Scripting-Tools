// 文件：scripts/ipaTool/services/server/ServerManager.ts
// 说明：HTTP 文件服务器管理，用于提供 IPA 文件下载服务

import { AppConfig } from "../../constants/AppConfig";
import { BackgroundManager } from "../../modules/BackgroundManager";
import { testApiConnection } from "../api/connection";
import { AppEvents, Path } from "scripting";
import { sendNotification } from "../../utils";

// 创建后台管理器实例，用于控制后台保活
const backgroundManager = new BackgroundManager();

// 获取 IPA 文件存储根目录
const root = Path.join(FileManager.documentsDirectory, AppConfig.file.folder);

// 创建 HTTP 服务器实例
export const server = new HttpServer();

/**
 * 注册文件服务路由
 * 路由格式：http://localhost:8000/:file
 * 例如：http://localhost:8000/app.ipa
 */
server.registerFilesFromDirectory("/:file", root);

/**
 * 启动服务器
 * 端口：8000
 */
const error = server.start({ port: 8000 });
error && sendNotification("serverNotification", error);
console.log(error ? `服务器启动失败: ${error}` : "服务器启动成功", server.port);

/**
 * 测试 API 连接
 * 在服务器启动后检查外部 API 是否可用
 */
testApiConnection();

/**
 * 监听应用生命周期变化
 * - active: 应用进入前台，停用后台保活
 * - background: 应用进入后台，启用后台保活（保持服务器运行）
 */
AppEvents.scenePhase.addListener(phase => {
  if (phase === "active") {
    backgroundManager.setActive(false);
  } else if (phase === "background") {
    backgroundManager.setActive(true);
  }
});
