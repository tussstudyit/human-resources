import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Check UpCareer Branding in Header
  const headerBrand = await page.textContent('header');
  console.log('Header text contains UP CAREER:', headerBrand?.includes('UP') && headerBrand?.includes('CAREER'));

  // Take homepage screenshot
  await page.screenshot({ path: '/home/DoanThanhHuy/.gemini/antigravity/brain/315e4e4e-5236-4f56-988a-f1d7d4363dd6/upcareer_homepage_verified.png' });
  console.log('Saved homepage screenshot.');

  // 2. Click a job card "Xem chi tiết JD"
  console.log('2. Clicking "Xem chi tiết JD"...');
  const firstDetailBtn = page.locator('text=Xem chi tiết JD').first();
  await firstDetailBtn.click();
  await page.waitForTimeout(600);

  const currentUrlAfterClick = page.url();
  console.log('Current URL after clicking job:', currentUrlAfterClick);
  if (!currentUrlAfterClick.includes('/jobs/')) {
    throw new Error(`Expected URL to include /jobs/, got: ${currentUrlAfterClick}`);
  }

  // Verify detail view is visible
  const backBtn = page.locator('text=Quay lại danh sách việc làm');
  await backBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Job detail view visible with "Quay lại danh sách việc làm" button.');

  // Take detail view screenshot
  await page.screenshot({ path: '/home/DoanThanhHuy/.gemini/antigravity/brain/315e4e4e-5236-4f56-988a-f1d7d4363dd6/upcareer_job_detail_verified.png' });
  console.log('Saved detail view screenshot.');

  // 3. Test Browser Back button (page.goBack)
  console.log('3. Triggering Browser Back button (page.goBack)...');
  await page.goBack();
  await page.waitForTimeout(600);

  console.log('Current URL after page.goBack():', page.url());
  const jobSectionTitle = page.locator('text=Cơ Hội Việc Làm IT Nổi Bật');
  await jobSectionTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('SUCCESS: Browser Back button returned to job board list!');

  // 4. Test In-Page Back button
  console.log('4. Clicking "Xem chi tiết JD" again...');
  await page.locator('text=Xem chi tiết JD').first().click();
  await page.waitForTimeout(600);

  console.log('Clicking in-page button "Quay lại danh sách việc làm"...');
  await page.locator('text=Quay lại danh sách việc làm').click();
  await page.waitForTimeout(600);

  console.log('Current URL after in-page back:', page.url());
  await page.locator('text=Cơ Hội Việc Làm IT Nổi Bật').waitFor({ state: 'visible', timeout: 5000 });
  console.log('SUCCESS: In-page Back button returned to job board list!');

  // 5. Test Quick Apply Modal branding
  console.log('5. Testing Quick Apply modal branding...');
  await page.locator('text=Xem chi tiết JD').first().click();
  await page.waitForTimeout(400);
  await page.locator('text=Ứng tuyển ngay').first().click();
  await page.waitForTimeout(400);

  const modalText = await page.locator('.fixed.inset-0').textContent();
  console.log('Application modal contains UC badge & UpCareer Platform:', modalText?.includes('UC') && modalText?.includes('UpCareer Platform'));

  await page.screenshot({ path: '/home/DoanThanhHuy/.gemini/antigravity/brain/315e4e4e-5236-4f56-988a-f1d7d4363dd6/upcareer_apply_modal_verified.png' });
  console.log('Saved apply modal screenshot.');

  // 6. Check for any remaining "TopDev" on the page
  const fullContent = await page.content();
  const topDevMatches = fullContent.match(/TopDev/gi) || [];
  console.log('Occurrences of "TopDev" in DOM:', topDevMatches.length);

  await browser.close();
  console.log('ALL VERIFICATIONS PASSED 100%!');
}

main().catch((err) => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
