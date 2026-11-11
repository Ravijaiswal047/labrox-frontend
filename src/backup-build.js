// src/backup-build.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fse from "fs-extra";

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distPath = path.join(rootDir, "dist");

const backupBase = "C:/Users/admin/Desktop/Itdose/LDPL";

const now = new Date();
const date = now
  .toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  })
  .replace(/\//g, "-");

const time = now
  .toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
  .replace(":", "-");
// .replace(/\s/g, "");

const dateFolder = path.join(backupBase, date);
const timeFolder = path.join(dateFolder, time);

try {
  if (!fs.existsSync(dateFolder)) {
    fs.mkdirSync(dateFolder, { recursive: true });
    console.log(`📁 Created folder: ${dateFolder}`);
  }

  fse.copySync(distPath, timeFolder);
  console.log(`✅ Backup created at: ${timeFolder}`);
} catch (err) {
  console.error("❌ Backup failed:", err);
  process.exit(1);
}
