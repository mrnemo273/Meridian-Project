#!/usr/bin/env node
/**
 * Evidence Download Script — Case 007: Rendlesham Forest
 * Downloads public domain assets for the Rendlesham case.
 * Run: node scripts/fetch-evidence-case-007.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ASSETS = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Orford_Ness_Lighthouse%2C_Suffolk.jpg",
    savePath: "public/images/cases/007/orford-ness-lighthouse.jpg",
    filename: "orford-ness-lighthouse.jpg",
    attribution: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Supposed_UFO_landing_site_-_Rendlesham_Forest_-_geograph.org.uk_-_263104.jpg",
    savePath: "public/images/cases/007/rendlesham-forest-map.png",
    filename: "rendlesham-forest-map.png",
    attribution: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
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
  console.log("=== Case 007: Rendlesham Forest — Evidence Download ===\n");
  console.log("Note: raf-woodbridge-map.svg is an original SVG (no download needed).\n");
  for (const asset of ASSETS) {
    await download(asset);
  }
  console.log("\nDone.");
}

main();
