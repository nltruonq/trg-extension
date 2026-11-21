/**
 * Gói shield của MAIN world thành một file IIFE độc lập.
 *
 * Không đi qua crxjs được: loader nó sinh ra gọi `chrome.runtime.getURL()`,
 * thứ không tồn tại trong MAIN world, và nạp module bằng `import()` bất đồng
 * bộ nên script của trang kịp chạy trước. File này được background nạp bằng
 * `chrome.scripting.registerContentScripts({ world: "MAIN" })` — Chrome tự
 * tiêm ở document_start, đúng thời điểm cần, và không cần chrome.* bên trong.
 */
import { build } from "esbuild";

await build({
  entryPoints: ["src/content/shield.main.ts"],
  outfile: "dist/shield.js",
  bundle: true,
  format: "iife",
  target: "chrome111",
  minify: true,
  legalComments: "none",
});

console.log("dist/shield.js  (MAIN world, IIFE)");
