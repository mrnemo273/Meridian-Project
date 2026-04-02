#!/usr/bin/env node
/**
 * Evidence Download Script — Case 004: Tehran F-4 Intercept
 * Downloads public domain assets for the Tehran case.
 * Run: node scripts/fetch-evidence-case-004.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ASSETS = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Irani_F-4_Phantom_II_refueling_through_a_boom.jpg",
    savePath: "public/images/cases/004/f4-phantom.jpg",
    filename: "f4-phantom.jpg",
    attribution: "Wikimedia Commons",
    license: "CC BY-SA or Public Domain",
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
  console.log("=== Case 004: Tehran F-4 Intercept — Evidence Download ===\n");
  console.log("Note: tehran-airspace-map.svg is an original SVG (no download needed).\n");
  for (const asset of ASSETS) {
    await download(asset);
  }
  console.log("\nDone.");
}

main();
