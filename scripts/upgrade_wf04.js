const fs = require('fs');

const filePath = 'n8n/workflows/WF_04_cv_parser_ai_scoring.json';
const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Update Build Detailed Gemini Prompt
const pNode = wf.nodes.find(n => n.name === 'Build Detailed Gemini Prompt');
pNode.parameters.jsCode = `const webhookData = $('Webhook: Receive CV Application').first().json.body || $('Webhook: Receive CV Application').first().json;
const candidateId = webhookData.candidateId;
const candidateName = webhookData.candidateName || webhookData.name || 'Ứng viên';
const candidateEmail = webhookData.candidateEmail || webhookData.email || 'candidate@example.com';
const jobTitle = webhookData.jobTitle || 'Kỹ sư phần mềm';
const jobDescription = webhookData.jobDescription || '';
const jobRequirements = webhookData.jobRequirements || '';
const cvText = ($json.text || '').trim();

const promptText = \`Bạn là Trưởng ban Tuyển dụng Công nghệ (Lead Technical Recruiter) và Chuyên gia Đánh giá Kỹ thuật (Technical Screener) cấp cao của một tập đoàn công nghệ lớn.
Nhiệm vụ của bạn là thẩm định sâu hồ sơ ứng viên công nghệ thông tin so với bản mô tả công việc (JD) dưới đây theo tiêu chuẩn ATS doanh nghiệp thực chiến.

=== BẢN MÔ TẢ CÔNG VIỆC (JD) ===
- Vị trí: \${jobTitle}
- Mô tả công việc:
\${jobDescription}
- Yêu cầu ứng viên:
\${jobRequirements}

=== NỘI DUNG CV CỦA ỨNG VIÊN ===
\${cvText}

=== HƯỚNG DẪN THẨM ĐỊNH KỸ THUẬT CHUYÊN SÂU (ENTERPRISE TECH ATS RUBRICS) ===
1. coreSkills: Mảng chuỗi các công nghệ ứng viên có kinh nghiệm thực chiến chuyên sâu (đã làm dự án >= 2 năm hoặc là trọng tâm dự án).
2. secondarySkills: Mảng chuỗi các công nghệ phụ trợ, công cụ bổ trợ hoặc mới học/tiếp cận cơ bản.
3. systemScaleScore: Điểm từ 0 đến 100 đo lường tư duy kiến trúc, năng lực chịu tải cao, microservices, tối ưu CSDL, caching, message queue hoặc CI/CD dựa trên mô tả dự án trong CV.
4. practicalProjectScore: Điểm từ 0 đến 100 đo lường chiều sâu và độ thực chiến của các dự án đã triển khai (đã xử lý production, tối ưu hiệu năng, caching, high traffic, CI/CD, database design vs chỉ làm pet project/đồ án).
5. practicalProjectHighlights: Mảng gồm 2 đến 3 gạch đầu dòng tóm tắt các điểm sáng kỹ thuật thực tế nhất của ứng viên trong các dự án đã làm.
6. salaryBenchmark: Ước tính khoảng lương thị trường tại Việt Nam cho ứng viên dựa trên tech stack, số năm kinh nghiệm và vị trí. Trả về object:
   - "minSalary": số nguyên VNĐ (ví dụ: 25000000)
   - "maxSalary": số nguyên VNĐ (ví dụ: 35000000)
   - "currency": "VND"
   - "level": "Fresher" | "Junior" | "Middle" | "Senior" | "Lead"
   - "rationale": "Căn cứ định giá mức lương dựa trên kinh nghiệm và kỹ năng thực tế."
7. githubUrl: Tìm và trích xuất link GitHub của ứng viên (ví dụ: "https://github.com/abc"). Nếu không có trong CV, trả về null.
8. githubAnalysis: Nếu có link GitHub hoặc đề cập đến open-source/repo trong CV, phân tích ngắn gọn 1 câu về tiềm năng code thực chiến; nếu không có trả về null.
9. portfolioUrl: Link Portfolio, Website cá nhân, Tech blog hoặc LinkedIn. Nếu không có trả về null.
10. cultureFit: Object gồm:
   - "agileScrum": true/false (có kinh nghiệm làm việc theo mô hình Agile/Scrum hay không)
   - "problemSolving": 1 câu đánh giá tư duy giải quyết vấn đề
   - "ownershipMindset": 1 câu đánh giá tinh thần trách nhiệm với sản phẩm
11. keywordStuffingFlag: Boolean (true nếu phát hiện ứng viên nhồi nhét từ khóa nhưng thiếu mô tả dự án thực tế, ngược lại false).
12. keywordStuffingReason: Chuỗi giải thích nếu keywordStuffingFlag = true, ngược lại null.
13. interviewFocusPoints: Mảng gồm 3 đến 5 câu hỏi/chủ đề kỹ thuật nghi vấn hoặc điểm cần Tech Lead phỏng vấn sâu.
14. matchScore: Điểm phù hợp tổng thể từ 0 đến 100.
15. techScore: Điểm chuyên môn kỹ thuật từ 0 đến 100.
16. experienceYears: Số năm kinh nghiệm làm việc thực tế liên quan (số nguyên >= 0).
17. summary: Nhận xét đánh giá chuyên môn sắc bén bằng tiếng Việt (3-5 câu), nêu rõ điểm mạnh kỹ thuật và điểm cần thẩm định thêm.
18. softSkills: Mảng kỹ năng mềm, làm việc nhóm, giao tiếp kỹ thuật.
19. recommendation: "FAST_TRACK_INTERVIEW" (nếu matchScore >= 80), "MANUAL_REVIEW" (nếu 50 <= matchScore < 80), "TALENT_POOL_ARCHIVE" (nếu matchScore < 50).

BẮT BUỘC: Bạn CHỈ ĐƯỢC PHÉP trả về DUY NHẤT một chuỗi JSON thuần (STRICT JSON), KHÔNG kèm bất kỳ định dạng markdown nào khác ngoài cấu trúc JSON:
{
  "coreSkills": ["NestJS", "TypeScript", "PostgreSQL"],
  "secondarySkills": ["Docker", "Redis", "AWS"],
  "systemScaleScore": 85,
  "practicalProjectScore": 82,
  "practicalProjectHighlights": ["Tối ưu truy vấn PostgreSQL và thiết kế kiến trúc caching Redis", "Triển khai CI/CD với Docker trên hạ tầng AWS"],
  "salaryBenchmark": {
    "minSalary": 28000000,
    "maxSalary": 38000000,
    "currency": "VND",
    "level": "Middle",
    "rationale": "Mức lương thị trường cho 3-4 năm kinh nghiệm với NestJS/TypeScript/AWS tại TP.HCM/Hà Nội"
  },
  "githubUrl": "https://github.com/username",
  "githubAnalysis": "Profile có dự án thực tế về backend microservices và code sạch",
  "portfolioUrl": null,
  "cultureFit": {
    "agileScrum": true,
    "problemSolving": "Chủ động đào sâu giải quyết vấn đề hiệu năng",
    "ownershipMindset": "Có tinh thần chịu trách nhiệm cao về độ tin cậy của dịch vụ"
  },
  "keywordStuffingFlag": false,
  "keywordStuffingReason": null,
  "interviewFocusPoints": ["Hỏi sâu về kinh nghiệm tối ưu truy vấn PostgreSQL", "Kiến trúc microservices"],
  "matchScore": 88,
  "techScore": 90,
  "experienceYears": 4,
  "summary": "Ứng viên có nền tảng vững vàng về Backend...",
  "softSkills": ["Làm việc nhóm Agile", "Giao tiếp kỹ thuật tốt"],
  "recommendation": "FAST_TRACK_INTERVIEW"
}\`;

return [{
  json: {
    candidateId,
    candidateName,
    candidateEmail,
    jobTitle,
    cvText,
    promptText
  }
}];`;

