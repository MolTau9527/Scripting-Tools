export type Country = {
  code: string;
  name: string; // 中文显示名
};

// 常用及 App Store 支持的国家/地区（可根据需要继续扩充）
export const COUNTRIES: Country[] = [
  { code: "CN", name: "中国大陆" },
  { code: "HK", name: "中国香港" },
  { code: "MO", name: "中国澳门" },
  { code: "TW", name: "中国台湾" },
  { code: "US", name: "美国" },
  { code: "JP", name: "日本" },
  { code: "KR", name: "韩国" },
  { code: "GB", name: "英国" },
  { code: "DE", name: "德国" },
  { code: "FR", name: "法国" },
  { code: "CA", name: "加拿大" },
  { code: "AU", name: "澳大利亚" },
  { code: "NZ", name: "新西兰" },
  { code: "RU", name: "俄罗斯" },
  { code: "BR", name: "巴西" },
  { code: "IN", name: "印度" },
  { code: "ID", name: "印度尼西亚" },
  { code: "TH", name: "泰国" },
  { code: "MY", name: "马来西亚" },
  { code: "SG", name: "新加坡" },
  { code: "VN", name: "越南" },
  { code: "PH", name: "菲律宾" },
  { code: "IT", name: "意大利" },
  { code: "ES", name: "西班牙" },
  { code: "PT", name: "葡萄牙" },
  { code: "NL", name: "荷兰" },
  { code: "BE", name: "比利时" },
  { code: "CH", name: "瑞士" },
  { code: "AT", name: "奥地利" },
  { code: "IE", name: "爱尔兰" },
  { code: "DK", name: "丹麦" },
  { code: "SE", name: "瑞典" },
  { code: "NO", name: "挪威" },
  { code: "FI", name: "芬兰" },
  { code: "PL", name: "波兰" },
  { code: "CZ", name: "捷克" },
  { code: "SK", name: "斯洛伐克" },
  { code: "HU", name: "匈牙利" },
  { code: "RO", name: "罗马尼亚" },
  { code: "BG", name: "保加利亚" },
  { code: "GR", name: "希腊" },
  { code: "TR", name: "土耳其" },
  { code: "UA", name: "乌克兰" },
  { code: "IL", name: "以色列" },
  { code: "AE", name: "阿拉伯联合酋长国" },
  { code: "SA", name: "沙特阿拉伯" },
  { code: "QA", name: "卡塔尔" },
  { code: "KW", name: "科威特" },
  { code: "OM", name: "阿曼" },
  { code: "BH", name: "巴林" },
  { code: "EG", name: "埃及" },
  { code: "MA", name: "摩洛哥" },
  { code: "TN", name: "突尼斯" },
  { code: "ZA", name: "南非" },
  { code: "NG", name: "尼日利亚" },
  { code: "MX", name: "墨西哥" },
  { code: "AR", name: "阿根廷" },
  { code: "CL", name: "智利" },
  { code: "CO", name: "哥伦比亚" },
  { code: "PE", name: "秘鲁" },
  { code: "UY", name: "乌拉圭" },
  { code: "PA", name: "巴拿马" },
  { code: "CR", name: "哥斯达黎加" },
  { code: "DO", name: "多米尼加" },
  { code: "PY", name: "巴拉圭" },
  { code: "BO", name: "玻利维亚" },
  { code: "VE", name: "委内瑞拉" },
  { code: "IS", name: "冰岛" },
  { code: "LU", name: "卢森堡" },
  { code: "LI", name: "列支敦士登" },
  { code: "MT", name: "马耳他" },
  { code: "CY", name: "塞浦路斯" },
  { code: "LT", name: "立陶宛" },
  { code: "LV", name: "拉脱维亚" },
  { code: "EE", name: "爱沙尼亚" },
  { code: "RS", name: "塞尔维亚" },
  { code: "BA", name: "波斯尼亚和黑塞哥维那" },
  { code: "MK", name: "北马其顿" },
  { code: "AL", name: "阿尔巴尼亚" },
  { code: "MD", name: "摩尔多瓦" },
  { code: "ME", name: "黑山" },
  { code: "AD", name: "安道尔" },
  { code: "MC", name: "摩纳哥" },
  { code: "SM", name: "圣马力诺" },
];

