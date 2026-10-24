const fs = require('fs');

const filePath = 'n8n/workflows/WF_05_interview_scheduler.json';
const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Update Smart Interviewer Panel Routing & Schedule Engine
const routingNode = wf.nodes.find(n => n.name === 'Smart Interviewer Panel Routing & Schedule Engine');

// We want to add scorecardRubric and miniCodeChallenge into the routing engine output
let codeRouting = routingNode.parameters.jsCode;

const rubricAndChallengeDef = `
// === ENTERPRISE INTERVIEW SCORECARD RUBRIC ===
const scorecardRubric = [
  {
    pillar: "Technical Depth & Architecture",
    weight: "40%",
    description: "Nắm vững cốt lõi framework, database design, caching, clean code và xử lý concurrency.",
    scoringLevels: {
      excellent: "Hiểu sâu bản chất, thiết kế hệ thống tối ưu, bảo mật cao",
      acceptable: "Nắm vững kiến thức cơ bản đến trung cấp, làm được dự án",
      poor: "Chỉ làm theo mẫu có sẵn, không hiểu sâu bản chất kỹ thuật"
    }
  },
  {
    pillar: "Problem Solving & Analytical Thinking",
    weight: "30%",
    description: "Tư duy bẻ nhỏ bài toán phức tạp, phân tích yêu cầu, xử lý lỗi và edge case logic.",
    scoringLevels: {
      excellent: "Giải quyết bài toán mạch lạc, lường trước các edge case và rủi ro tải",
      acceptable: "Tìm ra giải pháp sau khi được gợi ý định hướng",
      poor: "Bế tắc khi gặp tình huống lạ, tư duy rời rạc"
    }
  },
  {
    pillar: "System Scalability & Production Readiness",
    weight: "20%",
    description: "Hiểu biết về containerization (Docker), CI/CD, logging, monitoring và xử lý chịu tải.",
    scoringLevels: {
      excellent: "Có kinh nghiệm vận hành production thực tế, tư duy scale tốt",
      acceptable: "Biết sử dụng công cụ cơ bản",
      poor: "Chưa từng tiếp cận môi trường production thực tế"
    }
  },
  {
    pillar: "Culture Fit & Communication",
    weight: "10%",
    description: "Giao tiếp kỹ thuật rõ ràng, tinh thần hợp tác Agile, ownership và thái độ học hỏi.",
    scoringLevels: {
      excellent: "Giao tiếp tự tin, cởi mở, tinh thần trách nhiệm cao",
      acceptable: "Giao tiếp ổn định, hòa đồng",
      poor: "Bảo thủ, khó tiếp thu phản hồi kỹ thuật"
    }
  }
];

// === MINI TAKE-HOME CODE CHALLENGE (30-45 MIN DISCUSSION) ===
let miniCodeChallenge;
const skillsLower = (skills || []).map(s => String(s).toLowerCase());
const targetJobLower = (jobTitle || '').toLowerCase();

if (skillsLower.some(s => s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('next')) || targetJobLower.includes('frontend')) {
  miniCodeChallenge = {
    domain: 'Frontend',
    title: 'Thiết kế Data Grid ảo hóa (Virtualization) và tối ưu Render',
    taskDescription: 'Trình bày cách triển khai danh sách/bảng 10.000 bản ghi trên trình duyệt mượt mà (60 FPS), kết hợp memoization và caching client-side.',
    suggestedDuration: '30-45 phút chuẩn bị / thảo luận'
  };
} else if (skillsLower.some(s => s.includes('docker') || s.includes('kubernetes') || s.includes('aws') || s.includes('ci/cd')) || targetJobLower.includes('devops')) {
  miniCodeChallenge = {
    domain: 'DevOps / Cloud',
    title: 'Chiến lược Zero-Downtime Deployment & Health Monitoring',
    taskDescription: 'Thiết kế luồng Rolling Update hoặc Blue/Green deployment trên Kubernetes/Docker, cơ chế liveness/readiness probe và rollback tự động.',
    suggestedDuration: '30-45 phút chuẩn bị / thảo luận'
  };
} else {
  miniCodeChallenge = {
    domain: 'Backend / Systems',
    title: 'Xử lý Idempotency & Race Condition trong API thanh toán/giao dịch',
    taskDescription: 'Thiết kế API đảm bảo khi client retry nhiều lần, hệ thống chỉ trừ số dư đúng 1 lần duy nhất. Nêu giải pháp Redis Distributed Lock hoặc Database Unique Key.',
    suggestedDuration: '30-45 phút chuẩn bị / thảo luận'
  };
}
`;

// Insert rubric and challenge before the return in routingNode
codeRouting = codeRouting.replace('return [{', rubricAndChallengeDef + '\nreturn [{');
codeRouting = codeRouting.replace('interviewKit,', 'interviewKit,\n    scorecardRubric,\n    miniCodeChallenge,');
routingNode.parameters.jsCode = codeRouting;

