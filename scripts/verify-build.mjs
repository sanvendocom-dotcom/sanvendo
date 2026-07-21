import { access, stat } from "node:fs/promises";
import { constants } from "node:fs";

const requiredPaths = [
  "public/index.html",
  "public/style.css",
  "public/script.js",
  "public/i18n.js",
  "public/admin/index.html",
  "functions/index.js",
  "wrangler.jsonc"
];

for (const path of requiredPaths) {
  await access(path, constants.R_OK);
  const info = await stat(path);
  if (!info.isFile()) {
    throw new Error(`Đường dẫn bắt buộc không phải là tệp: ${path}`);
  }
}

console.log("Cloudflare Pages build check passed.");
console.log("Output directory: public");
console.log("No package dependencies need to be installed.");
