-- Schema cho Thành viên 3: Module Hội nhập & Đánh giá Hiệu suất
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id VARCHAR(50) PRIMARY KEY,
  employee_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  is_account_task BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpi_metrics (
  id VARCHAR(50) PRIMARY KEY,
  employee_email VARCHAR(255) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  target_value DECIMAL(5,2) NOT NULL,
  actual_value DECIMAL(5,2) NOT NULL,
  review_period VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id VARCHAR(50) PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  employee_email VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'PENDING',
  magic_link VARCHAR(500),
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
