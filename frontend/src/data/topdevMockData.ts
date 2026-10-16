import { Job, CompanySpotlight, BlogPost } from '@/types/topdev';

export const POPULAR_TECH_KEYWORDS = [
  'Java',
  'ReactJS',
  '.NET',
  'NodeJS',
  'Python',
  'Golang',
  'DevOps',
  'QA / Tester',
  'Flutter',
  'AI / Machine Learning',
  'AWS',
  'Product Manager'
];

export const VIETNAM_LOCATIONS = [
  'Tất cả địa điểm',
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Remote (Toàn quốc)'
];

export const JOB_LEVELS = [
  'Tất cả cấp bậc',
  'Intern / Thực tập sinh',
  'Fresher',
  'Junior',
  'Middle',
  'Senior',
  'Lead / Manager'
];

export const SAMPLE_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Fullstack Engineer (React / NodeJS / AWS)',
    company: {
      id: 'comp-vng',
      name: 'VNG Corporation',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      city: 'Hồ Chí Minh',
      district: 'Quận 7 (VNG Campus)',
      address: 'Z06 Đường số 13, KCX Tân Thuận, Tân Thuận Đông, Quận 7, TP.HCM',
      size: '3000+ nhân viên',
      industry: 'Internet & Công nghệ số (Game, Zalo, Fintech)',
      verified: true
    },
    salary: {
      display: '2,200 - 3,500 USD',
      min: 2200,
      max: 3500,
      currency: 'USD'
    },
    location: 'Hồ Chí Minh',
    workType: 'Hybrid',
    level: 'Senior',
    experienceYears: '4 - 7 năm kinh nghiệm',
    skills: ['ReactJS', 'NodeJS', 'TypeScript', 'AWS', 'PostgreSQL', 'Microservices'],
    postedTime: '2 giờ trước',
    featured: true,
    urgent: true,
    viewsCount: 1420,
    applicantsCount: 28,
    techStackDetails: {
      primary: ['React 18+', 'TypeScript', 'Node.js', 'NestJS'],
      secondary: ['Tailwind CSS', 'Redux Toolkit', 'Redis', 'GraphQL'],
      database: ['PostgreSQL', 'MongoDB', 'Redis'],
      cloudDevops: ['AWS (ECS, Lambda, S3, CloudFront)', 'Docker', 'Kubernetes', 'CI/CD GitHub Actions']
    },
    description: [
      'Tham gia phát triển và nâng cấp hệ sinh thái nền tảng số phục vụ hơn 20 triệu người dùng hoạt động hàng ngày.',
      'Thiết kế kiến trúc hệ thống Microservices, tối ưu hiệu năng Frontend và Backend với độ trễ thấp.',
      'Phối hợp chặt chẽ cùng Product Manager, UI/UX Designer và QA để phân tích yêu cầu nghiệp vụ và đưa ra giải pháp kỹ thuật tối ưu.',
      'Review code, xây dựng coding conventions và mentoring cho các thành viên Junior và Middle trong team.',
      'Nghiên cứu áp dụng các công nghệ mới, AI code completion và tối ưu chi phí hạ tầng Cloud.'
    ],
    requirements: [
      'Tối thiểu 4+ năm kinh nghiệm phát triển ứng dụng web hiện đại với ReactJS và Node.js / TypeScript.',
      'Nắm vững kiến trúc Microservices, RESTful API, WebSocket và Event-Driven architecture (Kafka/RabbitMQ).',
      'Kinh nghiệm thực chiến với các hệ cơ sở dữ liệu lớn (PostgreSQL, MongoDB) và cache caching strategies (Redis).',
      'Có kinh nghiệm deploy và vận hành hệ thống trên AWS (ECS, EKS, RDS, S3, CloudWatch).',
      'Tư duy Clean Architecture, Clean Code, Unit testing (Jest, Cypress) và CI/CD pipelines.',
      'Kỹ năng giao tiếp tốt, tinh thần trách nhiệm cao, khả năng giải quyết vấn đề độc lập.'
    ],
    benefits: [
      'Mức lương cạnh tranh lên tới $3,500 + Thưởng hiệu suất cuối năm hấp dẫn (lương tháng 13 - 16).',
      'Làm việc tại VNG Campus hiện đại nhất Đông Nam Á với bể bơi, phòng gym, sân bóng đá, căn tin miễn phí.',
      'Chế độ làm việc Hybrid linh hoạt (2 ngày remote / tuần).',
      'Gói bảo hiểm sức khỏe quốc tế cao cấp cho nhân viên và người thân.',
      'Cấp mới Macbook Pro M3 Max / Dell Precision và màn hình 4K.',
      'Ngân sách đào tạo, học tập chứng chỉ AWS / System Design định kỳ hàng năm.'
    ]
  },
  {
    id: 'job-2',
    title: 'Senior Golang Backend Engineer (High-throughput Payment)',
    company: {
      id: 'comp-momo',
      name: 'MoMo (M_Service)',
      logo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=100&auto=format&fit=crop&q=80',
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      address: 'Tòa nhà Phú Mỹ Hưng, Hoàng Văn Thái, Tân Phú, Quận 7, TP.HCM',
      size: '2000+ nhân viên',
      industry: 'Fintech & Thanh toán điện tử',
      verified: true
    },
    salary: {
      display: '2,500 - 4,000 USD',
      min: 2500,
      max: 4000,
      currency: 'USD'
    },
    location: 'Hồ Chí Minh',
    workType: 'Hybrid',
    level: 'Senior',
    experienceYears: '5+ năm kinh nghiệm',
    skills: ['Golang', 'gRPC', 'Kafka', 'Redis', 'PostgreSQL', 'High Concurrency'],
    postedTime: '5 giờ trước',
    featured: true,
    urgent: false,
    viewsCount: 1890,
    applicantsCount: 35,
    techStackDetails: {
      primary: ['Golang (Go 1.22+)', 'gRPC', 'Protobuf'],
      secondary: ['Kafka', 'RabbitMQ', 'Distributed Tracing (OpenTelemetry)'],
      database: ['PostgreSQL', 'Redis Cluster', 'Cassandra'],
      cloudDevops: ['Kubernetes', 'Helm', 'Docker', 'GCP / On-Premise Cloud']
    },
    description: [
      'Phát triển hệ thống xử lý giao dịch lõi cho ví điện tử MoMo với lưu lượng hàng chục ngàn TPS vào các dịp cao điểm.',
      'Tối ưu hóa độ trễ thanh toán xuống dưới 50ms, đảm bảo tính sẵn sàng cao (High Availability 99.999%).',
      'Xây dựng các cơ chế phòng chống gian lận (Anti-fraud), Data Reconciliation và bảo mật chuẩn PCI-DSS.',
      'Tham gia thiết kế giải pháp kỹ thuật, phân tích bottleneck và tuning performance cơ sở dữ liệu phân tán.'
    ],
    requirements: [
      'Có từ 3+ năm kinh nghiệm lập trình chuyên sâu với Golang (tổng kinh nghiệm Backend 5+ năm).',
      'Hiểu sâu sắc về Goroutine, Channel, Memory Management và Concurrency patterns trong Go.',
      'Kinh nghiệm dày dặn với Message Queue chịu tải lớn như Apache Kafka, RabbitMQ.',
      'Hiểu rõ cơ chế Database Sharding, Connection Pooling, Transaction Isolation và ACID properties.',
      'Từng làm việc trong môi trường Fintech, Ngân hàng, Sàn thương mại điện tử là lợi thế lớn.'
    ],
    benefits: [
      'Thu nhập cạnh tranh tương xứng năng lực ($2,500 - $4,000) cùng gói ESOP cổ phần.',
      'Thưởng tháng 13 + Thưởng KPI theo kết quả kinh doanh lên tới 3 - 5 tháng lương.',
      'Bảo hiểm sức khỏe Bảo Việt Gold cho bản thân và gia đình.',
      'Môi trường công nghệ mở, khuyến khích sáng tạo và thử nghiệm giải pháp mới.',
      'Khám sức khỏe tổng quát cao cấp hàng năm tại bệnh viện quốc tế hàng đầu.'
    ]
  },
  {
    id: 'job-3',
    title: 'Lead Cloud DevOps / SRE Engineer',
    company: {
      id: 'comp-nab',
      name: 'NAB Innovation Centre Vietnam',
      logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
      city: 'Hà Nội',
      district: 'Quận Ba Đình',
      address: 'Tòa nhà Capital Place, 29 Liễu Giai, Ngọc Khánh, Ba Đình, Hà Nội',
      size: '1500+ kỹ sư',
      industry: 'Banking & Financial Software',
      verified: true
    },
    salary: {
      display: '3,000 - 4,800 USD',
      min: 3000,
      max: 4800,
      currency: 'USD'
    },
    location: 'Hà Nội',
    workType: 'Hybrid',
    level: 'Lead / Manager',
    experienceYears: '6+ năm kinh nghiệm',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Prometheus', 'Python'],
    postedTime: 'Hôm nay',
    featured: true,
    urgent: true,
    viewsCount: 960,
    applicantsCount: 19,
    techStackDetails: {
      primary: ['AWS Multi-Account', 'Kubernetes (EKS)', 'Terraform / OpenTofu'],
      secondary: ['ArgoCD', 'GitOps', 'Helm', 'Python / Bash scripting'],
      database: ['Amazon Aurora', 'DynamoDB'],
      cloudDevops: ['Prometheus', 'Grafana', 'Datadog', 'Splunk', 'HashiCorp Vault']
    },
    description: [
      'Dẫn dắt đội ngũ kỹ sư DevOps/SRE xây dựng nền tảng Cloud Native cho ngân hàng hàng đầu nước Úc.',
      'Thiết kế hạ tầng Infrastructure as Code (IaC) tự động hóa 100% bằng Terraform và CloudFormation.',
      'Xây dựng các quy chuẩn GitOps, CI/CD pipeline an toàn, tích hợp kiểm thử bảo mật (SAST/DAST).',
      'Định hình chỉ số SLA/SLO/SLI, xây dựng hệ thống cảnh báo và xử lý sự cố quy mô lớn.'
    ],
    requirements: [
      '6+ năm kinh nghiệm chuyên sâu về DevOps, Cloud Platform hoặc Site Reliability Engineering.',
      'Sở hữu chứng chỉ AWS Solutions Architect Professional hoặc DevOps Engineer Professional là điểm cộng lớn.',
      'Thành thạo Kubernetes, Docker, container networking và service mesh (Istio/Linkerd).',
      'Tiếng Anh lưu loát (làm việc trực tiếp hàng ngày với các kiến trúc sư tại Melbourne/Sydney).',
      'Kinh nghiệm quản lý hoặc technical lead nhóm từ 5-10 kỹ sư.'
    ],
    benefits: [
      'Lương tháng 13 + Thưởng hiệu suất hàng năm bằng tiền mặt hấp dẫn.',
      '20 ngày phép năm hưởng nguyên lương + 10 ngày nghỉ ốm chăm sóc sức khỏe.',
      'Cơ hội Onsite đào tạo và công tác tại Úc (Sydney & Melbourne).',
      'Cấp mới Macbook Pro M3 Pro & 100% chi phí set up góc làm việc tại nhà ($1,000).'
    ]
  },
  {
    id: 'job-4',
    title: 'Middle / Senior React Native & Flutter Mobile Developer',
    company: {
      id: 'comp-fpt',
      name: 'FPT Software',
      logo: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&auto=format&fit=crop&q=80',
      city: 'Đà Nẵng',
      district: 'Quận Ngũ Hành Sơn',
      address: 'FPT Complex, Đường Nam Kỳ Khởi Nghĩa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
      size: '30,000+ nhân viên',
      industry: 'Software Outsourcing & Global DX',
      verified: true
    },
    salary: {
      display: '1,500 - 2,500 USD',
      min: 1500,
      max: 2500,
      currency: 'USD'
    },
    location: 'Đà Nẵng',
    workType: 'Hybrid',
    level: 'Middle',
    experienceYears: '2 - 5 năm kinh nghiệm',
    skills: ['Flutter', 'React Native', 'TypeScript', 'Dart', 'iOS', 'Android'],
    postedTime: '1 ngày trước',
    featured: false,
    urgent: false,
    viewsCount: 1100,
    applicantsCount: 22,
    techStackDetails: {
      primary: ['Flutter / Dart', 'React Native', 'TypeScript'],
      secondary: ['Bloc / Provider', 'Redux', 'Native iOS (Swift)', 'Native Android (Kotlin)'],
      database: ['SQLite', 'Realm', 'Hive'],
      cloudDevops: ['Fastlane', 'Firebase', 'App Center', 'GitHub Actions']
    },
    description: [
      'Tham gia các dự án chuyển đổi số toàn cầu cho khách hàng tại thị trường Nhật Bản, Mỹ và Châu Âu.',
      'Xây dựng các ứng dụng di động đa nền tảng mượt mà, tối ưu hóa memory leak và thời gian khởi động.',
      'Phát triển các custom components, native bridge tương tác với Bluetooth, Camera và định vị GPS.',
      'Đóng gói và triển khai ứng dụng lên Apple App Store và Google Play Store.'
    ],
    requirements: [
      '2+ năm kinh nghiệm phát triển Mobile với Flutter hoặc React Native.',
      'Nắm vững State Management (Bloc, Riverpod, Redux hoặc Zustand).',
      'Hiểu rõ lifecycle của mobile app và các nguyên tắc thiết kế UI/UX trên iOS/Android.',
      'Biết tiếng Nhật (N3+) hoặc tiếng Anh giao tiếp tốt là lợi thế nhận phụ cấp ngoại ngữ hàng tháng.'
    ],
    benefits: [
      'Lương cạnh tranh, xét tăng lương 2 lần/năm theo năng lực thực tế.',
      'Khuôn viên FPT Complex xanh mát, có sân tennis, hồ bơi, phòng gym đẳng cấp.',
      'Cơ hội đi onsite ngắn hạn và dài hạn tại Tokyo, Singapore, Đức.',
      'Xe đưa đón nhân viên nội thành Đà Nẵng - Hội An.'
    ]
  },
  {
    id: 'job-5',
    title: 'Senior Java Backend Engineer (Spring Boot / Microservices)',
    company: {
      id: 'comp-bosch',
      name: 'Bosch Global Software Technologies Vietnam',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      address: 'Tòa nhà E-Town Central, 11 Đoàn Văn Bơ, Quận 4, TP.HCM',
      size: '4000+ kỹ sư',
      industry: 'Automotive & IoT Solutions',
      verified: true
    },
    salary: {
      display: '40 - 65 Triệu VND',
      min: 1700,
      max: 2700,
      currency: 'VND'
    },
    location: 'Hồ Chí Minh',
    workType: 'At office',
    level: 'Senior',
    experienceYears: '4+ năm kinh nghiệm',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Docker', 'Oracle'],
    postedTime: '3 giờ trước',
    featured: true,
    urgent: true,
    viewsCount: 840,
    applicantsCount: 16,
    techStackDetails: {
      primary: ['Java 17/21', 'Spring Boot 3', 'Spring Cloud'],
      secondary: ['Hibernate / JPA', 'Apache Kafka', 'RESTful API'],
      database: ['Oracle DB', 'PostgreSQL', 'Redis'],
      cloudDevops: ['Docker', 'Kubernetes', 'Jenkins', 'SonarQube']
    },
    description: [
      'Tham gia phát triển hệ thống phần mềm kết nối xe thông minh (Connected Mobility Solutions) quy mô toàn cầu.',
      'Thiết kế và triển khai các API xử lý hàng triệu gói tin telemetry gửi từ cảm biến xe hơi theo thời gian thực.',
      'Áp dụng quy trình chuẩn Đức với chất lượng code nghiêm ngặt, tự động hóa kiểm thử tự động.',
      'Làm việc cùng các nhóm kỹ sư tại Đức, Ấn Độ và Nhật Bản.'
    ],
    requirements: [
      '4+ năm kinh nghiệm lập trình Backend chuyên sâu với Java và Spring Boot.',
      'Nắm chắc kiến trúc Microservices, Clean Architecture, Design Patterns.',
      'Thành thạo tối ưu câu lệnh SQL trên Oracle / PostgreSQL và cơ chế Indexing.',
      'Giao tiếp tiếng Anh lưu loát trong công việc.'
    ],
    benefits: [
      'Môi trường làm việc chuẩn quốc tế, văn hóa tôn trọng sự đa dạng.',
      'Gói bảo hiểm sức khỏe Aon toàn diện cho nhân viên và gia đình.',
      'Thưởng kết quả kinh doanh cuối năm lên tới 2-3 tháng lương.',
      'Được đào tạo bài bản các chứng chỉ kỹ thuật hàng đầu thế giới.'
    ]
  },
  {
    id: 'job-6',
    title: 'AI / Machine Learning Engineer (LLM & Computer Vision)',
    company: {
      id: 'comp-vinai',
      name: 'VinAI (Vingroup)',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      city: 'Hà Nội',
      district: 'Huyện Gia Lâm',
      address: 'Khu Đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội',
      size: '500+ nhà nghiên cứu & kỹ sư',
      industry: 'Trí tuệ nhân tạo (AI Research & Products)',
      verified: true
    },
    salary: {
      display: '2,500 - 4,500 USD',
      min: 2500,
      max: 4500,
      currency: 'USD'
    },
    location: 'Hà Nội',
    workType: 'Hybrid',
    level: 'Senior',
    experienceYears: '3+ năm kinh nghiệm',
    skills: ['Python', 'PyTorch', 'LLMs', 'Computer Vision', 'LangChain', 'CUDA'],
    postedTime: 'Hôm nay',
    featured: true,
    urgent: true,
    viewsCount: 2240,
    applicantsCount: 42,
    techStackDetails: {
      primary: ['Python 3.11+', 'PyTorch', 'Transformers (Hugging Face)'],
      secondary: ['LangChain / LlamaIndex', 'vLLM', 'Triton Inference Server'],
      database: ['Milvus', 'Qdrant (Vector DB)', 'PostgreSQL'],
      cloudDevops: ['NVIDIA SuperPOD (A100/H100)', 'Kubernetes', 'MLflow']
    },
    description: [
      'Nghiên cứu và phát triển các mô hình ngôn ngữ lớn (PhởGPT, Open-source LLMs) tối ưu hóa cho tiếng Việt.',
      'Xây dựng các giải pháp Agentic AI, Retrieval-Augmented Generation (RAG) và Fine-tuning mô hình.',
      'Tối ưu hóa pipeline suy luận (Inference optimization) giảm độ trễ và chi phí GPU trên cụm máy chủ siêu máy tính.',
      'Cộng tác cùng các nhà nghiên cứu hàng đầu xuất bản bài báo tại các hội nghị đỉnh cao (NeurIPS, CVPR, ACL).'
    ],
    requirements: [
      'Tốt nghiệp Thạc sĩ / Tiến sĩ hoặc Kỹ sư xuất sắc ngành Khoa học Máy tính, Toán tin, Trí tuệ nhân tạo.',
      '3+ năm kinh nghiệm thực chiến với Deep Learning, PyTorch, và mô hình Transformer.',
      'Hiểu sâu sắc về LLM fine-tuning (LoRA, QLoRA), Quantization, Prompt Engineering và Vector Search.',
      'Có bài báo khoa học hoặc thành tích cao tại các cuộc thi Kaggle là lợi thế vượt trội.'
    ],
    benefits: [
      'Làm việc cùng các chuyên gia AI đẳng cấp thế giới, trực tiếp sử dụng cụm siêu máy tính NVIDIA DGX SuperPOD.',
      'Thu nhập không giới hạn tùy thuộc vào năng lực và tiềm năng đóng góp.',
      'Ưu đãi đặc quyền của hệ sinh thái Vingroup (VinFast, Vinmec, Vinschool, Vinpearl).',
      'Đài thọ toàn bộ kinh phí tham dự các hội nghị AI quốc tế tại Mỹ, Châu Âu.'
    ]
  },
  {
    id: 'job-7',
    title: 'Senior QA / Automation Test Lead (Selenium / Cypress / Playwright)',
    company: {
      id: 'comp-kms',
      name: 'KMS Technology Vietnam',
      logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100&auto=format&fit=crop&q=80',
      city: 'Hồ Chí Minh',
      district: 'Quận Tân Bình',
      address: '2 Đường Bạch Đằng, Phường 2, Tân Bình, TP.HCM',
      size: '1200+ nhân viên',
      industry: 'Software Development & IT Consulting',
      verified: true
    },
    salary: {
      display: '1,800 - 2,800 USD',
      min: 1800,
      max: 2800,
      currency: 'USD'
    },
    location: 'Hồ Chí Minh',
    workType: 'Hybrid',
    level: 'Senior',
    experienceYears: '4+ năm kinh nghiệm',
    skills: ['Cypress', 'Playwright', 'Selenium', 'CI/CD', 'API Testing', 'Java / TypeScript'],
    postedTime: '1 ngày trước',
    featured: false,
    urgent: false,
    viewsCount: 710,
    applicantsCount: 14,
    techStackDetails: {
      primary: ['Playwright', 'Cypress', 'TypeScript', 'Selenium WebDriver'],
      secondary: ['Postman / Newman', 'RestAssured', 'JMeter / k6'],
      database: ['SQL', 'MongoDB'],
      cloudDevops: ['GitLab CI', 'Jenkins', 'Docker']
    },
    description: [
      'Xây dựng và hoàn thiện Test Automation Framework từ đầu cho các sản phẩm SaaS phục vụ thị trường Mỹ.',
      'Thiết kế test strategy, test plan, thực hiện automation test cho cả Web, Mobile và RESTful API.',
      'Tích hợp automation test suite vào quy trình CI/CD pipeline, đảm bảo phát hiện lỗi sớm.',
      'Dẫn dắt và đào tạo đội ngũ QA trẻ nâng cao năng lực viết code tự động hóa.'
    ],
    requirements: [
      '4+ năm kinh nghiệm về Kiểm thử phần mềm, trong đó ít nhất 2 năm làm Test Automation.',
      'Thành thạo một trong các công cụ: Playwright, Cypress hoặc Selenium với TypeScript / Java / Python.',
      'Có kiến thức vững về kiểm thử API (Postman, REST Assured) và Performance Testing cơ bản.',
      'Khả năng đọc hiểu tài liệu và giao tiếp tiếng Anh tốt với khách hàng quốc tế.'
    ],
    benefits: [
      'Lương tháng 13 + thưởng hiệu quả kinh doanh định kỳ.',
      'Môi trường làm việc chuẩn Best Places to Work in Vietnam nhiều năm liền.',
      'Chương trình bảo hiểm y tế toàn diện cho cả gia đình nhân viên.',
      'Hỗ trợ 100% kinh phí thi các chứng chỉ quốc tế (ISTQB, AWS, Scrum Master).'
    ]
  },
  {
    id: 'job-8',
    title: 'Senior Frontend Engineer (Next.js / TypeScript / Design System)',
    company: {
      id: 'comp-shopee',
      name: 'Shopee Vietnam',
      logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      address: 'Tòa nhà Saigon Centre, 65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM',
      size: '5000+ nhân viên',
      industry: 'E-Commerce & Tech Platform',
      verified: true
    },
    salary: {
      display: '2,200 - 3,600 USD',
      min: 2200,
      max: 3600,
      currency: 'USD'
    },
    location: 'Hồ Chí Minh',
    workType: 'Hybrid',
    level: 'Senior',
    experienceYears: '4+ năm kinh nghiệm',
    skills: ['Next.js', 'ReactJS', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    postedTime: '4 giờ trước',
    featured: true,
    urgent: true,
    viewsCount: 1650,
    applicantsCount: 31,
    techStackDetails: {
      primary: ['Next.js 14/15 App Router', 'React', 'TypeScript'],
      secondary: ['Tailwind CSS', 'Zustand', 'Web Vitals (LCP, FID, CLS)'],
      database: ['REST API', 'GraphQL'],
      cloudDevops: ['Vercel', 'CDN Optimization', 'Webpack / Turbopack', 'Micro-frontends']
    },
    description: [
      'Phát triển giao diện web mua sắm trực tuyến cho sàn thương mại điện tử hàng đầu Đông Nam Á.',
      'Tối ưu Core Web Vitals, SSR/SSG, giảm thiểu bundle size và đảm bảo trải nghiệm tức thì trên mọi thiết bị.',
      'Xây dựng các module Micro-frontends độc lập, tăng tốc độ phát triển cho hàng chục sub-teams.',
      'Cộng tác chặt chẽ cùng team Design xây dựng Design System đồng nhất và dễ mở rộng.'
    ],
    requirements: [
      '4+ năm kinh nghiệm lập trình Frontend chuyên sâu với React, Next.js và TypeScript.',
      'Hiểu rõ cơ chế Browser Rendering, Critical Rendering Path, Service Worker và SEO optimization.',
      'Có kinh nghiệm xây dựng Design System hoặc Component Library dùng chung.',
      'Tư duy giải quyết vấn đề nhanh chóng, khả năng chịu áp lực cao trong các mùa siêu sale lớn (9.9, 11.11, 12.12).'
    ],
    benefits: [
      'Mức đãi ngộ dẫn đầu thị trường công nghệ kèm thưởng quý và thưởng năm hào phóng.',
      'Snack, trà sữa, hoa quả tươi miễn phí hàng ngày tại pantry sang trọng tại Saigon Centre.',
      'Bảo hiểm sức khỏe cao cấp hạng Diamond.',
      'Voucher mua sắm nội bộ ưu đãi độc quyền dành cho nhân viên.'
    ]
  },
  {
    id: 'job-9',
    title: 'Senior .NET / C# Core Backend Developer (Microservices & Azure)',
    company: {
      id: 'comp-axon',
      name: 'Axon Vietnam',
      logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=80',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      address: 'Tòa nhà Deutsches Haus, 33 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
      size: '400+ kỹ sư tại VN',
      industry: 'Public Safety Technology & Cloud Services (US Company)',
      verified: true
    },
    salary: {
      display: '2,600 - 4,200 USD',
      min: 2600,
      max: 4200,
      currency: 'USD'
    },
    location: 'Hồ Chí Minh',
    workType: 'Hybrid',
    level: 'Senior',
    experienceYears: '5+ năm kinh nghiệm',
    skills: ['.NET Core', 'C#', 'Azure', 'Microservices', 'CosmosDB', 'Docker'],
    postedTime: '6 giờ trước',
    featured: true,
    urgent: false,
    viewsCount: 1320,
    applicantsCount: 20,
    techStackDetails: {
      primary: ['.NET 8', 'C#', 'ASP.NET Core Web API'],
      secondary: ['Entity Framework Core', 'Azure Service Bus', 'MassTransit'],
      database: ['Azure Cosmos DB', 'SQL Server', 'Redis'],
      cloudDevops: ['Microsoft Azure', 'AKS (Azure Kubernetes)', 'Docker', 'Terraform']
    },
    description: [
      'Tham gia kiến tạo các giải pháp phần mềm cứu hộ và an toàn công cộng (Public Safety) phục vụ cảnh sát và lực lượng ứng cứu tại hơn 100 quốc gia.',
      'Thiết kế và triển khai backend microservices hiệu năng cao trên nền tảng đám mây Microsoft Azure.',
      'Xử lý và lưu trữ hàng terabyte dữ liệu video giám sát và bằng chứng số hóa với độ bảo mật tuyệt đối.',
      'Tham gia quy trình phát triển Agile Scrum toàn cầu, làm việc trực tiếp cùng trụ sở chính tại Seattle & Scottsdale, Mỹ.'
    ],
    requirements: [
      '5+ năm kinh nghiệm lập trình chuyên nghiệp với C# và .NET Core.',
      'Kinh nghiệm thực tế thiết kế RESTful API, Microservices, Event-Driven Architecture.',
      'Hiểu sâu về Microsoft Azure (Azure App Services, Functions, Event Hub, Service Bus).',
      'Tiếng Anh xuất sắc (nghe nói đọc viết lưu loát trong môi trường quốc tế).',
      'Đam mê tạo ra các sản phẩm công nghệ có ý nghĩa xã hội và cứu sống con người.'
    ],
    benefits: [
      'Mức lương USD hấp dẫn, thưởng cổ phần RSU (chứng khoán NASDAQ: AXON) giá trị cao.',
      'Văn phòng chuẩn 5 sao tại tòa nhà Deutsches Haus Quận 1 view toàn thành phố.',
      'Chế độ nghỉ phép không giới hạn (Unlimited PTO).',
      'Bảo hiểm sức khỏe quốc tế cao cấp chi trả 100% cho nhân viên và tất cả người phụ thuộc.'
    ]
  },
  {
    id: 'job-10',
    title: 'Staff / Principal Software Engineer (System Architecture)',
    company: {
      id: 'comp-onemount',
      name: 'One Mount Group',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
      city: 'Hà Nội',
      district: 'Quận Hai Bà Trưng',
      address: 'Tòa nhà Century Tower, Times City, 458 Minh Khai, Hà Nội',
      size: '2000+ nhân viên',
      industry: 'B2B & B2C Digital Ecosystem (VinShop, OneHousing)',
      verified: true
    },
    salary: {
      display: '3,500 - 6,000 USD',
      min: 3500,
      max: 6000,
      currency: 'USD'
    },
    location: 'Hà Nội',
    workType: 'Hybrid',
    level: 'Lead / Manager',
    experienceYears: '8+ năm kinh nghiệm',
    skills: ['System Design', 'Distributed Systems', 'Java / Golang', 'Kafka', 'GCP'],
    postedTime: 'Hôm nay',
    featured: true,
    urgent: true,
    viewsCount: 1540,
    applicantsCount: 11,
    techStackDetails: {
      primary: ['Distributed Architecture', 'Golang', 'Java', 'Domain-Driven Design (DDD)'],
      secondary: ['gRPC', 'Kafka', 'Event Sourcing', 'CQRS'],
      database: ['PostgreSQL', 'Spanner', 'Redis', 'BigQuery'],
      cloudDevops: ['Google Cloud Platform (GCP)', 'Kubernetes', 'Istio']
    },
    description: [
      'Chịu trách nhiệm kiến trúc kỹ thuật toàn diện cho nền tảng bán lẻ và bất động sản công nghệ lớn nhất Việt Nam.',
      'Định hình chiến lược công nghệ dài hạn, lựa chọn công nghệ và tiêu chuẩn kỹ thuật cho hơn 400 kỹ sư.',
      'Giải quyết các bài toán hóc búa về kiến trúc phân tán (Distributed Consistency, High Concurrency, Disaster Recovery).',
      'Đóng vai trò Cố vấn công nghệ cho Ban giám đốc và đào tạo thế hệ Technical Architects kế cận.'
    ],
    requirements: [
      '8+ năm kinh nghiệm kỹ thuật phần mềm, trong đó ít nhất 3 năm ở vị trí Principal Engineer hoặc Software Architect.',
      'Am hiểu sâu sắc về Distributed Systems, Event-Driven Architecture, High Availability và Data Pipelines.',
      'Từng thiết kế và vận hành thành công hệ thống chịu tải từ 50,000 TPS trở lên.',
      'Tư duy chiến lược, kỹ năng thuyết phục và khả năng truyền cảm hứng công nghệ mạnh mẽ.'
    ],
    benefits: [
      'Gói thu nhập siêu hấp dẫn lên tới $6,000/tháng + Gói thưởng cổ phần giá trị lớn.',
      'Quyền tự chủ công nghệ cao nhất, trực tiếp quyết định hướng phát triển kiến trúc kỹ thuật.',
      'Gói chăm sóc y tế chuẩn quốc tế cho cả gia đình tại Bệnh viện Vinmec.',
      'Xe ô tô đưa đón riêng dành cho cấp Quản lý cấp cao.'
    ]
  },
  {
    id: 'job-11',
    title: 'Senior Python / Django Backend Developer (Data Pipeline & API)',
    company: {
      id: 'comp-viettel',
      name: 'Viettel Digital Solutions (VDS)',
      logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=100&auto=format&fit=crop&q=80',
      city: 'Hà Nội',
      district: 'Quận Cầu Giấy',
      address: 'Tòa nhà Viettel, Số 1 Trần Hữu Dực, Cầu Giấy, Hà Nội',
      size: '5000+ nhân viên',
      industry: 'Telecom, Digital Banking & Big Data',
      verified: true
    },
    salary: {
      display: '35 - 55 Triệu VND',
      min: 1500,
      max: 2400,
      currency: 'VND'
    },
    location: 'Hà Nội',
    workType: 'At office',
    level: 'Senior',
    experienceYears: '3 - 6 năm kinh nghiệm',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Airflow', 'Docker'],
    postedTime: '2 ngày trước',
    featured: false,
    urgent: false,
    viewsCount: 880,
    applicantsCount: 18,
    techStackDetails: {
      primary: ['Python 3.12', 'FastAPI', 'Django Rest Framework'],
      secondary: ['Celery', 'Redis', 'Apache Airflow', 'Pandas'],
      database: ['PostgreSQL', 'ClickHouse', 'Elasticsearch'],
      cloudDevops: ['Docker', 'Kubernetes', 'Viettel Cloud', 'GitLab CI']
    },
    description: [
      'Phát triển các dịch vụ thanh toán Viettel Money và hạ tầng dữ liệu lớn viễn thông.',
      'Thiết kế REST API tốc độ cao bằng FastAPI, xử lý song song các tác vụ nền với Celery & Redis.',
      'Xây dựng các pipeline ETL tự động thu thập và chuẩn hóa dữ liệu tài chính số quy mô lớn.',
      'Phối hợp cùng team Big Data và Data Scientist tối ưu các thuật toán chấm điểm tín dụng số.'
    ],
    requirements: [
      '3+ năm kinh nghiệm làm việc với Python (FastAPI hoặc Django).',
      'Hiểu rõ AsyncIO, ORM optimization, kết nối cơ sở dữ liệu và xử lý đa luồng.',
      'Có kinh nghiệm với cơ sở dữ liệu quan hệ (PostgreSQL) và phi quan hệ (Redis, Elasticsearch).',
      'Tinh thần kỷ luật cao, tinh thần vì cộng đồng và sẵn sàng cống hiến.'
    ],
    benefits: [
      'Môi trường ổn định, tiềm lực tài chính hàng đầu Việt Nam.',
      'Thưởng ngày lễ, Tết, ngày thành lập tập đoàn (tổng thu nhập trung bình 16 - 19 tháng lương/năm).',
      'Bảo hiểm chăm sóc sức khỏe độc quyền Viettel Care.',
      'Đầy đủ cơ sở vật chất thể thao: sân tennis, bóng bàn, phòng gym miễn phí.'
    ]
  },
  {
    id: 'job-12',
    title: 'Senior Product Manager (IT / SaaS Platform)',
    company: {
      id: 'comp-vng-2',
      name: 'VNG Corporation',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      address: 'VNG Campus, Quận 7, TP.HCM',
      size: '3000+ nhân viên',
      industry: 'Product & Platforms',
      verified: true
    },
    salary: {
      display: '2,500 - 3,800 USD',
      min: 2500,
      max: 3800,
      currency: 'USD'
    },
    location: 'Hồ Chí Minh',
    workType: 'Hybrid',
    level: 'Lead / Manager',
    experienceYears: '4+ năm kinh nghiệm PM',
    skills: ['Product Management', 'Data-driven', 'Agile / Scrum', 'UI/UX', 'Roadmap'],
    postedTime: '1 ngày trước',
    featured: true,
    urgent: false,
    viewsCount: 1120,
    applicantsCount: 17,
    techStackDetails: {
      primary: ['Product Roadmap', 'Agile Scrum', 'A/B Testing'],
      secondary: ['Mixpanel / Amplitude', 'SQL Data Analysis', 'Figma'],
      database: ['Data Warehouses'],
      cloudDevops: ['Jira', 'Confluence']
    },
    description: [
      'Chịu trách nhiệm toàn diện về Product Vision, Roadmap và vòng đời của nền tảng dịch vụ số phục vụ hàng triệu người dùng.',
      'Phân tích định lượng hành vi người dùng bằng dữ liệu (Metrics, Conversion Funnel, Retention Rate).',
      'Dẫn dắt các sprint phát triển sản phẩm cùng đội ngũ kỹ sư, designer và marketing.',
      'Định nghĩa các tiêu chí thành công của tính năng (Definition of Done, OKRs, KPIs).'
    ],
    requirements: [
      '4+ năm kinh nghiệm làm Product Manager trong các công ty công nghệ, SaaS hoặc E-commerce.',
      'Tư duy sản phẩm sắc bén, khả năng phân tích dữ liệu chuyên sâu (SQL, Amplitude/Mixpanel).',
      'Khả năng thấu cảm người dùng và phối hợp nhịp nhàng với đội ngũ kỹ sư phần mềm.',
      'Kỹ năng thuyết trình và đàm phán xuất sắc.'
    ],
    benefits: [
      'Thu nhập cạnh tranh cùng gói thưởng kết quả kinh doanh định kỳ.',
      'Môi trường năng động, văn hóa mở trao quyền tối đa cho Product Owner.',
      'Các đãi ngộ cao cấp tại VNG Campus (Căn tin, Gym, Bể bơi, Cafe).'
    ]
  }
];