export function getCountryName(code: string): string {
  const c = COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
  return c ? c.name : code.toUpperCase();
}

/**
 * 将 ISO 3166-1 alpha-2 国家/地区代码转换为国旗 emoji。
 * 规则：使用两个“区域指示符”字符拼接（A->U+1F1E6 ... Z->U+1F1FF）。
 * 注意：'UK' 并非标准代码，若遇到则规范化为 'GB'。
 */
export const countryCodeToFlag = (code: string): string => {
  if (!code) return "";
  let c = code.trim().toUpperCase();
  // 兼容常见别名
  if (c === "UK") c = "GB";
  // 只处理标准的两位字母代码
  if (!/^[A-Z]{2}$/.test(c)) return "";
  const A = 0x41; // 'A'
  const REGIONAL_INDICATOR_BASE = 0x1f1e6; // 'A' 的区域指示符起始码点
  const cp1 = REGIONAL_INDICATOR_BASE + (c.charCodeAt(0) - A);
  const cp2 = REGIONAL_INDICATOR_BASE + (c.charCodeAt(1) - A);
  return String.fromCodePoint(cp1) + String.fromCodePoint(cp2);
};

// 货币代码到货币符号的映射对象
export const CURRENCY_SYMBOLS: Record<string, string> = {
  // 主要货币
  USD: "$", // 美元
  EUR: "€", // 欧元
  GBP: "£", // 英镑
  JPY: "¥", // 日元
  CNY: "¥", // 人民币
  KRW: "₩", // 韩元
  CAD: "C$", // 加拿大元
  AUD: "A$", // 澳大利亚元
  CHF: "CHF", // 瑞士法郎
  SEK: "kr", // 瑞典克朗
  NOK: "kr", // 挪威克朗
  DKK: "kr", // 丹麦克朗
  PLN: "zł", // 波兰兹罗提
  CZK: "Kč", // 捷克克朗
  HUF: "Ft", // 匈牙利福林
  RUB: "₽", // 俄罗斯卢布
  TRY: "₺", // 土耳其里拉
  ILS: "₪", // 以色列新谢克尔
  AED: "د.إ", // 阿联酋迪拉姆
  SAR: "﷼", // 沙特里亚尔
  QAR: "﷼", // 卡塔尔里亚尔
  KWD: "د.ك", // 科威特第纳尔
  OMR: "﷼", // 阿曼里亚尔
  BHD: ".د.ب", // 巴林第纳尔
  EGP: "£", // 埃及镑
  MAD: "د.م.", // 摩洛哥迪拉姆
  TND: "د.ت", // 突尼斯第纳尔
  ZAR: "R", // 南非兰特
  NGN: "₦", // 尼日利亚奈拉
  MXN: "$", // 墨西哥比索
  BRL: "R$", // 巴西雷亚尔
  ARS: "$", // 阿根廷比索
  CLP: "$", // 智利比索
  COP: "$", // 哥伦比亚比索
  PEN: "S/", // 秘鲁新索尔
  UYU: "$U", // 乌拉圭比索
  PAB: "B/.", // 巴拿马巴波亚
  CRC: "₡", // 哥斯达黎加科朗
  DOP: "RD$", // 多米尼加比索
  PYG: "₲", // 巴拉圭瓜拉尼
  BOB: "Bs.", // 玻利维亚玻利维亚诺
  VES: "Bs.S", // 委内瑞拉玻利瓦尔
  ISK: "kr", // 冰岛克朗
  INR: "₹", // 印度卢比
  IDR: "Rp", // 印尼盾
  THB: "฿", // 泰铢
  MYR: "RM", // 马来西亚林吉特
  SGD: "S$", // 新加坡元
  VND: "₫", // 越南盾
  PHP: "₱", // 菲律宾比索
  HKD: "HK$", // 港币
  TWD: "NT$", // 新台币
  MOP: "MOP$", // 澳门币
  NZD: "NZ$", // 新西兰元
};

