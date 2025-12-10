import { HStack, Text, Image } from "scripting";
import type { AppSearchResponse, AppSearchError } from "../../types/appStore";
import { Colors } from "../../constants/designTokens";

interface Props {
  name: string;
}

export default function AppListItem({ name }: Props) {
  return (
    <HStack>
      <Image
        systemName="magnifyingglass"
        imageScale="medium"
        foregroundStyle={Colors.text.secondary}
      />
      <Text searchCompletion={name} foregroundStyle={Colors.text.secondary}>
        {name}
      </Text>
    </HStack>
  );
}
