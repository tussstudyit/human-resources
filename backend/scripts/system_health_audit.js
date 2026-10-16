import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const BACKEND_URL = 'http://localhost:3001';
const N8N_URL = 'http://localhost:5679';
const JWT_SECRET = 'hr_jwt_secret_super_key_2026_antigravity';

const hrToken = jwt.sign(
  {
    sub: 'bbd1f7dc-62c1-4758-81a4-5f1d72505c3f',
    email: 'hr@company.com',
    role: 'HR',
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const authHeaders = {
  Authorization: `Bearer ${hrToken}`,
  'Content-Type': 'application/json',
};

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG BE - FE - N8N');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, detail = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      if (detail) console.error(`     Chi tiết lỗi: ${detail}`);
      failed++;
    }
  }

  // 1. Kiểm tra Backend NestJS & n8n Liveness
  console.log('--- 1. Kiểm tra Liveness Máy Chủ ---');
  try {
    const res = await axios.get(BACKEND_URL);
    assert(res.status === 200, 'NestJS Backend đang hoạt động trên port 3001');
  } catch (err) {
    assert(false, 'NestJS Backend không phản hồi', err.message);
  }

  try {
    const res = await axios.get(N8N_URL, { timeout: 3000 });
    assert(res.status === 200, 'n8n Automation Engine đang hoạt động trên port 5679');
  } catch (err) {
    assert(false, 'n8n Automation Engine không phản hồi', err.message);
  }

  // 2. Kiểm tra Authentication & Quyền HR
  console.log('\n--- 2. Kiểm tra Authentication & RBAC ---');
  try {
    const meRes = await axios.get(`${BACKEND_URL}/auth/me`, { headers: authHeaders });
    assert(
      meRes.data && meRes.data.role === 'HR',
      'Xác thực quyền HR qua JWT Token thành công',
      JSON.stringify(meRes.data)
    );
  } catch (err) {
    assert(false, 'Lỗi xác thực /auth/me', err.message);
  }

  // 3. Kiểm tra Tin Tuyển Dụng (JobPost)
  console.log('\n--- 3. Kiểm tra Quản Lý Tin Tuyển Dụng ---');
  let testJobId = null;
  try {
    const jobsRes = await axios.get(`${BACKEND_URL}/recruitment/admin/jobs`, {
      headers: authHeaders,
    });
    assert(
      Array.isArray(jobsRes.data) && jobsRes.data.length > 0,
      `Đã lấy danh sách tin tuyển dụng Admin (${jobsRes.data.length} vị trí)`
    );
    testJobId = jobsRes.data[0].id;
  } catch (err) {
    assert(false, 'Lỗi lấy danh sách việc làm Admin', err.message);
  }

  // 4. Kiểm tra Danh Sách Ứng Viên Của Vị Trí
  console.log('\n--- 4. Kiểm tra Danh Sách Ứng Viên ---');
  let candidates = [];
  try {
    const candRes = await axios.get(
      `${BACKEND_URL}/recruitment/jobs/${testJobId}/candidates`,
      { headers: authHeaders }
    );
    candidates = candRes.data;
    assert(
      Array.isArray(candidates) && candidates.length > 0,
      `Lấy danh sách ứng viên của job (${candidates.length} ứng viên)`
    );
  } catch (err) {
    assert(false, 'Lỗi nạp ứng viên', err.message);
  }

  // 5. Kiểm tra Stream File CV PDF
  console.log('\n--- 5. Kiểm tra Tải & Stream File CV ---');
  if (candidates.length > 0) {
    const cand = candidates[0];
    try {
      const cvRes = await axios.get(
        `${BACKEND_URL}/recruitment/candidates/${cand.id}/cv`,
        {
          headers: authHeaders,
          responseType: 'arraybuffer',
        }
      );
      assert(
        cvRes.status === 200 && cvRes.data.length > 0,
        `Tải thành công file CV của ứng viên ${cand.name} (${cvRes.data.length} bytes)`
      );
    } catch (err) {
      assert(false, `Lỗi tải file CV của ứng viên ${cand.name}`, err.message);
    }
  }

  // 6. Kiểm tra Thống Kê Tuyển Dụng Tổng Hợp (Dynamic Stats)
  console.log('\n--- 6. Kiểm tra Dữ Liệu Thống Kê Tuyển Dụng (Pipeline Stats) ---');
  try {
    const statsRes = await axios.get(`${BACKEND_URL}/recruitment/stats`, {
      headers: authHeaders,
    });
    const stats = statsRes.data;
    assert(
      stats && typeof stats.totalCandidates === 'number' && stats.pipeline,
      'Endpoint /recruitment/stats trả về đầy đủ cấu trúc phễu tuyển dụng'
    );
    assert(
      Array.isArray(stats.agents) && stats.agents.length === 1 && stats.agents[0].id === 'recruitment',
      'Cung cấp danh sách 1 AI Agent thực tế hoạt động (AI Recruitment Agent - 100% Live)'
    );
    assert(
      Array.isArray(stats.recentEvaluations),
      'Có danh sách recentEvaluations phục vụ stream hoạt động trên Dashboard'
    );
  } catch (err) {
    assert(false, 'Lỗi lấy stats', err.message);
  }

  // 7. Kiểm tra Quy Trình n8n WF_05 (Schedule Interview & Google Meet)
  console.log('\n--- 7. Kiểm tra Quy Trình n8n WF_05: Xếp Lịch Phỏng Vấn & Google Meet ---');
  const candForInterview = candidates.find((c) => c.matchScore >= 80) || candidates[0];
  if (candForInterview) {
    try {
      const scheduleRes = await axios.post(
        `${BACKEND_URL}/recruitment/candidates/${candForInterview.id}/schedule-interview`,
        { interviewType: 'ONLINE' },
        { headers: authHeaders }
      );
      assert(
        scheduleRes.data && scheduleRes.data.success,
        `n8n WF_05 xử lý xếp lịch phỏng vấn thành công cho ${candForInterview.name}`
      );
      assert(
        scheduleRes.data.updatedCandidate &&
          scheduleRes.data.updatedCandidate.parsedSkillsJson?.interviewSchedule?.googleMeetUrl,
        `Google Meet URL đã được đồng bộ vào CSDL: ${scheduleRes.data.updatedCandidate?.parsedSkillsJson?.interviewSchedule?.googleMeetUrl}`
      );
    } catch (err) {
      assert(false, 'Lỗi kích hoạt n8n WF_05', err.message);
    }
  }

  // 8. Kiểm tra Quy Trình n8n WF_06 (Talent Pool & Polite Rejection)
  console.log('\n--- 8. Kiểm tra Quy Trình n8n WF_06: Phân Bổ Kho Nhân Tài ---');
  const candForPool = candidates.find((c) => c.id !== candForInterview?.id) || candidates[0];
  if (candForPool) {
    try {
      const poolRes = await axios.post(
        `${BACKEND_URL}/recruitment/candidates/${candForPool.id}/talent-pool`,
        { scenario: 'GENERAL_POOL' },
        { headers: authHeaders }
      );
      assert(
        poolRes.data && poolRes.data.success,
        `n8n WF_06 phân bổ Kho Nhân Tài thành công cho ${candForPool.name}`
      );
      assert(
        poolRes.data.updatedCandidate &&
          poolRes.data.updatedCandidate.parsedSkillsJson?.talentPool?.tier,
        `Talent Pool Tier đã được đồng bộ vào CSDL: ${poolRes.data.updatedCandidate?.parsedSkillsJson?.talentPool?.tier}`
      );
    } catch (err) {
      assert(false, 'Lỗi kích hoạt n8n WF_06', err.message);
    }
  }

  // 9. Kiểm tra Đồng Bộ CSDL Thực Tế Sau Khi Chạy
  console.log('\n--- 9. Kiểm tra Cơ Sở Dữ Liệu PostgreSQL ---');
  const finalCandidates = await prisma.candidate.findMany({
    select: {
      id: true,
      name: true,
      aiStatus: true,
      matchScore: true,
      parsedSkillsJson: true,
    },
  });
  assert(
    finalCandidates.length >= 6,
    `Tổng số ứng viên trong CSDL chính xác: ${finalCandidates.length} ứng viên`
  );
  const interviewCount = finalCandidates.filter(
    (c) => c.parsedSkillsJson?.interviewSchedule?.googleMeetUrl
  ).length;
  assert(
    interviewCount >= 1,
    `Có ít nhất ${interviewCount} ứng viên có Google Meet hợp lệ trong DB`
  );
  const poolCount = finalCandidates.filter(
    (c) => c.parsedSkillsJson?.talentPool?.tier
  ).length;
  assert(
    poolCount >= 1,
    `Có ít nhất ${poolCount} ứng viên trong Kho Nhân Tài hợp lệ trong DB`
  );

  console.log('\n====================================================');
  console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passed} PASSED / ${failed} FAILED`);
  console.log('====================================================\n');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAudit().catch(async (e) => {
  console.error('Fatal audit error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
