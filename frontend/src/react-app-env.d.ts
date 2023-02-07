/// <reference types="react-scripts" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.jpg" {
  const value: string;
  export = value;
}

declare module "*.png" {
  const value: string;
  export = value;
}

declare module "*.svg" {
  const svg: string;
  export default svg;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}