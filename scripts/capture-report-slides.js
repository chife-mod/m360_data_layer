#!/usr/bin/env node
/**
 * Capture each slide of a Green Report as a PNG, for the report preview strip
 * in the Tasks & Apps popup.
 *
 * Static images rather than live iframes: the strip shows a dozen pages at
 * once, and a dozen iframes each booting the whole report makes the popup
 * crawl. The reports are stable published decks, so a capture is as truthful
 * as a live render and costs one image request.
 *
 * Uses puppeteer-core against the Chrome that puppeteer already cached in
 * ~/.cache/puppeteer — nothing is downloaded.
 *
 * Usage:
 *   node scripts/capture-report-slides.js <url> <out-name> [selector]
 *
 * Example:
 *   node scripts/capture-report-slides.js \
 *     https://chife-mod.github.io/sf-pumb-monthly-pulse/ pumb
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CACHE = path.join(os.homedir(), ".cache", "puppeteer", "chrome");

function findChrome() {
  if (!fs.existsSync(CACHE)) return null;
  // Newest build wins — the cache accumulates versions over time.
  const builds = fs
    .readdirSync(CACHE)
    .filter((d) => d.startsWith("mac") || d.startsWith("linux") || d.startsWith("win"))
    .sort()
    .reverse();

  for (const build of builds) {
    const candidates = [
      path.join(CACHE, build, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      path.join(CACHE, build, "chrome-mac-x64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      path.join(CACHE, build, "chrome-linux64", "chrome"),
    ];
    const hit = candidates.find((p) => fs.existsSync(p));
    if (hit) return hit;
  }
  return null;
}

async function main() {
  const [url, outName, selector = ".slide-wrapper"] = process.argv.slice(2);
  if (!url || !outName) {
    console.error("usage: capture-report-slides.js <url> <out-name> [selector]");
    process.exit(1);
  }

  const executablePath = findChrome();
  if (!executablePath) {
    console.error("No cached Chrome found under ~/.cache/puppeteer/chrome");
    process.exit(1);
  }

  const outDir = path.join(__dirname, "..", "public", "assets", "reports", outName);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Reports animate slides in on scroll; walk the page so every slide paints.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 220));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });

    const slides = await page.$$(selector);
    if (!slides.length) {
      console.error(`No elements matched ${selector}`);
      process.exit(1);
    }

    const manifest = [];
    for (let i = 0; i < slides.length; i++) {
      const name = `slide-${String(i + 1).padStart(2, "0")}.png`;
      await slides[i].scrollIntoView();
      await new Promise((r) => setTimeout(r, 350));
      await slides[i].screenshot({ path: path.join(outDir, name) });
      manifest.push(name);
      console.log(`  ${outName}/${name}`);
    }

    fs.writeFileSync(
      path.join(outDir, "manifest.json"),
      JSON.stringify({ url, slides: manifest }, null, 2)
    );
    console.log(`\n${manifest.length} slides -> public/assets/reports/${outName}/`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
