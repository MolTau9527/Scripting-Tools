import { Color } from "scripting"

export const CONFIG = {
  ALERT_AFTER_DAYS: 1,
  MIN_ALERT_INTERVAL_HOURS: 6,
  NOTIFY_ON_CLOCKIN: false,
}

export const COLORS = {
  blue: "rgba(59, 130, 246, 1)" as Color,
  blueLight: "rgba(59, 130, 246, 0.15)" as Color,
  green: "rgba(16, 185, 129, 1)" as Color,
  greenLight: "rgba(16, 185, 129, 0.15)" as Color,
  red: "rgba(239, 68, 68, 1)" as Color,
  redLight: "rgba(239, 68, 68, 0.15)" as Color,
}
