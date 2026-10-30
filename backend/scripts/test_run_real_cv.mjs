import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../dist/prisma/prisma.service.js';
import { EvaluationService } from '../dist/recruitment/evaluation.service.js';

const db = new PrismaService();
const service = new EvaluationService(db);

const cvList = [
  { file: '01_Senior_Fullstack_TinNguyen.pdf', name: 'Tin Nguyen', targetRole: 'Senior Fullstack Engineer', skills: ['NestJS', 'NodeJS', 'React', 'PostgreSQL'] },
  { file: '02_Fullstack_Web_TungNguyen.pdf', name: 'Tùng Nguyễn', targetRole: 'Fullstack Web Developer', skills: ['JavaScript', 'React', 'PHP', 'MySQL'] },
  { file: '03_Software_Architect_posquit0.pdf', name: 'Byungjin Park (posquit0)', targetRole: 'Software Architect & SRE Lead', skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker'] },
  { file: '04_Mobile_Flutter_NguyenChiThanh.pdf', name: 'Nguyễn Chí Thanh', targetRole: 'Mobile Flutter Developer', skills: ['Flutter', 'Dart', 'REST API'] },
  { file: '05_Data_Engineer_NguyenTuanHuy.pdf', name: 'Nguyễn Tuấn Huy', targetRole: 'Data Engineer', skills: ['Python', 'SQL', 'Data Pipeline'] },
  { file: '06_Junior_DevOps_FaiqRaza.pdf', name: 'Faiq Raza', targetRole: 'Junior Cloud / DevOps Engineer', skills: ['Docker', 'Kubernetes', 'Go'] },
  { file: '07_Junior_Web_EmilyDowdle.pdf', name: 'Emily Dowdle', targetRole: 'Junior Web Developer', skills: ['Ruby on Rails', 'Java', 'TDD'] },
  { file: '08_Software_Tester_TranXuanThang.pdf', name: 'Trần Xuân Thắng', targetRole: 'Software QA / Tester', skills: ['Testing', 'Bug Tracking'] },
  { file: '09_IT_Project_Manager_TranQuangPhat.pdf', name: 'Trần Quang Phát', targetRole: 'IT Project Manager', skills: ['Agile', 'Scrum', 'Project Management'] },
  { file: '10_Business_Analyst_TrangMinhTien.pdf', name: 'Trang Minh Tiến', targetRole: 'Business Analyst', skills: ['Business Analysis', 'SQL', 'Requirements'] },
];

const selectedIndex = parseInt(process.argv[2] || '1', 10) - 1;
const item = cvList[selectedIndex] || cvList[0];

console.log('================================================================');
console.log(`🧪 KIỂM THỬ WF_04 VỚI CV THẬT: [${item.file}]`);
console.log(`👤 Ứng viên: ${item.name} | Vị trí: ${item.targetRole}`);
console.log('================================================================\n');

let job = null;
try {
  const filePath = join(process.cwd(), '..', 'test_real_cvs', item.file);
  const pdfBytes = await readFile(filePath);

  // 1. Tạo Job Post tương ứng
  console.log(`[1/4] Tạo Job Post: "${item.targetRole}"...`);
  job = await db.jobPost.create({
    data: {
      title: item.targetRole,
      description: `Tuyển dụng vị trí ${item.targetRole} tham gia xây dựng hệ thống sản phẩm công nghệ.`,
      requirements: item.skills.join(', '),
      status: 'OPEN',
    },
  });

  // 2. Phê duyệt Rubric
  console.log('[2/4] Duyệt Rubric tiêu chuẩn 4 trụ cột...');
  await service.approveRubric(
    job.id,
    {
      requiredSkills: item.skills,
      weights: { skills: 40, projects: 30, production: 20, discipline: 10 },
    },
    'HR Tech Specialist'
  );

  // 3. Nộp hồ sơ ứng tuyển qua API
  console.log(`[3/4] Gửi hồ sơ ứng tuyển với file PDF thật (${(pdfBytes.length / 1024).toFixed(1)} KB)...`);
  const form = new FormData();
  form.set('name', item.name);
  form.set('email', `candidate.${randomUUID().slice(0, 8)}@example.com`);
  form.set('jobId', job.id);
  form.set('file_cv', new Blob([pdfBytes], { type: 'application/pdf' }), item.file);

  const applyRes = await fetch('http://localhost:3001/recruitment/apply', {
    method: 'POST',
    body: form,
  });
  assert.equal(applyRes.status, 201, `Nộp hồ sơ thất bại: ${applyRes.status}`);
  const candidate = await applyRes.json();
  console.log(` -> Ứng tuyển thành công! Candidate ID: ${candidate.id}`);

  // 4. Theo dõi kết quả từ WF_04
  console.log('\n[4/4] Đang chờ n8n WF_04 phân tích và chấm điểm bằng Gemini AI...');
  const deadline = Date.now() + 90000;
  let finished = null;
  while (Date.now() < deadline) {
    const c = await db.candidate.findUnique({ where: { id: candidate.id } });
    if (c?.latestEvaluationId) {
      const run = await db.evaluationRun.findUnique({ where: { id: c.latestEvaluationId } });
      if (run && !['PENDING', 'PROCESSING'].includes(run.status)) {
        finished = run;
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  assert.ok(finished, 'WF_04 xử lý quá thời gian 90 giây!');
  console.log('\n================================================================');
  console.log('🎉 KẾT QUẢ PHÂN TÍCH TỪ N8N WF_04:');
  console.log(` -> Trạng thái: ${finished.status}`);
  console.log(` -> AI Model:   ${finished.modelId}`);
  if (finished.report) {
    console.log(` -> Điểm phù hợp (Match Score): ${finished.report.matchScore}/100`);
    console.log(` -> Trạng thái duyệt:           ${finished.report.approvalStatus}`);
    console.log('\n📊 Chi tiết từng tiêu chí Rubric:');
    for (const c of finished.report.criteria || []) {
      console.log(`   * [${c.id.toUpperCase()}] Cấp độ: ${c.level}/4 | Điểm: ${c.points}/${c.weight} (Quy tắc: ${c.rule})`);
      if (c.evidence?.length) {
        console.log(`     - Dẫn chứng: "${c.evidence[0].quote.slice(0, 80)}..."`);
      }
    }
    if (finished.report.reviewReasons?.length) {
      console.log(`\n⚠️  Lý do cần HR xem xét: ${finished.report.reviewReasons.join(', ')}`);
    }
  }
  console.log('================================================================\n');
} finally {
  if (job) {
    await db.jobPost.delete({ where: { id: job.id } }).catch(() => {});
  }
  await db.$disconnect();
}