export const SPOTLIGHT_COMPANIES: CompanySpotlight[] = [
  {
    id: 'hub-ai',
    name: 'HR Tech Hub - AI & Data Intelligence',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    bannerColor: 'from-emerald-600/20 to-teal-400/20',
    city: 'Hà Nội · Hybrid',
    industry: 'Artificial Intelligence & Big Data',
    openJobsCount: 2,
    rating: 4.9,
    reviewsCount: 190,
    highlight: 'Nghiên cứu và ứng dụng trí tuệ nhân tạo tạo sinh, hệ thống RAG và phân tích dữ liệu lớn.',
    tags: ['PyTorch', 'LLM', 'Spark', 'RAG']
  },
  {
    id: 'hub-cloud',
    name: 'HR Tech Hub - Cloud Platform & DevOps',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
    bannerColor: 'from-red-600/20 to-slate-800/20',
    city: 'Đà Nẵng · Remote',
    industry: 'Cloud Infrastructure & SRE',
    openJobsCount: 1,
    rating: 4.9,
    reviewsCount: 260,
    highlight: 'Quản trị hạ tầng phân tán điện toán đám mây với độ sẵn sàng 99.99% và bảo mật quốc tế.',
    tags: ['AWS Cloud', 'Kubernetes', 'Terraform', 'CI/CD']
  },
  {
    id: 'hub-core',
    name: 'HR Tech Hub - Core Systems & Microservices',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=100&auto=format&fit=crop&q=80',
    bannerColor: 'from-blue-600/20 to-sky-400/20',
    city: 'TP. Hồ Chí Minh · Hà Nội',
    industry: 'High-Concurrency & Microservices',
    openJobsCount: 2,
    rating: 4.8,
    reviewsCount: 420,
    highlight: 'Xây dựng kiến trúc dịch vụ cốt lõi xử lý hàng triệu giao dịch thời gian thực với độ trễ thấp.',
    tags: ['Golang', 'Java Spring', 'Kafka', 'PostgreSQL']
  },
  {
    id: 'hub-web-mobile',
    name: 'HR Tech Hub - Web & Mobile Innovation',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    bannerColor: 'from-orange-500/20 to-red-500/20',
    city: 'TP. Hồ Chí Minh · Đà Nẵng',
    industry: 'Modern Web & Cross-platform Mobile',
    openJobsCount: 3,
    rating: 4.8,
    reviewsCount: 380,
    highlight: 'Kiến tạo trải nghiệm người dùng tốc độ cao trên web hiện đại và ứng dụng di động đa nền tảng.',
    tags: ['React', 'Next.js', 'Flutter', 'TypeScript']
  },
  {
    id: 'hub-qa',
    name: 'HR Tech Hub - Quality & Reliability Engineering',
    logo: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&auto=format&fit=crop&q=80',
    bannerColor: 'from-pink-600/20 to-rose-400/20',
    city: 'TP. Hồ Chí Minh · Remote',
    industry: 'Automated Testing & Reliability',
    openJobsCount: 1,
    rating: 4.7,
    reviewsCount: 310,
    highlight: 'Thiết lập chuẩn mực kiểm thử tự động, độ tin cậy phần mềm và bảo mật toàn diện.',
    tags: ['Playwright', 'Selenium', 'CI/CD', 'Performance']
  },
  {
    id: 'hub-enterprise',
    name: 'HR Tech Hub - Enterprise Digital Services',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    bannerColor: 'from-amber-600/20 to-orange-400/20',
    city: 'TP. Hồ Chí Minh',
    industry: 'Fullstack & Enterprise Solutions',
    openJobsCount: 1,
    rating: 4.8,
    reviewsCount: 250,
    highlight: 'Phát triển các giải pháp số hóa toàn diện phục vụ quản trị nguồn nhân lực và nhân tài.',
    tags: ['React', 'Node.js', 'AWS', 'Microservices']
  }
];

