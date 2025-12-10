// 文件：scripts/ipaTool/pages/Files/InstallButton.tsx
// 说明：安装按钮通用封装，无需传参，固定样式与占位点击
import { ZStack, Image, Text, Link, Button } from "scripting";
import { Colors, FontStyles } from "../../constants/designTokens";

interface Props {
  id: string;
  name: string;
  bundleId: string;
  displayVersion: number;
}

const InstallButton = ({ id, bundleId, displayVersion, name }: Props) => {
  const meta =
    `name=${name}&bundleId=${bundleId}&displayVersion=${displayVersion}&id=${id}`
      .replaceAll("=", "%3D")
      .replaceAll("&", "%26");
  return (
    <Link
      buttonStyle="plain"
      url={`itms-services://?action=download-manifest&amp;url=https://xiaobai.app/install?${meta}`}
    >
      <ZStack>
        <Image
          systemName="capsule.fill"
          opacity={0.2}
          symbolRenderingMode="hierarchical"
          contentTransition="symbolEffect"
          scaleEffect={2.3}
          frame={{ width: 40, height: 40 }}
          foregroundStyle={Colors.button.gray}
        />
        <Text {...FontStyles.button} foregroundStyle={Colors.button.blue}>
          安装
        </Text>
      </ZStack>
    </Link>
  );
};

export default InstallButton;
