import { chromium } from 'playwright';
import path from 'path';

const SCREENSHOT_DIR = '/home/tuss/.gemini/antigravity/brain/d5d5c65c-7e4d-4c4a-a132-08c7b7cef5e3/e2e_screenshots';
const BASE_URL = 'https://cvresources.tech';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ];

  const pages = [
    { name: 'dashboard', url: `${BASE_URL}/dashboard` },
    { name: 'onboarding', url: `${BASE_URL}/onboarding` },
    { name: 'engagement', url: `${BASE_URL}/engagement` },
    { name: 'training', url: `${BASE_URL}/training` },
    { name: 'performance', url: `${BASE_URL}/performance` },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // Login as HR first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'tunguyen2006.qt@gmail.com');
    await page.fill('input[type="password"]', 'dang.2006');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    for (const p of pages) {
      await page.goto(p.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasOverflow = scrollWidth > clientWidth;

      console.log(`[${vp.name.toUpperCase()}] ${p.name}: width=${clientWidth}, scrollWidth=${scrollWidth}, overflow=${hasOverflow ? 'YES (FAIL)' : 'NO (PASS)'}`);

      const filename = path.join(SCREENSHOT_DIR, `responsive_${vp.name}_${p.name}.png`);
      await page.screenshot({ path: filename, fullPage: false });
    }

    await context.close();
  }

  await browser.close();
  console.log('Finished capturing all responsive screenshots!');
}

main().catch(err => {
  console.error('Error during responsive verification:', err);
  process.exit(1);
});
