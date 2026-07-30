import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/components/ui/index.ts" },
  format: ["esm"],
  dts: true,
  tsconfig: "tsconfig.ds.json",
  external: ["react", "react-dom"],
  outDir: "dist",
  clean: true,
});