export const IT_SALARY_REPORT_DATA = {
  edition: '2025 - 2026',
  title: 'Báo Cáo Thị Trường IT Việt Nam: Lương & Xu Hướng Tuyển Dụng',
  subtitle: 'Dữ liệu độc quyền khảo sát từ 45,000+ lập trình viên và 1,500+ doanh nghiệp công nghệ',
  keyHighlights: [
    {
      metric: '$1,850',
      label: 'Mức lương IT trung bình',
      trend: '+12.4% so với năm trước'
    },
    {
      metric: '+48%',
      label: 'Gia tăng tuyển dụng AI & Data',
      trend: 'Kỹ năng có nhu cầu cao nhất'
    },
    {
      metric: '68.5%',
      label: 'Doanh nghiệp áp dụng Hybrid',
      trend: 'Mô hình làm việc tiêu chuẩn'
    },
    {
      metric: '$3,800+',
      label: 'Lương trung bình Lead & Architect',
      trend: 'Nhóm nhân sự khan hiếm'
    }
  ],
  salaryBySkill: [
    { skill: 'AI / Machine Learning (LLM)', min: 1800, max: 4500, avg: 3100, trend: '+35%' },
    { skill: 'Cloud & DevOps / SRE', min: 1600, max: 4200, avg: 2900, trend: '+22%' },
    { skill: 'Golang Backend', min: 1500, max: 3800, avg: 2650, trend: '+19%' },
    { skill: 'Java / Spring Boot Microservices', min: 1200, max: 3500, avg: 2350, trend: '+14%' },
    { skill: 'React / Next.js / TypeScript', min: 1100, max: 3200, avg: 2150, trend: '+12%' },
    { skill: 'Mobile (Flutter / React Native)', min: 1000, max: 2800, avg: 1900, trend: '+8%' },
    { skill: 'QA / Automation Test', min: 900, max: 2600, avg: 1750, trend: '+11%' }
  ],
  salaryByExperience: [
    { level: 'Fresher / < 1 năm', range: '450 - 850 USD', demand: 'Trung bình' },
    { level: 'Junior (1 - 3 năm)', range: '850 - 1,500 USD', demand: 'Cao' },
    { level: 'Middle (3 - 5 năm)', range: '1,500 - 2,400 USD', demand: 'Rất cao' },
    { level: 'Senior (5 - 8 năm)', range: '2,400 - 3,800 USD', demand: 'Cực kỳ khan hiếm' },
    { level: 'Lead / Principal / Architect', range: '3,800 - 6,500+ USD', demand: 'Săn đón mạnh' }
  ]
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Lộ trình toàn diện trở thành Senior Software Engineer năm 2026',
    category: 'Sự nghiệp IT',
    readTime: '6 phút đọc',
    publishDate: '14/10/2026',
    summary: 'Từ việc viết code chạy được đến tư duy thiết kế kiến trúc phân tán, tối ưu hiệu năng và kỹ năng giao tiếp chiến lược với stakeholder.',
    views: '12.8k',
    author: 'UpCareer Techtalk Team',
    tag: 'Career Growth'
  },
  {
    id: 'blog-2',
    title: 'So sánh mức lương thực tế lập trình viên tại Hà Nội, TP.HCM và Đà Nẵng',
    category: 'Báo cáo Lương',
    readTime: '8 phút đọc',
    publishDate: '12/10/2026',
    summary: 'Bóc tách chi phí sinh hoạt, mức thuế thu nhập thực tế và sự chênh lệch thu nhập giữa các thị trường công nghệ sôi động nhất Việt Nam.',
    views: '24.5k',
    author: 'Research & Data UpCareer',
    tag: 'IT Salary'
  },
  {
    id: 'blog-3',
    title: 'Top 5 câu hỏi phỏng vấn System Design hóc búa tại các công ty Big Tech',
    category: 'Phỏng vấn IT',
    readTime: '10 phút đọc',
    publishDate: '09/10/2026',
    summary: 'Phân tích cách giải quyết bài toán Rate Limiter phân tán, Chat System thời gian thực với WebSockets và cơ chế xử lý Payment Idempotency.',
    views: '18.2k',
    author: 'Trần Minh Tuấn (Principal Architect)',
    tag: 'System Design'
  },
  {
    id: 'blog-4',
    title: 'Kỹ sư AI và Prompt Engineer: Xu hướng việc làm và nhu cầu thực tế tại VN',
    category: 'Xu hướng Công nghệ',
    readTime: '7 phút đọc',
    publishDate: '05/10/2026',
    summary: 'Khảo sát nhu cầu tuyển dụng các vị trí AI Engineer, ML Ops và giải pháp ứng dụng LLM trong các doanh nghiệp bán lẻ và tài chính.',
    views: '15.1k',
    author: 'Nguyễn Hải Đăng (AI Lead)',
    tag: 'AI & Data'
  }
];
