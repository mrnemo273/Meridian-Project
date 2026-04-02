#!/usr/bin/env node
/**
 * Evidence Download Script — Case 006: USS Roosevelt Encounters
 * Copies existing GIMBAL/GOFAST assets from Case 001, downloads additional assets.
 * Run: node scripts/fetch-evidence-case-006.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Files to copy from Case 001
const COPY_FILES = [
  { src: "public/media/cases/001/gimbal.mp4", dest: "public/media/cases/006/gimbal.mp4" },
  { src: "public/media/cases/001/gofast.mp4", dest: "public/media/cases/006/gofast.mp4" },
  { src: "public/images/cases/001/gimbal-frame.png", dest: "public/images/cases/006/gimbal-frame.png" },
  { src: "public/images/cases/001/gofast-frame.png", dest: "public/images/cases/006/gofast-frame.png" },
];

const ASSETS = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/200125-N-LH674-1073_USS_Theodore_Roosevelt_%28CVN-71%29.jpg",
    savePath: "public/images/cases/006/uss-roosevelt.jpg",
    filename: "uss-roosevelt.jpg",
    attribution: "U.S. Navy / Wikimedia Commons",
    license: "Public Domain — US Government work",
  },
];

function copyFiles() {
  for (const { src, dest } of COPY_FILES) {
    const srcPath = path.resolve(src);
    const destPath = path.resolve(dest);
    if (fs.existsSync(destPath)) {
      console.log(`  SKIP (exists): ${path.basename(dest)}`);
      continue;
    }
    if (!fs.existsSync(srcPath)) {
      console.log(`  SKIP (source missing): ${src}`);
      continue;
    }
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`  COPY: ${path.basename(src)} → ${dest}`);
  }
}

function download(asset) {
  return new Promise((resolve, reject) => {
    const fullPath = path.resolve(asset.savePath);
    if (fs.existsSync(fullPath)) {
      console.log(`  SKIP (exists): ${asset.filename}`);
      return resolve();
    }
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const get = (url, redirects = 0) => {
      if (redirects > 5) return reject(new Error("Too many redirects"));
      const mod = url.startsWith("https") ? https : http;
      mod.get(url, { headers: { "User-Agent": "MeridianProject/1.0 (evidence-collector)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          console.log(`  FAIL (${res.statusCode}): ${asset.filename} — ${url}`);
          res.resume();
          return resolve();
        }
        const file = fs.createWriteStream(fullPath);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`  OK: ${asset.filename}`);
          console.log(`      Attribution: ${asset.attribution}`);
          console.log(`      License: ${asset.license}`);
          resolve();
        });
      }).on("error", (e) => {
        console.log(`  ERR: ${asset.filename} — ${e.message}`);
        resolve();
      });
    };
    get(asset.url);
  });
}

async function main() {
  console.log("=== Case 006: USS Roosevelt — Evidence Download ===\n");

  console.log("Copying GIMBAL/GOFAST from Case 001:");
  copyFiles();

  console.log("\nDownloading additional assets:");
  for (const asset of ASSETS) {
    await download(asset);
  }
  console.log("\nDone.");
}

main();
