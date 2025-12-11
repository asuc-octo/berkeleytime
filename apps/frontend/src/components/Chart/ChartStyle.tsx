import { ChartConfig } from "./types";

const THEMES = { light: "", dark: ".dark" } as const;

interface ChartStyleProps {
  id: string;
  config: ChartConfig;
}

export function ChartStyle({ id, config }: ChartStyleProps) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
            ${prefix} [data-chart=${id}] {
            ${colorConfig
              .map(([key, itemConfig]) => {
                const color =
                  itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
                  itemConfig.color;
                return color ? `  --color-${key}: ${color};` : null;
              })
              .join("\n")}
            }
            `
          )
          .join("\n"),
      }}
    />
  );
}
