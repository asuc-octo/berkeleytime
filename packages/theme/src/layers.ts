/**
 * Global layering contract for Berkeleytime UI surfaces.
 *
 * Keep these values aligned with ThemeProvider.scss CSS custom properties.
 *
 * Policy:
 * - Feature components should consume semantic tokens/CSS vars.
 * - Stack math belongs in shared helpers and theme primitives.
 * - Raw global z-index literals should be treated as lint violations.
 */
export const zIndexLayers = {
  stackBase: 1000,
  menuOverlay: 1001,
  stickyHeader: 1002,
  headerDropdown: 1003,
  selectFloor: 1010,
  topPopover: 9999,
} as const;

export const zIndexOffsets = {
  floating: 1,
  dialogOverlay: 99,
  dialogStep: 100,
} as const;

const zIndexCssVariableByLayer = {
  stackBase: "--z-index-stack-base",
  menuOverlay: "--z-index-menu-overlay",
  stickyHeader: "--z-index-sticky-header",
  headerDropdown: "--z-index-header-dropdown",
  selectFloor: "--z-index-select-floor",
  topPopover: "--z-index-top-popover",
} as const;

export type ZIndexLayer = keyof typeof zIndexLayers;

export const getZIndexCssVar = (layer: ZIndexLayer): `var(${string})` => {
  return `var(${zIndexCssVariableByLayer[layer]})`;
};

export const getFloatingLayerZIndex = (stack: number) => {
  return stack + zIndexOffsets.floating;
};

export const getDialogContentStack = (previousStack: number) => {
  return previousStack + zIndexOffsets.dialogStep;
};

export const getDialogOverlayZIndex = (dialogStack: number) => {
  return dialogStack + zIndexOffsets.dialogOverlay;
};

export const getSelectContentZIndex = (stack: number) => {
  return Math.max(zIndexLayers.selectFloor, getFloatingLayerZIndex(stack));
};

export type DropdownLayerVariant = "topPopover" | "headerDropdown";

const dropdownLayerByVariant: Record<DropdownLayerVariant, ZIndexLayer> = {
  topPopover: "topPopover",
  headerDropdown: "headerDropdown",
};

export const getDropdownLayerZIndexCssVar = (
  variant: DropdownLayerVariant
): `var(${string})` => {
  return getZIndexCssVar(dropdownLayerByVariant[variant]);
};
