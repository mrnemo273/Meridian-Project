#!/usr/bin/env node
/**
 * Evidence Download Script — Case 003: The Belgian Wave
 * Downloads public domain assets for the Belgian Wave case.
 * Run: node scripts/fetch-evidence-case-003.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ASSETS = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/F-16_June_2008.jpg",
    savePath: "public/images/cases/003/baf-f16.jpg",
    filename: "baf-f16.jpg",
    attribution: "U.S. Air Force / Wikimedia Commons",
    license: "Public Domain — US Government work",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/97/F-16_Cockpit_part.JPG",
    savePath: "public/images/cases/003/f16-radar-scope.jpg",
    filename: "f16-radar-scope.jpg",
    attribution: "U.S. Air Force / Wikimedia Commons",
    license: "Public Domain — US Government work",
  },
];

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
  console.log("=== Case 003: Belgian Wave — Evidence Download ===\n");
  console.log("Note: belgian-wave-map.svg is an original SVG (no download needed).\n");
  for (const asset of ASSETS) {
    await download(asset);
  }
  console.log("\nDone. Run the workspace gallery update after downloading.");
}

main();
