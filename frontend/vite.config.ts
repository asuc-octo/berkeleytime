import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from "vite-plugin-svgr";
const path = require('path')
const fs = require('fs');

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  server: {
    port: 3000,
  },
  plugins: [react(), svgr(), tsconfigPaths(), reactVirtualized()],
  resolve: {
    alias:{
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  build: {
    outDir: '../build'
  }
})

//
// Work-around for buggy react-virtualized imports
//
const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
export function reactVirtualized() {
  return {
    name: "my:react-virtualized",
    configResolved() {
      const file = require
        .resolve("react-virtualized")
        .replace(
          path.join("dist", "commonjs", "index.js"),
          path.join("dist", "es", "WindowScroller", "utils", "onScroll.js"),
        );
      const code = fs.readFileSync(file, "utf-8");
      const modified = code.replace(WRONG_CODE, "");
      fs.writeFileSync(file, modified);
    },
  }
}