const fs = require('fs');

// Restore clean backup
const backupPath = '/home/DoanThanhHuy/Study/CD_2/backup/sprint_enterprise_upgrade_20261024_102255/WF_06_rejection_notification.json';
const wf = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

// Update Phân Loại Kịch Bản & Soạn Thư Từ Chối
const classifyNode = wf.nodes.find(n => n.name === 'Phân Loại Kịch Bản & Soạn Thư Từ Chối');
let codeClassify = classifyNode.parameters.jsCode;

const enterpriseAdditions = `
// === ENTERPRISE TALENT POOL RETENTION & RE-ENGAGEMENT TIMELINE ===
const reEngagementDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const expY = parseInt(body.experienceYears, 10) || 1;
const candidateLevel = expY >= 5 ? 'Senior' : (expY >= 2 ? 'Mid' : 'Junior');
const detailedTalentTag = \`\${talentPoolTag}_\${candidateLevel}_\${expY}YoE\`;

const cxSurveyBlock = \`
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 24px 0 16px 0; text-align: center; font-size: 13px; color: #475569;">
    <p style="margin: 0 0 8px 0; font-weight: 600;">Bạn đánh giá trải nghiệm ứng tuyển cùng chúng tôi như thế nào?</p>
    <div style="font-size: 18px; letter-spacing: 4px;">
      <a href="http://localhost:3001/recruitment/cx-feedback?candidateId=\${candidateId}&score=5" style="text-decoration: none;" title="Rất hài lòng">⭐⭐⭐⭐⭐</a>
    </div>
    <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">Đánh giá của bạn giúp chúng tôi liên tục cải thiện quy trình tuyển dụng ngày một tốt hơn.</p>
  </div>
\`;
`;

// Insert right after const archivedAt = new Date().toISOString();
codeClassify = codeClassify.replace(
  'const archivedAt = new Date().toISOString();',
  'const archivedAt = new Date().toISOString();\n' + enterpriseAdditions
);

// Inject cxSurveyBlock before closing div in email templates
codeClassify = codeClassify.replaceAll(
  '<div style="font-size: 14px; color: #475569; border-top: 1px solid #e2e8f0;',
  '${cxSurveyBlock}\n      <div style="font-size: 14px; color: #475569; border-top: 1px solid #e2e8f0;'
);

// Inject fields into return JSON
codeClassify = codeClassify.replace(
  'archivedAt\n  }',
  'archivedAt,\n    reEngagementDate,\n    detailedTalentTag,\n    reEngagementCycle: "6_MONTHS",\n    candidateLevel\n  }'
);

classifyNode.parameters.jsCode = codeClassify;

// Update Stream 3: Đồng Bộ Lịch Sử Vào NestJS Backend to send reEngagementDate and detailedTalentTag
const syncBackendNode = wf.nodes.find(n => n.name === 'Stream 3: Đồng Bộ Lịch Sử Vào NestJS Backend');
if (syncBackendNode && syncBackendNode.parameters && syncBackendNode.parameters.jsonBody) {
  let bodyStr = syncBackendNode.parameters.jsonBody;
  if (!bodyStr.includes('reEngagementDate')) {
    bodyStr = bodyStr.replace(
      '"tag": {{ JSON.stringify($json.talentPoolTag) }},',
      '"tag": {{ JSON.stringify($json.talentPoolTag) }},\n      "detailedTalentTag": {{ JSON.stringify($json.detailedTalentTag) }},\n      "reEngagementDate": {{ JSON.stringify($json.reEngagementDate) }},\n      "candidateLevel": {{ JSON.stringify($json.candidateLevel) }},\n      "cxSurveyUrl": {{ JSON.stringify("http://localhost:3001/recruitment/cx-feedback?candidateId=" + $json.candidateId) }},'
    );
    syncBackendNode.parameters.jsonBody = bodyStr;
  }
}

// Save upgraded WF_06
fs.writeFileSync('n8n/workflows/WF_06_rejection_notification.json', JSON.stringify(wf, null, 2), 'utf8');
fs.writeFileSync('workflows/WF_06_rejection_notification.json', JSON.stringify(wf, null, 2), 'utf8');
console.log('WF_06 cleanly updated in n8n/workflows/ and workflows/!');