/**
 * 将货币代码转换为货币符号
 * @param currencyCode 货币代码（如 "CNY", "USD", "EUR" 等）
 * @returns 对应的货币符号，如果找不到则返回原货币代码
 */
export const currencyCodeToSymbol = (currencyCode: string): string => {
  if (!currencyCode) return "";
  const code = currencyCode.trim().toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
};

const countryCodes = {
  AE: "143481",
  AG: "143540",
  AI: "143538",
  AL: "143575",
  AM: "143524",
  AO: "143564",
  AR: "143505",
  AT: "143445",
  AU: "143460",
  AZ: "143568",
  BB: "143541",
  BD: "143490",
  BE: "143446",
  BG: "143526",
  BH: "143559",
  BM: "143542",
  BN: "143560",
  BO: "143556",
  BR: "143503",
  BS: "143539",
  BW: "143525",
  BY: "143565",
  BZ: "143555",
  CA: "143455",
  CH: "143459",
  CI: "143527",
  CL: "143483",
  CN: "143465",
  CO: "143501",
  CR: "143495",
  CY: "143557",
  CZ: "143489",
  DE: "143443",
  DK: "143458",
  DM: "143545",
  DO: "143508",
  DZ: "143563",
  EC: "143509",
  EE: "143518",
  EG: "143516",
  ES: "143454",
  FI: "143447",
  FR: "143442",
  GB: "143444",
  GD: "143546",
  GE: "143615",
  GH: "143573",
  GR: "143448",
  GT: "143504",
  GY: "143553",
  HK: "143463",
  HN: "143510",
  HR: "143494",
  HU: "143482",
  ID: "143476",
  IE: "143449",
  IL: "143491",
  IN: "143467",
  IS: "143558",
  IT: "143450",
  JM: "143511",
  JO: "143528",
  JP: "143462",
  KE: "143529",
  KN: "143548",
  KR: "143466",
  KW: "143493",
  KY: "143544",
  KZ: "143517",
  LB: "143497",
  LC: "143549",
  LI: "143522",
  LK: "143486",
  LT: "143520",
  LU: "143451",
  LV: "143519",
  MD: "143523",
  MG: "143531",
  MK: "143530",
  ML: "143532",
  MN: "143592",
  MO: "143515",
  MS: "143547",
  MT: "143521",
  MU: "143533",
  MV: "143488",
  MX: "143468",
  MY: "143473",
  NE: "143534",
  NG: "143561",
  NI: "143512",
  NL: "143452",
  NO: "143457",
  NP: "143484",
  NZ: "143461",
  OM: "143562",
  PA: "143485",
  PE: "143507",
  PH: "143474",
  PK: "143477",
  PL: "143478",
  PT: "143453",
  PY: "143513",
  QA: "143498",
  RO: "143487",
  RS: "143500",
  RU: "143469",
  SA: "143479",
  SE: "143456",
  SG: "143464",
  SI: "143499",
  SK: "143496",
  SN: "143535",
  SR: "143554",
  SV: "143506",
  TC: "143552",
  TH: "143475",
  TN: "143536",
  TR: "143480",
  TT: "143551",
  TW: "143470",
  TZ: "143572",
  UA: "143492",
  UG: "143537",
  US: "143441",
  UY: "143514",
  UZ: "143566",
  VC: "143550",
  VE: "143502",
  VG: "143543",
  VN: "143471",
  YE: "143571",
  ZA: "143472",
};

/**
 * 根据商店ID获取国家编码
 * @param storeId 商店ID（字符串或数字）
 * @returns 国家编码（如 "CN", "US"），如果找不到则返回 undefined
 */
export const storeIdToCode = (storeId: string | number): string | undefined => {
  const id = String(storeId);
  return Object.keys(countryCodes).find(
    code => countryCodes[code as keyof typeof countryCodes] === id
  );
};
