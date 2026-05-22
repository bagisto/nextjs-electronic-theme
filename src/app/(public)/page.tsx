import { GET_THEME_CUSTOMIZATION } from "@/graphql";
import RenderThemeCustomization from "@components/home/RenderThemeCustomization";
import { ThemeCustomizationResponse } from "@/types/theme/theme-customization";
import { cachedGraphQLRequest } from "@hooks/useCache";

export const revalidate = 3600;

export default async function Home() {
  const data = await cachedGraphQLRequest<ThemeCustomizationResponse>(
    "home" , 
    GET_THEME_CUSTOMIZATION,
    { first: 20 },
  );

  return (
    <RenderThemeCustomization themeCustomizations={data?.themeCustomizations} />
  );
}