// 2. Update Soạn Thư Mời & Tổng Hợp Packet
const packetNode = wf.nodes.find(n => n.name === 'Soạn Thư Mời & Tổng Hợp Packet');
let codePacket = packetNode.parameters.jsCode;

// Inject RSVP URLs and Challenge Block into Candidate Email HTML
const rsvpInjection = `
const rsvpConfirmUrl = \`http://localhost:3001/recruitment/candidates/\${intake.candidateId}/rsvp?status=CONFIRMED\`;
const rsvpRescheduleUrl = \`http://localhost:3001/recruitment/candidates/\${intake.candidateId}/rsvp?status=RESCHEDULE\`;
const miniChallenge = intake.miniCodeChallenge || {
  title: 'Trao đổi về kiến trúc dự án và tối ưu hiệu năng',
  taskDescription: 'Chuẩn bị chia sẻ chi tiết về một bài toán kỹ thuật phức tạp nhất bạn từng trực tiếp giải quyết.'
};

const rsvpHtmlBlock = \`
  <div style="text-align: center; margin: 24px 0 16px 0;">
    <a href="\${rsvpConfirmUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 6px; margin-right: 12px; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);">
      ✓ Xác Nhận Tham Gia
    </a>
    <a href="\${rsvpRescheduleUrl}" style="display: inline-block; background-color: #f1f5f9; color: #475569; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">
      ⟳ Yêu Cầu Dời Giờ
    </a>
  </div>
\`;

const challengeHtmlBlock = \`
  <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">💡 CHỦ ĐỀ KỸ THUẬT CHUẨN BỊ TRAO ĐỔI (MINI TECH CHALLENGE)</h4>
    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #2563eb;">\${miniChallenge.title}</p>
    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">\${miniChallenge.taskDescription}</p>
  </div>
\`;
`;

// Add rsvp and challenge blocks to email
codePacket = codePacket.replace('// Soạn thảo thư mời phỏng vấn', rsvpInjection + '\n// Soạn thảo thư mời phỏng vấn');
codePacket = codePacket.replace('${locationHtml}</td>\n          </tr>', '${locationHtml}</td>\n          </tr>\n        </table>\n      </div>\n      ${rsvpHtmlBlock}\n      ${challengeHtmlBlock}');

// Add rsvp to return json
codePacket = codePacket.replace('candidateEmailHtml,', 'candidateEmailHtml,\n    rsvpConfirmUrl,\n    rsvpRescheduleUrl,\n    rsvpStatus: "PENDING_CONFIRMATION",');

packetNode.parameters.jsCode = codePacket;

// 3. Update Stream 2: Interviewer Briefing Packet to include Scorecard Rubric
const briefingNode = wf.nodes.find(n => n.name === 'Stream 2: Interviewer Briefing Packet');
let codeBriefing = briefingNode.parameters.jsCode;

const rubricHtmlBlock = `
const rubricList = Array.isArray(data.scorecardRubric) ? data.scorecardRubric.map((r, i) => \`
  <div style="border-bottom: 1px solid #e2e8f0; padding: 8px 0; font-size: 12px;">
    <strong>\${i + 1}. \${r.pillar} (\${r.weight}):</strong> \${r.description}<br>
    <span style="color: #16a34a;">• Xuất sắc: \${r.scoringLevels?.excellent || ''}</span> | 
    <span style="color: #dc2626;">• Dưới chuẩn: \${r.scoringLevels?.poor || ''}</span>
  </div>
\`).join('') : '';

const rubricHtmlSection = \`
  <h3 style="color: #1e293b; font-size: 14px; margin: 18px 0 8px 0;">🎯 TIÊU CHÍ CHẤM ĐIỂM PHỎNG VẤN (SCORECARD RUBRIC 4 TRỤ CỘT):</h3>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
    \${rubricList}
  </div>
\`;
`;

codeBriefing = codeBriefing.replace('const candidateBriefingHtml =', rubricHtmlBlock + '\nconst candidateBriefingHtml =');
codeBriefing = codeBriefing.replace('${kitHtml}\n</div>', '${kitHtml}\n  ${rubricHtmlSection}\n</div>');
codeBriefing = codeBriefing.replace('interviewKit: data.interviewKit,', 'interviewKit: data.interviewKit,\n    scorecardRubric: data.scorecardRubric,\n    miniCodeChallenge: data.miniCodeChallenge,');

briefingNode.parameters.jsCode = codeBriefing;

// Save upgraded WF_05
fs.writeFileSync(filePath, JSON.stringify(wf, null, 2), 'utf8');
fs.writeFileSync('workflows/WF_05_interview_scheduler.json', JSON.stringify(wf, null, 2), 'utf8');
console.log('WF_05 updated successfully in n8n/workflows/ and workflows/!');