// 2. Update Parse & Validate AI Evaluation
const parseNode = wf.nodes.find(n => n.name === 'Parse & Validate AI Evaluation');
parseNode.parameters.jsCode = `const promptNodeData = $('Build Detailed Gemini Prompt').first().json;
const candidateId = promptNodeData.candidateId;
const candidateName = promptNodeData.candidateName;
const candidateEmail = promptNodeData.candidateEmail;
const jobTitle = promptNodeData.jobTitle;
const cvText = promptNodeData.cvText || '';
const responseJson = $json;

let parsed = null;
const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;

if (rawText) {
  let cleanedText = rawText.trim();
  if (cleanedText.startsWith('\`\`\`json')) {
    cleanedText = cleanedText.replace(/^\`\`\`json\\s*/, '').replace(/\\s*\`\`\`$/, '');
  } else if (cleanedText.startsWith('\`\`\`')) {
    cleanedText = cleanedText.replace(/^\`\`\`\\s*/, '').replace(/\\s*\`\`\`$/, '');
  }
  try {
    parsed = JSON.parse(cleanedText);
  } catch (e) {
    parsed = null;
  }
}

// Extract GitHub link cleanly
const ghMatch = cvText.match(/(?:https?:\\/\\/)?(?:www\\.)?github\\.com\\/([a-zA-Z0-9_-]+)\\b/i);
const extractedGithubUrl = ghMatch ? (ghMatch[0].startsWith('http') ? ghMatch[0] : 'https://' + ghMatch[0]) : null;

const commonTech = [
  'React', 'NodeJS', 'TypeScript', 'JavaScript', 'NestJS', 'PostgreSQL', 'Docker', 'AWS',
  'Python', 'Git', 'Next.js', 'REST API', 'GraphQL', 'Tailwind', 'HTML/CSS', 'CI/CD',
  'Redis', 'Kubernetes', 'Golang', 'Java', 'Spring Boot', 'Vue', 'Angular', 'Express',
  'MongoDB', 'PHP', 'Laravel', 'MySQL'
];
const matched = commonTech.filter(tech => {
  const escaped = tech.replace(/[-\\/\\\\^$*+?.()|[\\]]/g, '\\\\$&');
  return new RegExp('\\\\b' + escaped + '\\\\b', 'i').test(cvText);
});

// Thuật toán kiểm tra bối cảnh dự án để tránh False Positive cho Senior nhiều kỹ năng:
const projectActionVerbs = ['phát triển', 'thiết kế', 'xây dựng', 'tối ưu', 'dự án', 'kinh nghiệm', 'trách nhiệm', 'vận hành', 'triển khai', 'kiến trúc', 'developed', 'architected', 'optimized', 'project', 'experience'];
const actionVerbMatches = projectActionVerbs.filter(v => cvText.toLowerCase().includes(v));

const hasLittleContext = actionVerbMatches.length <= 1 && cvText.length < 800;
const pureBuzzwordDump = (matched.length >= 5 && actionVerbMatches.length === 0 && cvText.length < 500) || (matched.length >= 7 && hasLittleContext);
const extremeDensity = matched.length >= 13 && cvText.length < 1200 && actionVerbMatches.length <= 2;
const isAlgorithmicStuffing = pureBuzzwordDump || extremeDensity;

// Cờ cảnh báo nhồi từ khóa
let keywordStuffingFlag = false;
let keywordStuffingReason = null;

if (parsed && typeof parsed.keywordStuffingFlag === 'boolean') {
  keywordStuffingFlag = parsed.keywordStuffingFlag;
  keywordStuffingReason = parsed.keywordStuffingReason || (keywordStuffingFlag ? 'AI phát hiện mật độ từ khóa công nghệ bất thường so với nội dung dự án thực tế' : null);
} else {
  keywordStuffingFlag = isAlgorithmicStuffing;
  keywordStuffingReason = keywordStuffingFlag ? 'Mật độ từ khóa công nghệ quá dày đặc nhưng thiếu mô tả bối cảnh dự án thực tế' : null;
}

const yearsMatch = cvText.match(/(\\d+)\\+?\\s*(?:năm|years?)/i);
const expYears = yearsMatch ? parseInt(yearsMatch[1], 10) : (matched.length >= 3 ? 3 : 1);

if (!parsed || typeof parsed !== 'object') {
  const coreSkills = matched.slice(0, 4);
  const secondarySkills = matched.slice(4);
  const baseScore = keywordStuffingFlag ? 55 : Math.min(65 + coreSkills.length * 6, 92);

  parsed = {
    coreSkills: coreSkills.length > 0 ? coreSkills : ['JavaScript', 'HTML/CSS'],
    secondarySkills: secondarySkills,
    systemScaleScore: keywordStuffingFlag ? 35 : (coreSkills.some(s => ['Docker', 'AWS', 'PostgreSQL', 'Kubernetes', 'Redis'].includes(s)) ? 75 : 55),
    practicalProjectScore: keywordStuffingFlag ? 40 : Math.min(60 + actionVerbMatches.length * 5, 88),
    practicalProjectHighlights: [
      \`Kinh nghiệm làm việc thực tế với \${coreSkills.slice(0, 2).join(' và ') || 'công nghệ chính'}\`,
      'Tham gia phát triển và tối ưu tính năng dự án'
    ],
    githubUrl: extractedGithubUrl,
    portfolioUrl: null,
    keywordStuffingFlag,
    keywordStuffingReason,
    interviewFocusPoints: keywordStuffingFlag
      ? ['Kiểm tra xem ứng viên có thực sự nắm chắc các công nghệ đã liệt kê', 'Yêu cầu ứng viên giải thích chi tiết 1 dự án cụ thể']
      : [
          \`Kiểm tra kỹ năng lập trình thực tế với \${coreSkills[0] || 'ngôn ngữ cốt lõi'}\`,
          'Thẩm định các dự án thực tế đã trực tiếp triển khai',
          'Đánh giá khả năng tối ưu hiệu năng và xử lý lỗi hệ thống'
        ],
    matchScore: baseScore,
    techScore: baseScore,
    experienceYears: expYears,
    summary: keywordStuffingFlag
      ? \`Hồ sơ ứng viên \${candidateName} có dấu hiệu liệt kê dày đặc từ khóa công nghệ (\${matched.length} công nghệ) nhưng thiếu mô tả dự án thực tế. Cần phỏng vấn kỹ.\`
      : \`Hồ sơ ứng viên \${candidateName} có thế mạnh chuyên môn cho vị trí \${jobTitle}. Nắm vững các công nghệ trọng tâm (\${coreSkills.join(', ') || 'Công nghệ phần mềm'}).\`,
    softSkills: ['Giao tiếp tốt', 'Làm việc nhóm Agile'],
    recommendation: baseScore >= 80 ? 'FAST_TRACK_INTERVIEW' : (baseScore >= 50 ? 'MANUAL_REVIEW' : 'TALENT_POOL_ARCHIVE')
  };
}

// Sanitize & Clamp fields
let matchScore = typeof parsed.matchScore === 'number' ? parsed.matchScore : (parseFloat(parsed.matchScore) || 75);
if (matchScore > 100) matchScore = 100;
if (matchScore < 0) matchScore = 0;

let techScore = typeof parsed.techScore === 'number' ? parsed.techScore : (parseFloat(parsed.techScore) || matchScore);
let systemScaleScore = typeof parsed.systemScaleScore === 'number' ? parsed.systemScaleScore : (parseInt(parsed.systemScaleScore, 10) || 60);
if (systemScaleScore > 100) systemScaleScore = 100;
if (systemScaleScore < 0) systemScaleScore = 0;

let practicalProjectScore = typeof parsed.practicalProjectScore === 'number' ? parsed.practicalProjectScore : (parseInt(parsed.practicalProjectScore, 10) || Math.min(matchScore, 85));
if (practicalProjectScore > 100) practicalProjectScore = 100;
if (practicalProjectScore < 0) practicalProjectScore = 0;

let experienceYears = typeof parsed.experienceYears === 'number' ? Math.round(parsed.experienceYears) : (parseInt(parsed.experienceYears, 10) || expYears);

const coreSkills = Array.isArray(parsed.coreSkills) && parsed.coreSkills.length > 0 ? parsed.coreSkills : matched.slice(0, 4);
const secondarySkills = Array.isArray(parsed.secondarySkills) ? parsed.secondarySkills : matched.slice(4);
const combinedSkills = [...coreSkills, ...secondarySkills];

let practicalProjectHighlights = Array.isArray(parsed.practicalProjectHighlights) && parsed.practicalProjectHighlights.length > 0
  ? parsed.practicalProjectHighlights
  : [
      \`Kinh nghiệm phát triển ứng dụng với các công nghệ \${coreSkills.slice(0, 3).join(', ')}\`,
      \`Tham gia vận hành và xử lý bài toán hiệu năng hệ thống\`
    ];

// Tính toán AI Salary Benchmark (Chuẩn thị trường IT Việt Nam 2026)
let salaryBenchmark = parsed.salaryBenchmark;
if (!salaryBenchmark || typeof salaryBenchmark !== 'object' || !salaryBenchmark.minSalary) {
  let minSal = 15000000;
  let maxSal = 22000000;
  let level = 'Junior';

  if (experienceYears >= 6 || (experienceYears >= 5 && systemScaleScore >= 80)) {
    minSal = 40000000;
    maxSal = 60000000;
    level = 'Lead / Principal';
  } else if (experienceYears >= 4 || (experienceYears >= 3 && systemScaleScore >= 75)) {
    minSal = 30000000;
    maxSal = 45000000;
    level = 'Senior';
  } else if (experienceYears >= 2) {
    minSal = 20000000;
    maxSal = 30000000;
    level = 'Middle';
  } else if (experienceYears >= 1) {
    minSal = 12000000;
    maxSal = 18000000;
    level = 'Junior';
  } else {
    minSal = 8000000;
    maxSal = 12000000;
    level = 'Fresher / Intern';
  }

  if (techScore >= 85) {
    minSal = Math.round(minSal * 1.1 / 1000000) * 1000000;
    maxSal = Math.round(maxSal * 1.15 / 1000000) * 1000000;
  }

  salaryBenchmark = {
    minSalary: minSal,
    maxSalary: maxSal,
    currency: 'VND',
    formatted: \`\${(minSal).toLocaleString('vi-VN')} - \${(maxSal).toLocaleString('vi-VN')} VNĐ\`,
    level,
    rationale: \`Ước tính mức lương theo kinh nghiệm (\${experienceYears} năm) và năng lực kỹ thuật (\${coreSkills.slice(0, 3).join(', ')}) trên thị trường IT Việt Nam.\`
  };
} else {
  if (!salaryBenchmark.formatted && salaryBenchmark.minSalary && salaryBenchmark.maxSalary) {
    salaryBenchmark.formatted = \`\${Number(salaryBenchmark.minSalary).toLocaleString('vi-VN')} - \${Number(salaryBenchmark.maxSalary).toLocaleString('vi-VN')} \${salaryBenchmark.currency || 'VNĐ'}\`;
  }
}

let githubUrl = (typeof parsed.githubUrl === 'string' && parsed.githubUrl.trim().length > 0 && parsed.githubUrl.toLowerCase() !== 'null') ? parsed.githubUrl.trim() : extractedGithubUrl;
let githubAnalysis = parsed.githubAnalysis || (githubUrl ? \`Profile GitHub đã được trích xuất (\${githubUrl}) phục vụ thẩm định code review.\` : null);
let portfolioUrl = (typeof parsed.portfolioUrl === 'string' && parsed.portfolioUrl.trim().length > 0 && parsed.portfolioUrl.toLowerCase() !== 'null') ? parsed.portfolioUrl.trim() : null;

let cultureFit = parsed.cultureFit && typeof parsed.cultureFit === 'object' ? parsed.cultureFit : {
  agileScrum: true,
  problemSolving: 'Tư duy logic tốt, có khả năng phân tích và bẻ nhỏ bài toán',
  ownershipMindset: 'Chủ động theo dõi chất lượng sản phẩm từ khâu code đến deploy'
};

const interviewFocusPoints = Array.isArray(parsed.interviewFocusPoints) && parsed.interviewFocusPoints.length > 0 
  ? parsed.interviewFocusPoints 
  : [
      \`Kiểm tra kỹ năng lập trình thực chiến với \${coreSkills[0] || 'công nghệ chính'}\`,
      'Đánh giá kinh nghiệm xử lý bài toán chịu tải và tối ưu cơ sở dữ liệu'
    ];

const summary = typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
  ? parsed.summary.trim()
  : "Đã hoàn thành đánh giá hồ sơ ứng viên theo tiêu chuẩn Tech ATS.";

const softSkills = Array.isArray(parsed.softSkills) ? parsed.softSkills : ['Làm việc nhóm Agile', 'Giao tiếp kỹ thuật tốt'];
let recommendation = parsed.recommendation || (matchScore >= 80 ? 'FAST_TRACK_INTERVIEW' : (matchScore >= 50 ? 'MANUAL_REVIEW' : 'TALENT_POOL_ARCHIVE'));

// Build rich parsedSkillsJson object that is 100% backward compatible for frontend
const parsedSkillsJson = {
  skills: combinedSkills,
  coreSkills,
  secondarySkills,
  systemScaleScore,
  practicalProjectScore,
  practicalProjectHighlights,
  salaryBenchmark,
  githubUrl,
  githubAnalysis,
  portfolioUrl,
  cultureFit,
  keywordStuffingFlag,
  keywordStuffingReason,
  interviewFocusPoints,
  techScore,
  softSkills,
  recommendation
};

return [{
  json: {
    candidateId,
    name: candidateName,
    email: candidateEmail,
    jobTitle,
    matchScore,
    techScore,
    systemScaleScore,
    practicalProjectScore,
    practicalProjectHighlights,
    salaryBenchmark,
    experienceYears,
    summary,
    githubUrl,
    githubAnalysis,
    portfolioUrl,
    cultureFit,
    keywordStuffingFlag,
    keywordStuffingReason,
    interviewFocusPoints,
    coreSkills,
    secondarySkills,
    parsedSkillsJson,
    softSkills,
    recommendation
  }
}];`;

