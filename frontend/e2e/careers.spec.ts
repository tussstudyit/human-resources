import { test, expect } from '@playwright/test';

const MOCK_BACKEND_URL = 'http://localhost:4010';

async function setScenario(scenario: 'ok' | 'empty' | 'error' | 'slow' | 'rate_limit') {
  await fetch(`${MOCK_BACKEND_URL}/__mock/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario }),
  });
}

async function resetMockBackend() {
  await fetch(`${MOCK_BACKEND_URL}/__mock/reset`, {
    method: 'POST',
  });
}

test.describe('Careers Portal E2E Flow', () => {
  test.beforeEach(async () => {
    await resetMockBackend();
  });

  test.afterEach(async () => {
    await resetMockBackend();
  });

  test('Hiển thị danh sách việc làm từ SSR Server Component và loại trừ job CLOSED', async ({
    page,
  }) => {
    await page.goto('/careers');

    // Kiểm tra hero header
    await expect(
      page.getByRole('heading', { name: /Gia nhập đội ngũ công nghệ/i })
    ).toBeVisible();

    // Kiểm tra danh sách job OPEN được render
    await expect(page.getByText('Senior Frontend Engineer')).toBeVisible();
    await expect(page.getByText('Chuyên viên Tuyển dụng & HRBP')).toBeVisible();

    // Vị trí CLOSED không được hiển thị
    await expect(page.getByText('Vị trí đã đóng')).not.toBeVisible();
  });

  test('Lọc theo phòng ban và tìm kiếm việc làm không dấu tiếng Việt', async ({
    page,
  }) => {
    await page.goto('/careers');

    // 1. Lọc theo phòng ban 'Nhân sự'
    const hrFilterBtn = page.getByRole('button', { name: /^Nhân sự/i });
    await hrFilterBtn.click();

    await expect(page.getByText('Chuyên viên Tuyển dụng & HRBP')).toBeVisible();
    await expect(page.getByText('Senior Frontend Engineer')).not.toBeVisible();

    // 2. Tìm kiếm 'frontend'
    const searchInput = page.getByPlaceholder(/Tìm kiếm vị trí/i);
    await searchInput.fill('frontend');

    // Nút filter ALL lại để tìm theo từ khóa
    const allFilterBtn = page.getByRole('button', { name: /^Tất cả/i });
    await allFilterBtn.click();

    await expect(page.getByText('Senior Frontend Engineer')).toBeVisible();
    await expect(page.getByText('Chuyên viên Tuyển dụng & HRBP')).not.toBeVisible();
  });

  test('Mở modal ứng tuyển, kiểm tra validation khi form trống', async ({ page }) => {
    await page.goto('/careers');

    // Bấm nút 'Ứng tuyển ngay' của job đầu tiên
    const applyButtons = page.getByRole('button', { name: /Ứng tuyển ngay/i });
    await applyButtons.first().click();

    // Modal hiển thị
    const modalTitle = page.locator('#apply-modal-title');
    await expect(modalTitle).toBeVisible();

    // Bấm submit khi chưa điền họ tên
    const submitBtn = page.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i });
    await submitBtn.click();

    // Input HTML5 validation ngăn submit hoặc xuất hiện báo lỗi
    await expect(modalTitle).toBeVisible();
  });

  test('Nộp hồ sơ thành công với tệp CV PDF hợp lệ', async ({ page }) => {
    await page.goto('/careers');

    // Mở modal
    await page.getByRole('button', { name: /Ứng tuyển ngay/i }).first().click();

    // Điền thông tin ứng viên
    await page.getByPlaceholder('Nguyễn Văn A').fill('Lê Hoàng Nam');
    await page.getByPlaceholder('ungvien@gmail.com').fill('lehoangnam@example.com');
    await page.getByPlaceholder('0912 345 678').fill('0912345678');

    // Tạo file buffer PDF giả lập
    const fileBuffer = Buffer.from('%PDF-1.4 Mock Candidate Resume Content for E2E Test');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'lehoangnam_cv.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer,
    });

    // Submit form
    const submitBtn = page.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i });
    await submitBtn.click();

    // Kiểm tra thông báo thành công
    await expect(page.getByText('Ứng tuyển thành công!')).toBeVisible({
      timeout: 10000,
    });
  });

  test('Xử lý lỗi 409 Conflict: Nộp lần 1 thành công, nộp lần 2 cùng email+job nhận inline alert và KHÔNG gọi toast (B4)', async ({
    page,
  }) => {
    await page.goto('/careers');

    // Lần 1: Mở modal và nộp đơn thành công
    await page.getByRole('button', { name: /Ứng tuyển ngay/i }).first().click();

    await page.getByPlaceholder('Nguyễn Văn A').fill('Nguyễn Trùng Lặp');
    await page.getByPlaceholder('ungvien@gmail.com').fill('duplicate@example.com');

    const fileBuffer = Buffer.from('%PDF-1.4 Mock CV Duplicate Test');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'duplicate_cv.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer,
    });

    const submitBtn = page.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i });
    await submitBtn.click();

    // Chờ lần 1 thành công
    await expect(page.getByText('Ứng tuyển thành công!')).toBeVisible({ timeout: 10000 });

    // Đóng thông báo thành công trong modal và đợi modal đóng
    await page.locator('div[role="dialog"]').getByRole('button', { name: 'Đóng thông báo' }).click();
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();

    // Lần 2: Mở lại modal của cùng vị trí đó và nộp lại cùng email duplicate@example.com
    await page.getByRole('button', { name: /Ứng tuyển ngay/i }).first().click();

    await page.getByPlaceholder('Nguyễn Văn A').fill('Nguyễn Trùng Lặp');
    await page.getByPlaceholder('ungvien@gmail.com').fill('duplicate@example.com');
    await fileInput.setInputFiles({
      name: 'duplicate_cv.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer,
    });

    await page.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i }).click();

    // Assert hiển thị thông báo 409 inline chính xác
    await expect(
      page.getByText(
        'Bạn đã nộp hồ sơ ứng tuyển vào vị trí này rồi. Hệ thống đã lưu trữ thông tin của bạn.'
      )
    ).toBeVisible({ timeout: 10000 });

    // Assert KHÔNG có toast xuất hiện trên màn hình
    const toastStatus = page.locator('[role="status"]');
    await expect(toastStatus).toHaveCount(0);
  });

  test('e1. Error state: hiển thị thông báo lỗi và nút Thử lại khi SSR gặp lỗi máy chủ', async ({
    page,
  }) => {
    await setScenario('error');
    await page.goto('/careers');

    await expect(
      page.getByText('Không thể tải danh sách việc làm từ máy chủ. Vui lòng thử lại sau.')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  });

  test('e2. Thử lại sau lỗi: bấm nút Thử lại khi API hoạt động lại -> tải và hiển thị danh sách việc làm', async ({
    page,
  }) => {
    await setScenario('error');
    await page.goto('/careers');

    await expect(
      page.getByText('Không thể tải danh sách việc làm từ máy chủ. Vui lòng thử lại sau.')
    ).toBeVisible();

    // Khôi phục backend về trạng thái hoạt động bình thường
    await setScenario('ok');

    // Bấm nút Thử lại
    await page.getByRole('button', { name: 'Thử lại' }).click();

    // Danh sách việc làm hiển thị trở lại thành công
    await expect(page.getByText('Senior Frontend Engineer')).toBeVisible();
    await expect(
      page.getByText('Không thể tải danh sách việc làm từ máy chủ. Vui lòng thử lại sau.')
    ).not.toBeVisible();
  });

  test('e3. Empty state: hiển thị thông báo khi không có vị trí nào đang mở tuyển', async ({
    page,
  }) => {
    await setScenario('empty');
    await page.goto('/careers');

    await expect(
      page.getByText('Không tìm thấy vị trí tuyển dụng phù hợp')
    ).toBeVisible();
    await expect(
      page.getByText('Hiện tại chưa có vị trí nào đang mở tuyển. Vui lòng quay lại sau!')
    ).toBeVisible();
  });

  test('e4. 429 Rate limit: nộp đơn bị giới hạn tần suất -> hiển thị toast cảnh báo thao tác quá nhanh', async ({
    page,
  }) => {
    await page.goto('/careers');

    // Mở modal ứng tuyển
    await page.getByRole('button', { name: /Ứng tuyển ngay/i }).first().click();

    // Chuyển mock backend sang kịch bản rate_limit (429)
    await setScenario('rate_limit');

    // Điền thông tin ứng viên
    await page.getByPlaceholder('Nguyễn Văn A').fill('Ứng Viên Nhanh');
    await page.getByPlaceholder('ungvien@gmail.com').fill('fast@example.com');

    const fileBuffer = Buffer.from('%PDF-1.4 Mock CV Rate Limit Test');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'rate_limit_cv.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer,
    });

    await page.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i }).click();

    // Assert xuất hiện toast thông báo 429
    await expect(
      page.getByText('Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.')
    ).toBeVisible({ timeout: 10000 });
  });

  test('e5. Slow response: trang vẫn tải thành công khi mock API phản hồi trễ 1.5s', async ({
    page,
  }) => {
    await setScenario('slow');
    await page.goto('/careers');

    // Phản hồi trễ 1.5s (dưới timeout 8s của frontend), trang vẫn tải thành công
    await expect(page.getByText('Senior Frontend Engineer')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Chuyên viên Tuyển dụng & HRBP')).toBeVisible();
  });
});
