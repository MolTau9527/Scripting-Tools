/**
 * File: pages/Settings/Config/ResetConfigButton.tsx
 *
 * 重置配置按钮组件
 */

import { Section, Text, Button, Path } from "scripting";
import { FontStyles, Colors } from "../../../constants/designTokens";
import type { ToastType } from "../../../components/Toast";
import { resetConfig, AppConfig } from "../../../constants/AppConfig";
import { apiReset } from "../../../services/api/auth";
import { dismissApp } from "../../../utils";

interface Props {
  showToast: (type: ToastType, message: string) => void;
}

// 组件内部样式配置
const styles = {
  button: {
    padding: { horizontal: true } as const,
    buttonStyle: "plain" as const,
  },
  buttonText: {
    ...FontStyles.body,
    foregroundStyle: Colors.status.error,
  },
};

const handleResetConfig = async (showToast: Props["showToast"]) => {
  try {
    const selectedIndex = await Dialog.actionSheet({
      title: "是否重置应用",
      message:
        "重置应用将重启app 并清除所有配置数据，包括下载任务、通知设置等。",
      actions: [
        {
          label: "是",
          destructive: true,
        },
      ],
    });

    if (selectedIndex === undefined) return;
    const {
      storageKeys,
      file: { folder },
    } = AppConfig;
    showToast("loading", "重置中");

    // 删除文件
    const dir = Path.join(FileManager.documentsDirectory, folder);
    FileManager.existsSync(dir) && FileManager.removeSync(dir);

    //清空配置
    Object.values(storageKeys).forEach(key => Storage.remove(key));
    resetConfig();

    //重置登录状态和 GUID 缓存
    await apiReset();

    showToast("success", "重置成功");

    setTimeout(dismissApp.current, 1000);
  } catch (error) {
    showToast("error", "重置失败 ❌");
    console.error(error);
  }
};

/**
 * 重置应用按钮组件
 * @param config 完整的 AppConfig 对象
 */
export const ResetConfigButton = ({ showToast }: Props) => {
  return (
    <Section>
      <Button {...styles.button} action={() => handleResetConfig(showToast)}>
        <Text {...styles.buttonText}>重置应用</Text>
      </Button>
    </Section>
  );
};
