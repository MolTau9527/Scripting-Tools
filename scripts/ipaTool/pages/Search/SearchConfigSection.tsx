import { Section, Text, VStack } from "scripting";
import { FontStyles, Colors } from "../../constants/designTokens";

// 组件内部样式组合 - Section 次要文字样式
const sectionTextStyle = {
  font: FontStyles.caption.font,
  foregroundStyle: Colors.text.secondary,
} as const;

interface SearchConfigSectionProps {
  title: string;
  description: string;
  details?: string[];
  children: any;
}

/**
 * 搜索配置选项的通用 Section 组件
 * 统一样式和结构，减少重复代码
 */
export default function SearchConfigSection({
  title,
  description,
  details,
  children,
}: SearchConfigSectionProps) {
  return (
    <Section
      header={
        <Text
          {...sectionTextStyle}
        >
          {title}
        </Text>
      }
      footer={
        <VStack spacing={4} alignment="leading">
          <Text
            {...sectionTextStyle}
          >
            {description}
          </Text>
          {details?.map((detail, index) => (
            <Text
              key={index}
              {...sectionTextStyle}
            >
              {detail}
            </Text>
          ))}
        </VStack>
      }
    >
      {children}
    </Section>
  );
}
