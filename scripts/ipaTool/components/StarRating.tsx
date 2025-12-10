import { ZStack, Text, HStack, VStack, type Color } from "scripting";

// 星星大小类型定义
type StarSize = "small" | "medium" | "large" | number;

// 星级评分组件的属性接口
interface StarRatingProps {
  score: number; // 评分，0-无评分，1-5分之间的小数
  size?: StarSize; // 星星大小，支持预设大小或数字
  color?: Color; // 星星颜色，默认为金色
  direction?: "x" | "y"; // 方向，默认为 x 轴
  spacing?: number; // 星星间距，默认为 2
}

// 将 StarSize 转换为数字的辅助函数
const getNumericSize = (size: StarSize): number => {
  if (typeof size === "number") {
    return size;
  }

  switch (size) {
    case "small":
      return 16;
    case "medium":
      return 24;
    case "large":
      return 32;
    default:
      return 24; // 默认中等大小
  }
};

// 单个星星组件
const Star = ({
  size,
  color,
  fillOpacity,
}: {
  fillOpacity: number;
  size: number;
  color: Color;
}) => {
  return (
    <ZStack>
      <Text font={size} fontWeight="thin" foregroundStyle={color}>
        ☆
      </Text>
      <Text
        font={size * 0.85}
        fontWeight="thin"
        foregroundStyle={{
          gradient: [
            { color: color, location: fillOpacity },
            { color: "rgba(0, 0, 0, 0)", location: fillOpacity },
          ],
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 1, y: 0 },
        }}
      >
        ★
      </Text>
    </ZStack>
  );
};

// 星级评分组件
export const StarRating = ({
  score = 0,
  size = "medium",
  color = "#FFD700",
  direction = "x",
  spacing = 2,
}: StarRatingProps) => {
  if (score === 0)
    return Star({ size: getNumericSize(size), color, fillOpacity: score });

  //拆分整数和小数
  const [integer, decimal] = score.toString().split(".");
  const data = Array.from({ length: Number(integer) }, () => 1);
  if (decimal) data.push(Number(`0.${decimal}`));

  const Direction = direction === "x" ? HStack : VStack;
  return (
    <Direction spacing={spacing}>
      {data.map((fillOpacity, index) => (
        <Star
          key={index}
          size={getNumericSize(size)}
          color={color}
          fillOpacity={fillOpacity}
        />
      ))}
    </Direction>
  );
};

export default StarRating;
