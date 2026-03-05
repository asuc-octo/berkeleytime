import type { CatalogLayoutMode } from "@/components/ClassBrowser/context/LayoutContext";
import useMinWidth from "@/hooks/useMinWidth";

// Re-export so existing imports keep working
export type { CatalogLayoutMode } from "@/components/ClassBrowser/context/LayoutContext";

export default function useCatalogLayoutMode(): CatalogLayoutMode {
  const isAbove992 = useMinWidth(992);
  const isAbove1400 = useMinWidth(1400);

  if (isAbove1400) return "full";
  if (isAbove992) return "semi-compact";
  return "compact";
}
