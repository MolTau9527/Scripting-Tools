// 常量
export const MAX_RANDOM_ID = 9999;
export const MIN_ID = 1;
export const MIN_REFRESH_INTERVAL = 60;
export const DEFAULT_REFRESH_SECONDS = 300;

export const generateRandomId = (): number => {
  return Math.floor(Math.random() * MAX_RANDOM_ID) + MIN_ID;
};

export const validateId = (id: string): { valid: boolean; value?: number; error?: string } => {
  const trimmedId = id.trim();
  
  if (!trimmedId) {
    return { valid: true };
  }

  if (!/^\d+$/.test(trimmedId)) {
    return { valid: false, error: "ID 必须是纯数字" };
  }

  const numValue = parseInt(trimmedId, 10);

  if (numValue <= 0) {
    return { valid: false, error: "ID 必须大于 0" };
  }

  return { valid: true, value: numValue };
};

export const validateInterval = (interval: string): { 
  valid: boolean; 
  value?: number; 
  error?: string; 
  shouldEnable?: boolean 
} => {
  const trimmedInterval = interval.trim();
  
  if (!trimmedInterval) {
    return { valid: true, shouldEnable: false };
  }

  if (!/^\d+$/.test(trimmedInterval)) {
    return { valid: false, error: "间隔必须是纯数字" };
  }

  const numValue = parseInt(trimmedInterval, 10);
  const shouldEnable = numValue >= MIN_REFRESH_INTERVAL;

  return { 
    valid: true, 
    value: numValue, 
    shouldEnable 
  };
};