// 3. Update Tier 1 Alert Node
const alertNode = wf.nodes.find(n => n.name === 'Tier 1: Bắn Alert Tuyển Dụng Nhanh (HR Lead)');
alertNode.parameters.jsCode = `const data = $json;
const isUrgent = (data.matchScore || 0) >= 85;
const salaryText = data.salaryBenchmark?.formatted || 'Theo thỏa thuận';
const practicalScore = data.practicalProjectScore || data.matchScore || 80;

return [{
  json: {
    success: true,
    alertType: isUrgent ? 'FAST_TRACK_URGENT_HIRE' : 'HIGH_PRIORITY_CANDIDATE',
    priority: isUrgent ? 'P1_CRITICAL' : 'P2_HIGH',
    headline: isUrgent ? '🚨 [FAST TRACK - TUYỂN GẤP 24H]' : '🌟 [ỨNG VIÊN TIỀM NĂNG CAO]',
    message: \`\${isUrgent ? '🚨 [TUYỂN GẤP 24H]' : '🌟'} Ứng viên xuất sắc \${data.candidateName} đạt \${data.matchScore}% cho vị trí \${data.jobTitle}. Thực chiến: \${practicalScore}/100. Lương đề xuất: \${salaryText}. Đã tạo phòng Meet: \${data.googleMeetUrl}\`,
    candidateId: data.candidateId,
    candidateName: data.candidateName,
    candidateEmail: data.candidateEmail,
    jobTitle: data.jobTitle,
    matchScore: data.matchScore,
    techScore: data.techScore,
    practicalProjectScore: practicalScore,
    salaryBenchmark: data.salaryBenchmark,
    practicalProjectHighlights: data.practicalProjectHighlights,
    scheduledInterview: \`\${data.interviewTime}, \${data.interviewDate}\`,
    googleMeetUrl: data.googleMeetUrl,
    actionRequired: isUrgent ? 'Hiring Lead duyệt và chốt lịch phỏng vấn trong 24 giờ để tránh mất nhân tài' : 'Tham gia phỏng vấn theo lịch hẹn',
    timestamp: new Date().toISOString()
  }
}];`;

fs.writeFileSync(filePath, JSON.stringify(wf, null, 2), 'utf8');
fs.writeFileSync('workflows/WF_04_cv_parser_ai_scoring.json', JSON.stringify(wf, null, 2), 'utf8');
console.log('WF_04 updated successfully in n8n/workflows/ and workflows/!');
