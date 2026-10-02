import http from 'http';

const PORT = 4010;

const defaultJobs = [
  {
    id: 'mock-job-fe-1',
    title: 'Senior Frontend Engineer',
    description: 'Xây dựng giao diện ứng dụng nhân sự với Next.js và Tailwind CSS.',
    requirements: 'React, TypeScript, Next.js, Full-stack',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    department: 'Kỹ thuật & Công nghệ',
  },
  {
    id: 'mock-job-hr-2',
    title: 'Chuyên viên Tuyển dụng & HRBP',
    description: 'Vận hành quy trình tuyển dụng và đánh giá CV ứng viên.',
    requirements: 'HR, Tuyển dụng, Phỏng vấn',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    department: 'Nhân sự',
  },
  {
    id: 'mock-job-closed-3',
    title: 'Vị trí đã đóng',
    description: 'Không hiển thị',
    requirements: 'None',
    status: 'CLOSED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    department: 'Khác',
  },
];

let currentScenario = 'ok'; // ok | empty | error | slow | rate_limit
const appliedCandidates = new Set(); // lưu key: `${email}:${jobId}`

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint điều khiển: POST /__mock/scenario
  if (req.method === 'POST' && url.pathname === '/__mock/scenario') {
    const body = [];
    req.on('data', (chunk) => body.push(chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(Buffer.concat(body).toString('utf-8'));
        if (data.scenario) {
          currentScenario = data.scenario;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, scenario: currentScenario }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Endpoint reset: POST /__mock/reset
  if (req.method === 'POST' && url.pathname === '/__mock/reset') {
    currentScenario = 'ok';
    appliedCandidates.clear();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, scenario: currentScenario, appliedCount: 0 }));
    return;
  }

  // GET /recruitment/jobs
  if (req.method === 'GET' && url.pathname === '/recruitment/jobs') {
    if (currentScenario === 'error') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          statusCode: 500,
          message: 'Internal Server Error (Mock Scenario)',
        })
      );
      return;
    }

    if (currentScenario === 'empty') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
      return;
    }

    if (currentScenario === 'slow') {
      // Trì hoãn 1.5s (dưới timeout 8s) rồi trả về dữ liệu
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(defaultJobs));
      }, 1500);
      return;
    }

    // ok
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(defaultJobs));
    return;
  }

  // POST /recruitment/apply
  if (req.method === 'POST' && url.pathname === '/recruitment/apply') {
    const body = [];
    req.on('data', (chunk) => body.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(body);
      const str = buffer.toString('utf-8');
      console.log(`[Mock Backend] Nhận yêu cầu nộp CV mới (${buffer.length} bytes)`);

      // Kịch bản rate_limit (429)
      if (currentScenario === 'rate_limit') {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            statusCode: 429,
            message: 'ThrottlerException: Too Many Requests',
          })
        );
        return;
      }

      // Giữ nhánh trả 413 theo dung lượng nếu file > 10MB
      if (buffer.length > 10 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            statusCode: 413,
            message: 'File too large',
          })
        );
        return;
      }

      // Trích xuất email và jobId từ multipart payload
      const emailMatch = str.match(/name="email"[\r\n]+([^\r\n]+)/i);
      const jobIdMatch = str.match(/name="jobId"[\r\n]+([^\r\n]+)/i);

      const email = emailMatch ? emailMatch[1].trim().toLowerCase() : '';
      const jobId = jobIdMatch ? jobIdMatch[1].trim() : '';

      const key = `${email}:${jobId}`;

      // 409 Có trạng thái: lần đầu nhận, lần sau gửi trùng cặp (email, jobId) trả 409
      if (appliedCandidates.has(key)) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            statusCode: 409,
            message: 'You have already applied for this job',
          })
        );
        return;
      }

      appliedCandidates.add(key);

      // Kịch bản thành công (201 Created)
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          id: `candidate-${Date.now()}`,
          message: 'Application submitted successfully',
        })
      );
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Mock Backend] Đang lắng nghe tại http://localhost:${PORT}`);
});
