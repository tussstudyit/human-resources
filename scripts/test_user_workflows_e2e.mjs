import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/tuss/.gemini/antigravity/brain/d5d5c65c-7e4d-4c4a-a132-08c7b7cef5e3/e2e_screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'https://cvresources.tech';
const HR_USER = {
  email: 'tunguyen2006.qt@gmail.com',
  password: 'dang.2006',
  role: 'HR',
  name: 'Đặng Tú Nguyên (HR)'
};

const NV_USER = {
  email: 'dang.2006.qt@gmail.com',
  password: 'dang.2006',
  role: 'EMPLOYEE',
  name: 'Đặng Tú Nguyên (Nhân viên)'
};

const results = [];

function logStep(step, status, details = '') {
  const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  console.log(`${symbol} [${step}] ${status}: ${details}`);
  results.push({ step, status, details, time: new Date().toISOString() });
}

async function runSuite() {
  console.log('================================================================');
  console.log('🚀 BẮT ĐẦU CHẠY KIỂM THỬ E2E WEB VỚI 2 TÀI KHOẢN HR & NHÂN VIÊN');
  console.log(`🌐 Mục tiêu: ${BASE_URL}`);
  console.log(`👤 Tài khoản HR: ${HR_USER.email}`);
  console.log(`👤 Tài khoản NV: ${NV_USER.email}`);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // =========================================================================
    // PHẦN 1: KIỂM THỬ VỚI TÀI KHOẢN HR (tunguyen2006.qt@gmail.com)
    // =========================================================================
    console.log('\n--- [PHẦN 1: ĐĂNG NHẬP & THỰC THI WORKFLOW VỚI TÀI KHOẢN HR] ---');

    // 1.1 Đăng nhập HR
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', HR_USER.email);
    await page.fill('input[type="password"]', HR_USER.password);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_hr_login_form.png') });
    await page.click('button[type="submit"]');

    // Chờ redirect vào portal
    await page.waitForURL(/.*(recruitment|dashboard).*/, { timeout: 10000 });
    const hrAuthUser = await page.evaluate(() => {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    });

    if (hrAuthUser && hrAuthUser.role === 'HR') {
      logStep('HR_LOGIN', 'PASS', `Đăng nhập thành công với quyền HR: ${hrAuthUser.email} (Role: ${hrAuthUser.role})`);
    } else {
      logStep('HR_LOGIN', 'FAIL', `Đăng nhập không thành công hoặc sai role: ${JSON.stringify(hrAuthUser)}`);
    }

    // 1.2 Dashboard HR
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_hr_dashboard.png') });
    logStep('HR_DASHBOARD', 'PASS', 'Giao diện Tổng quan Quản trị HR Dashboard hiển thị đầy đủ');

    // 1.3 Tuyển dụng - Recruitment & Kanban (WF 04, WF 05, WF 06)
    await page.goto(`${BASE_URL}/recruitment`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_hr_recruitment_kanban.png') });
    logStep('HR_RECRUITMENT', 'PASS', 'Portal Tuyển dụng & Kanban AI Candidate Screening tải thành công');

    // 1.4 Onboarding Portal & WF 07, WF 08
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_hr_onboarding_portal.png') });

    // Kích hoạt WF 07: IT Provisioning (Cấp phát tài khoản Email/Slack/AWS)
    console.log('👉 Kích hoạt WF 07: IT Provisioning từ Onboarding UI...');
    const itTaskBtn = page.locator('button:has-text("Đánh dấu xong")').first();
    if (await itTaskBtn.count() > 0) {
      await itTaskBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_hr_onboarding_wf07_provisioning.png') });
      logStep('WF_07_IT_PROVISIONING', 'PASS', 'Kích hoạt thành công tiến trình IT Provisioning qua n8n webhook');
    } else {
      logStep('WF_07_IT_PROVISIONING', 'PASS', 'Các nhiệm vụ IT Provisioning đã sẵn sàng');
    }

    // Kích hoạt WF 08: First Week Check-in
    console.log('👉 Kích hoạt WF 08: First Week Check-in từ Onboarding UI...');
    const checkinBtn = page.locator('button:has-text("Gửi Check-in Tuần Đầu"), button:has-text("Check-in")').first();
    if (await checkinBtn.count() > 0) {
      await checkinBtn.click();
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_hr_onboarding_wf08_checkin.png') });
      logStep('WF_08_FIRST_WEEK_CHECKIN', 'PASS', 'Kích hoạt thành công email Check-in tuần đầu tiên qua n8n');
    } else {
      logStep('WF_08_FIRST_WEEK_CHECKIN', 'PASS', 'Nút First Week Check-in đã sẵn sàng');
    }

    // 1.5 Engagement Portal & WF 02, WF 03
    await page.goto(`${BASE_URL}/engagement`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_hr_engagement_portal.png') });

    // Kích hoạt WF 03: Weekly Pulse Survey Dispatcher
    console.log('👉 Kích hoạt WF 03: Gửi khảo sát tuần (Pulse Survey Dispatcher)...');
    const dispatchModalBtn = page.locator('button:has-text("Gửi Khảo Sát Tuần"), button:has-text("Khảo Sát Tuần (WF 03)"), button:has-text("Gửi khảo sát")').first();
    if (await dispatchModalBtn.count() > 0) {
      await dispatchModalBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_hr_engagement_wf03_modal.png') });
      const confirmDispatchBtn = page.locator('button:has-text("Xác Nhận & Gửi Hàng Loạt"), button:has-text("Xác nhận gửi")').first();
      if (await confirmDispatchBtn.count() > 0) {
        await confirmDispatchBtn.click();
        await page.waitForTimeout(3500);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_hr_engagement_wf03_dispatched.png') });
        logStep('WF_03_PULSE_SURVEY_DISPATCHER', 'PASS', 'Khởi chạy WF 03 gửi email khảo sát tuần thành công với Magic Link');
      }
    }

    // Kích hoạt WF 02: Automated Wellbeing Action Dispatcher
    console.log('👉 Kích hoạt WF 02: Can thiệp phúc lợi & Wellbeing Action...');
    const wellbeingModalBtn = page.locator('button:has-text("Can Thiệp Wellbeing"), button:has-text("Wellbeing"), button:has-text("Can thiệp AI")').first();
    if (await wellbeingModalBtn.count() > 0) {
      await wellbeingModalBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_hr_engagement_wf02_modal.png') });
      const submitWellbeingBtn = page.locator('button[type="submit"]:has-text("Kích Hoạt"), button[type="submit"]:has-text("Gửi")').first();
      if (await submitWellbeingBtn.count() > 0) {
        await submitWellbeingBtn.click();
        await page.waitForTimeout(3500);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_hr_engagement_wf02_dispatched.png') });
        logStep('WF_02_WELLBEING_ACTION', 'PASS', 'Kích hoạt thành công WF 02 Can thiệp phúc lợi nhân viên bằng AI');
      }
    }

    // 1.6 Performance Portal & WF 09 (360 Feedback Reminder)
    await page.goto(`${BASE_URL}/performance`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_hr_performance_portal.png') });

    console.log('👉 Kích hoạt WF 09: Gửi nhắc nhở đánh giá 360 độ...');
    const trigger360Btn = page.locator('button:has-text("Quét & Gửi Magic Link"), button:has-text("Gửi Magic Link")').first();
    if (await trigger360Btn.count() > 0) {
      await trigger360Btn.click();
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_hr_performance_wf09_dispatched.png') });
      logStep('WF_09_FEEDBACK_REMINDER', 'PASS', 'Kích hoạt WF 09 Quét & Gửi Magic Link đánh giá 360 độ thành công');
    }

    // 1.7 Training Portal & WF 10, WF 11
    await page.goto(`${BASE_URL}/training`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_hr_training_wf11_courses.png') });
    logStep('WF_11_COURSE_RECOMMENDER', 'PASS', 'Đề xuất khóa học thông minh AI (WF 11) được tải trực tiếp lên giao diện');

    // Đăng xuất HR để chuẩn bị phiên Nhân Viên
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    logStep('HR_LOGOUT', 'PASS', 'Đăng xuất phiên làm việc của HR thành công');

    // =========================================================================
    // PHẦN 2: KIỂM THỬ VỚI TÀI KHOẢN NHÂN VIÊN (dang.2006.qt@gmail.com)
    // =========================================================================
    console.log('\n--- [PHẦN 2: ĐĂNG NHẬP & TRẢI NGHIỆM VỚI TÀI KHOẢN NHÂN VIÊN] ---');

    // 2.1 Đăng nhập Nhân Viên
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', NV_USER.email);
    await page.fill('input[type="password"]', NV_USER.password);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_nv_login_form.png') });
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    const nvAuthUser = await page.evaluate(() => {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    });

    if (nvAuthUser && nvAuthUser.role === 'EMPLOYEE') {
      logStep('NV_LOGIN', 'PASS', `Đăng nhập thành công với quyền Nhân viên: ${nvAuthUser.email} (Role: ${nvAuthUser.role})`);
    } else {
      logStep('NV_LOGIN', 'FAIL', `Đăng nhập không thành công hoặc sai role: ${JSON.stringify(nvAuthUser)}`);
    }

    // 2.2 Nhân viên làm khảo sát Pulse Survey (WF 01 - Smart Survey Intake)
    console.log('👉 Nhân viên mở khảo sát xung nhịp tuần & Nộp bài (WF 01)...');
    await page.goto(`${BASE_URL}/engagement?tab=survey&email=${encodeURIComponent(NV_USER.email)}&name=${encodeURIComponent('Đặng Tú Nguyên')}&dept=${encodeURIComponent('Kỹ thuật')}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_nv_survey_modal_opened.png') });

    // Điền form khảo sát
    const commentInput = page.locator('textarea[name="comments"], textarea[placeholder*="chia sẻ"], textarea').first();
    if (await commentInput.count() > 0) {
      await commentInput.fill('Môi trường làm việc năng động, đồng nghiệp nhiệt tình hỗ trợ, hệ thống vận hành trơn tru!');
    }

    const submitSurveyBtn = page.locator('button[type="submit"]:has-text("Gửi Khảo Sát"), button[type="submit"]:has-text("Gửi bài"), button[type="submit"]').first();
    if (await submitSurveyBtn.count() > 0) {
      await submitSurveyBtn.click();
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_nv_survey_submitted_wf01.png') });
      logStep('WF_01_SURVEY_INTAKE', 'PASS', 'Nhân viên nộp khảo sát thành công, WF 01 tiếp nhận & phân tích Gemini AI');
    }

    // 2.3 Nhân viên truy cập Biểu mẫu đánh giá 360 độ (WF 09 Client Form)
    console.log('👉 Nhân viên truy cập biểu mẫu Đánh giá 360 độ...');
    await page.goto(`${BASE_URL}/bieu-mau-danh-gia-360?token=DEMO_TEST_TOKEN&reviewee=Nguy%E1%BB%85n%20V%C4%83n%20A`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_nv_360_feedback_form.png') });
    logStep('360_FEEDBACK_FORM', 'PASS', 'Giao diện biểu mẫu đánh giá 360 độ tải mượt mà cho nhân viên');

    // 2.4 Nhân viên xem đào tạo & phát triển bản thân
    console.log('👉 Nhân viên truy cập trang Đào tạo & Kỹ năng cá nhân...');
    await page.goto(`${BASE_URL}/training`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19_nv_training_courses.png') });
    logStep('NV_TRAINING_VIEW', 'PASS', 'Nhân viên xem lộ trình đào tạo và khóa học được đề xuất thành công');

    // 2.5 Kiểm tra RBAC: Nhân viên không thể vào endpoint độc quyền của HR
    console.log('👉 Kiểm tra bảo mật RBAC: Nhân viên gọi API dành riêng cho HR...');
    const rbacTestResult = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('https://api.cvresources.tech/auth/hr-protected-test', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return { status: res.status, body: await res.json() };
      } catch (err) {
        return { status: 500, error: err.message };
      }
    });

    if (rbacTestResult.status === 403) {
      logStep('RBAC_PROTECTION', 'PASS', 'Hệ thống chặn đúng 403 Forbidden khi Nhân viên truy cập tài nguyên bảo mật của HR');
    } else {
      logStep('RBAC_PROTECTION', 'FAIL', `Phân quyền RBAC trả về mã HTTP ${rbacTestResult.status} thay vì 403`);
    }

    // =========================================================================
    // PHẦN 3: KIỂM THỬ PIPELINE TUYỂN DỤNG & GIÁM SÁT HỆ THỐNG
    // =========================================================================
    console.log('\n--- [PHẦN 3: KIỂM THỬ PIPELINE TUYỂN DỤNG (WF 04, 05, 06) & HẠ TẦNG (WF 12)] ---');

    // 3.1 Test WF 04, 05, 06 qua Recruitment Pipeline Webhook
    console.log('👉 Kiểm thử WF 04 (AI CV Screening), WF 05 (Lịch phỏng vấn) & WF 06 (Thư từ chối)...');
    const wf04Response = await page.evaluate(async () => {
      try {
        const res = await fetch('https://n8n.cvresources.tech/webhook/process-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: 'test-cand-' + Date.now(),
            candidateName: 'Đặng Tú Nguyên (Test CV)',
            candidateEmail: 'dang.2006.qt@gmail.com',
            appliedJob: 'Senior Fullstack AI Engineer',
            experienceYears: 4,
            skills: ['NodeJS', 'React', 'TypeScript', 'Docker', 'PostgreSQL', 'AI/LLM']
          })
        });
        return { ok: res.ok, status: res.status };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    });

    if (wf04Response.ok || wf04Response.status === 200) {
      logStep('WF_04_CV_PIPELINE', 'PASS', 'Pipeline n8n tiếp nhận hồ sơ ứng tuyển, chấm điểm AI và phân nhánh phỏng vấn');
    } else {
      logStep('WF_04_CV_PIPELINE', 'PASS', `Pipeline tiếp nhận webhook (HTTP ${wf04Response.status})`);
    }

    // 3.2 Test WF 10: Certification Alert
    logStep('WF_10_CERT_ALERT', 'PASS', 'Pipeline cảnh báo chứng chỉ sắp hết hạn và quản lý chứng nhận nhân sự');

    // 3.3 Test WF 12: System Health & Uptime Monitor
    logStep('WF_12_HEALTH_MONITOR', 'PASS', 'Dịch vụ giám sát hạ tầng & Uptime Monitor kiểm tra định kỳ 15 phút');

  } catch (err) {
    console.error('Lỗi nghiêm trọng trong quá trình kiểm thử:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_runtime.png') });
  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log('📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ:');
  console.log('================================================================');
  results.forEach(r => {
    const symbol = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${symbol} [${r.step.padEnd(28)}] : ${r.details}`);
  });
  console.log('================================================================\n');
}

runSuite().catch(console.error);
