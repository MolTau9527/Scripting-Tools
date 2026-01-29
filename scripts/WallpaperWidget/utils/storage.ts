import { Path } from "scripting";
import { ACGConfig } from "./types";

type Data = {
  toRawString(encoding: string): string | null;
};

declare const Data: {
  fromFile(path: string): Data | null;
  fromRawString(content: string, encoding: string): Data | null;
};

declare const FileEntity: {
  openNewForWriting(path: string): {
    write(data: Data): void;
    close(): void;
  };
};

declare const FileManager: {
  appGroupDocumentsDirectory: string;
};

const CONFIG_FILE = Path.join(
  FileManager.appGroupDocumentsDirectory, 
  "acg_widget_config.json"
);

export const loadConfig = (): ACGConfig | null => {
  try {
    const data = Data.fromFile(CONFIG_FILE);
    if (!data) {
      return null;
    }

    const configStr = data.toRawString("utf-8");
    if (!configStr) {
      return null;
    }

    return JSON.parse(configStr);
  } catch (error) {
    console.error("读取配置文件失败:", error);
    return null;
  }
};

export const saveConfig = (config: ACGConfig): void => {
  try {
    const configStr = JSON.stringify(config);
    const data = Data.fromRawString(configStr, "utf-8");
    
    if (!data) {
      throw new Error("无法创建配置数据");
    }

    const file = FileEntity.openNewForWriting(CONFIG_FILE);
    file.write(data);
    file.close();
    
    console.log("配置保存成功");
  } catch (error) {
    console.error("保存配置失败:", error);
    throw error;
  }
};
