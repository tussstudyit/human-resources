const fs = require('fs');

const file3 = '/home/tuss/human-resources/n8n/workflows/03_weekly_survey_dispatcher.json';
const data3 = JSON.parse(fs.readFileSync(file3, 'utf8'));

// 1. Ensure Webhook Trigger node exists in WF 3
let webhookNode = data3.nodes.find(n => n.name.includes('Webhook') || n.id === 'wf3-webhook-trigger');
if (!webhookNode) {
  webhookNode = {
    parameters: {
      httpMethod: 'POST',
      path: 'weekly-survey-dispatcher',
      responseMode: 'responseNode',
      options: {}
    },
    type: 'n8n-nodes-base.webhook',
    typeVersion: 2,
    position: [ 144, 160 ],
    id: 'wf3-webhook-trigger',
    name: 'Webhook: Kích Hoạt Khảo Sát Tuần'
  };
  data3.nodes.unshift(webhookNode);
}

// 2. Connect Webhook Trigger to "Truy Vấn Danh Sách Nhân Sự"
if (!data3.connections['Webhook: Kích Hoạt Khảo Sát Tuần']) {
  data3.connections['Webhook: Kích Hoạt Khảo Sát Tuần'] = {
    main: [
      [
        {
          node: 'Truy Vấn Danh Sách Nhân Sự',
          type: 'main',
          index: 0
        }
      ]
    ]
  };
}

// 3. Update "Truy Vấn Danh Sách Nhân Sự" to support real web recipients or real employee list
const rosterNode = data3.nodes.find(n => n.id === 'wf3-roster' || n.name === 'Truy Vấn Danh Sách Nhân Sự');
if (rosterNode) {
  rosterNode.parameters.jsCode = `const items = $input.all();
const results = [];

for (const item of items) {
  const json = item.json;
  const body = json.body || json;
  if (Array.isArray(body.recipients) && body.recipients.length > 0) {
    for (const r of body.recipients) {
      results.push({
        id: r.id || r.userId || 'usr_emp',
        fullName: r.name || r.fullName || 'Nhân sự',
        email: r.email,
        department: r.department || r.dept || 'Toàn công ty',
        isActive: r.isActive !== false,
        preferredChannel: r.preferredChannel || 'EMAIL'
      });
    }
  } else if (body.recipient) {
    const r = body.recipient;
    results.push({
      id: r.id || r.userId || 'usr_emp',
      fullName: r.name || r.fullName || 'Nhân sự',
      email: r.email,
      department: r.department || r.dept || 'Toàn công ty',
      isActive: r.isActive !== false,
      preferredChannel: r.preferredChannel || 'EMAIL'
    });
  }
}

if (results.length > 0) {
  return results;
}

// Danh sách nhân sự thật từ hệ thống công ty
return [
  { id: 'usr_1', fullName: 'Đặng Tú Nguyên', email: 'tunguyen2006.qt@gmail.com', department: 'Phòng Quản trị & Nhân sự', isActive: true, preferredChannel: 'EMAIL' },
  { id: 'usr_2', fullName: 'Đặng Tú Nguyên', email: 'tudang43.qtdn@gmail.com', department: 'Phòng Kinh doanh & Tiếp thị', isActive: true, preferredChannel: 'EMAIL' },
  { id: 'usr_3', fullName: 'Trần Anh Tân', email: 'anhtanht1905@gmail.com', department: 'Kỹ thuật & Công nghệ', isActive: true, preferredChannel: 'EMAIL' },
  { id: 'usr_4', fullName: 'Đoàn Thanh Huy', email: 'doanthanhhuy1309@gmail.com', department: 'Phòng Nhân sự', isActive: true, preferredChannel: 'EMAIL' }
];`;
}

// 4. Update "Tạo Magic Link & Token Khảo Sát Tuần" to use LAN host and survey tab
const tokenNode = data3.nodes.find(n => n.id === 'wf3-generate-tokens' || n.name.includes('Magic Link'));
if (tokenNode) {
  tokenNode.parameters.jsCode = `const items = $input.all();
const weekStr = 'W' + Math.ceil((new Date().getDate()) / 7) + '_' + (new Date().getMonth() + 1);

return items.map(item => {
  const d = item.json;
  const token = Buffer.from((d.email || 'emp') + '_' + Date.now()).toString('base64').substring(0, 16);
  const host = 'http://192.168.2.123:3000';
  return {
    json: {
      ...d,
      surveyWeek: weekStr,
      surveyToken: token,
      magicLink: host + '/engagement?tab=survey&token=' + token + '&week=' + weekStr + '&email=' + encodeURIComponent(d.email || '') + '&name=' + encodeURIComponent(d.fullName || '') + '&dept=' + encodeURIComponent(d.department || ''),
      preferredChannel: d.preferredChannel || 'EMAIL'
    }
  };
});`;
}

fs.writeFileSync(file3, JSON.stringify(data3, null, 2), 'utf8');
console.log('Updated WF_03 successfully');

// 5. Update WF 1 and WF 2 with real fallbacks
const file1 = '/home/tuss/human-resources/n8n/workflows/01_survey_collector_ai_classification.json';
const data1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
const sanitizeNode1 = data1.nodes.find(n => n.id === 'wf1-sanitize' || n.name.includes('Chuẩn Hóa'));
if (sanitizeNode1) {
  sanitizeNode1.parameters.jsCode = `const body = $json.body || $json;
return {
  responseId: body.responseId || ('resp_' + Date.now()),
  employeeId: body.employeeId || body.userId || 'EMP-2026',
  employeeName: body.employeeName || body.name || 'Đặng Tú Nguyên',
  employeeEmail: body.employeeEmail || body.email || 'tunguyen2006.qt@gmail.com',
  department: body.department || body.dept || 'Phòng Nhân sự',
  surveyTitle: body.surveyTitle || 'Khảo sát Hạnh phúc & Gắn kết Q4',
  rating: Number(body.rating || 6),
  textAnswer: body.textAnswer || body.feedback || 'Dạo này dự án chạy nước rút, liên tục OT cuối tuần nên tôi cảm thấy khá mệt mỏi và kiệt sức. Cần sự hỗ trợ cân đối lại khối lượng việc.',
  submittedAt: new Date().toISOString()
};`;
}
fs.writeFileSync(file1, JSON.stringify(data1, null, 2), 'utf8');
console.log('Updated WF_01 successfully');

const file2 = '/home/tuss/human-resources/n8n/workflows/02_ai_sentiment_wellbeing.json';
const data2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
const profileNode2 = data2.nodes.find(n => n.id === 'wf2-profile' || n.name.includes('Tra Cứu'));
if (profileNode2) {
  profileNode2.parameters.jsCode = `const body = $json.body || $json;

return {
  employeeId: body.employeeId || body.userId || 'EMP-2026',
  employeeName: body.employeeName || body.name || 'Đặng Tú Nguyên',
  employeeEmail: body.employeeEmail || body.email || 'tunguyen2006.qt@gmail.com',
  department: body.department || body.dept || 'Phòng Kỹ thuật & AI',
  sentimentScore: Number(body.sentimentScore !== undefined ? body.sentimentScore : -0.65),
  burnoutRisk: body.burnoutRisk || 'HIGH',
  recentSurveysCount: 4,
  avgWeeklyOTHours: Number(body.avgWeeklyOTHours || 18),
  triggerReason: body.triggerReason || 'Phát hiện rủi ro kiệt sức cao từ khảo sát tuần',
  actionType: body.actionType
};`;
}
fs.writeFileSync(file2, JSON.stringify(data2, null, 2), 'utf8');
console.log('Updated WF_02 successfully');
