/**
 * File: utils/notification.ts
 *
 * 通知工具函数
 * 二次封装 Notification API，支持类型判断和配置检查
 */

import { Notification } from "scripting";
import { AppConfig } from "../constants/AppConfig";

/**
 * 通知类型
 */
const notificationType = [
  "downloadSuccess",
  "downloadFailed",
  "serverNotification",
];
export type NotificationType = (typeof notificationType)[number];

/**
 * 类型守卫：判断是否为通知类型
 */
const isNotificationType = (
  value: NotificationType | string
): value is string => {
  return !notificationType.includes(value);
};

/**
 * 使用通知类型发送通知（有配置检查）
 * @param type 通知类型（downloadSuccess 下载成功 / downloadFailed 下载失败 / serverNotification 服务通知）
 * @param body 通知内容
 * @returns Promise<boolean> 是否发送成功
 */
export function sendNotification(
  type: NotificationType,
  body: string
): Promise<boolean>;

/**
 * 使用自定义标题发送通知（无配置检查，直接发送）
 * @param title 通知标题
 * @param body 通知内容
 * @returns Promise<boolean> 是否发送成功
 */
export function sendNotification(title: string, body: string): Promise<boolean>;

/**
 * 发送通知实现
 */
export async function sendNotification(
  typeOrTitle: NotificationType | string,
  body: string
): Promise<boolean | undefined> {
  if (isNotificationType(typeOrTitle)) {
    return Notification.schedule({ title: typeOrTitle, body });
  }

  switch (typeOrTitle) {
    case "downloadSuccess":
      return (
        AppConfig.notification.downloadSuccess &&
        Notification.schedule({ title: "下载完成", body })
      );
    case "downloadFailed":
      return (
        AppConfig.notification.downloadFailed &&
        Notification.schedule({ title: "下载失败", body })
      );
    case "serverNotification":
      return (
        AppConfig.notification.serverNotification &&
        Notification.schedule({ title: "服务通知", body })
      );
  }
}
