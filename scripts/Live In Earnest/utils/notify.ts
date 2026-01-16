import { fetch } from "scripting"

type NotifyMessage = { title: string; body: string }
type NotifySender = (target: string, msg: NotifyMessage) => Promise<boolean>

const JSON_HEADERS = { "content-type": "application/json;charset=utf-8" }

async function trySend(fn: () => Promise<{ ok: boolean }>): Promise<boolean> {
  try {
    return (await fn()).ok
  } catch {
    return false
  }
}

const sendBark: NotifySender = (baseUrl, msg) => {
  const title = encodeURIComponent(msg.title || "提醒")
  const body = encodeURIComponent(msg.body || "")
  return trySend(() => fetch(`${baseUrl.replace(/\/$/, "")}/${title}/${body}`))
}

const sendDingTalk: NotifySender = (webhookUrl, msg) =>
  trySend(() => fetch(webhookUrl, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ msgtype: "text", text: { content: `${msg.title}\n\n${msg.body}` } }),
  }))

const sendPushPlus: NotifySender = (token, msg) =>
  trySend(() => fetch("https://www.pushplus.plus/send", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ token, title: msg.title, content: msg.body, template: "txt" }),
  }))

const sendServerChan: NotifySender = (sendKey, msg) => {
  const title = encodeURIComponent(msg.title || "提醒")
  const desp = encodeURIComponent(msg.body || "")
  return trySend(() => fetch(`https://sctapi.ftqq.com/${sendKey}.send?title=${title}&desp=${desp}`, { method: "POST" }))
}

const sendMessage: NotifySender = async (recipient, msg) => {
  if (!MessageUI.isAvailable) return false
  try {
    return (await MessageUI.present({ recipients: [recipient], body: `${msg.title}\n\n${msg.body}` })) === "sent"
  } catch {
    return false
  }
}

const SENDERS: Record<string, NotifySender> = {
  dingtalk: sendDingTalk,
  pushplus: sendPushPlus,
  serverchan: sendServerChan,
  message: sendMessage,
}

export async function sendNotify(type: string, url: string, msg: NotifyMessage): Promise<boolean> {
  if (!url) return false
  const sender = SENDERS[type] ?? sendBark
  return sender(url, msg)
}

export function isMessageAvailable(): boolean {
  return MessageUI.isAvailable
}
