import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '../page';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('DashboardPage - Chức Năng Bảng Điều Khiển Quản Lý', () => {
  const mockUser = {
    id: 'user-1',
    fullName: 'HR Director',
    email: 'hr@company.com',
    role: 'HR' as const,
    isActive: true,
    department: {
      id: 'dept-1',
      name: 'Phòng Nhân sự',
    },
  };

  const mockDepartments = [
    {
      id: 'dept-1',
      name: 'Phòng Nhân sự',
      description: 'Quản trị nhân lực, tuyển dụng và đào tạo',
      _count: { users: 5 },
    },
    {
      id: 'dept-2',
      name: 'Phòng Kỹ thuật & AI',
      description: 'Nghiên cứu và phát triển phần mềm AI',
      _count: { users: 12 },
    },
  ];

  const mockEmployees = [
    {
      id: 'emp-1',
      fullName: 'HR Director',
      email: 'hr@company.com',
      role: 'HR',
      isActive: true,
      createdAt: '2026-10-01T00:00:00.000Z',
      department: { id: 'dept-1', name: 'Phòng Nhân sự' },
    },
    {
      id: 'emp-2',
      fullName: 'Tran Van Hoang',
      email: 'hoang.tran@company.com',
      role: 'EMPLOYEE',
      isActive: true,
      createdAt: '2026-10-02T00:00:00.000Z',
      department: { id: 'dept-2', name: 'Phòng Kỹ thuật & AI' },
    },
    {
      id: 'emp-3',
      fullName: 'Le Thi Mai',
      email: 'mai.le@company.com',
      role: 'MANAGER',
      isActive: true,
      createdAt: '2026-10-03T00:00:00.000Z',
      department: { id: 'dept-2', name: 'Phòng Kỹ thuật & AI' },
    },
  ];

  const mockRecruitmentStats = {
    totalJobs: 1,
    openJobs: 1,
    totalCandidates: 6,
    avgMatchScore: 74.8,
    pipeline: {
      pending: 0,
      evaluated: 3,
      interview: 0,
      talentPool: 3,
      rejected: 0,
    },
    recentEvaluations: [
      {
        id: 'c-1',
        name: 'Elliot Alderson',
        email: 'elliot@example.com',
        jobId: 'job-1',
        jobTitle: 'Senior Software Engineer',
        matchScore: 95,
        aiStatus: 'DONE' as const,
        stage: 'EVALUATED' as const,
        skills: ['Python', 'Cybersecurity'],
        updatedAt: '2026-10-09T15:00:00.000Z',
      },
    ],
    agents: [
      {
        id: 'recruitment',
        name: 'AI Recruitment Agent',
        roleTag: 'Cốt lõi',
        status: 'ONLINE' as const,
        isLive: true,
        summary: 'Phân tích CV...',
        workflows: ['WF_04'],
        tasksProcessedCount: 6,
        tasksProcessedLabel: '6 hồ sơ đã tiếp nhận',
        lastActive: '2026-10-09T15:00:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/departments') {
        return { data: mockDepartments };
      }
      if (url === '/auth/users') {
        return { data: mockEmployees };
      }
      if (url === '/recruitment/stats') {
        return { data: mockRecruitmentStats };
      }
      return { data: [] };
    });
  });

  it('1. Hiển thị màn hình chờ VERIFYING_PERMISSIONS khi chưa khởi tạo phiên (isInitialized = false)', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      initAuth: vi.fn(),
      token: null,
      isLoading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('VERIFYING_PERMISSIONS...')).toBeInTheDocument();
  });

  it('2. Tự động điều hướng về /login khi đã kiểm tra nhưng chưa đăng nhập', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      initAuth: vi.fn(),
      token: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('3. Hiển thị Banner chào mừng và thông tin người dùng đăng nhập chính xác', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      initAuth: vi.fn(),
      token: 'valid-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText('Xin chào, HR Director!')).toBeInTheDocument();
    expect(screen.getByText('Phòng Nhân sự')).toBeInTheDocument();
    expect(screen.getAllByText('HR Director').length).toBeGreaterThan(0);
  });

  it('4. Nạp và hiển thị các số liệu thống kê (Metrics Cards)', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      initAuth: vi.fn(),
      token: 'valid-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      // 3 nhân sự
      expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
      // 2 phòng ban
      expect(screen.getByText('2')).toBeInTheDocument();
      // 5 Agents
      expect(screen.getByText('5 Agents')).toBeInTheDocument();
    });
  });

  it('5. Hiển thị thông tin các AI Agents và liên kết đến (/recruitment)', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      initAuth: vi.fn(),
      token: 'valid-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getAllByText('AI Recruitment Agent').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('AI Onboarding Agent').length).toBeGreaterThanOrEqual(1);

    const recruitmentLinks = screen.getAllByRole('link', { name: /AI Recruitment Agent/i });
    expect(recruitmentLinks.length).toBeGreaterThan(0);
    expect(recruitmentLinks[0]).toHaveAttribute('href', '/recruitment');
  });

  it('6. Lọc danh sách nhân viên theo ô tìm kiếm (Search Filter)', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      initAuth: vi.fn(),
      token: 'valid-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Tran Van Hoang')).toBeInTheDocument();
      expect(screen.getByText('Le Thi Mai')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Tìm nhân viên theo tên, email...');
    fireEvent.change(searchInput, { target: { value: 'hoang' } });

    expect(screen.getByText('Tran Van Hoang')).toBeInTheDocument();
    expect(screen.queryByText('Le Thi Mai')).not.toBeInTheDocument();
  });

  it('7. Hiển thị trạng thái Không tìm thấy nhân sự khi từ khóa tìm kiếm không khớp', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      initAuth: vi.fn(),
      token: 'valid-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Tran Van Hoang')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Tìm nhân viên theo tên, email...');
    fireEvent.change(searchInput, { target: { value: 'khong_ton_tai_123456' } });

    expect(screen.getByText('Không tìm thấy nhân sự')).toBeInTheDocument();
  });

  it('8. Hiển thị đầy đủ danh sách các phòng ban với số lượng nhân sự', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      initAuth: vi.fn(),
      token: 'valid-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('2 PHÒNG BAN')).toBeInTheDocument();
      expect(screen.getByText('Quản trị nhân lực, tuyển dụng và đào tạo')).toBeInTheDocument();
      expect(screen.getByText('Nghiên cứu và phát triển phần mềm AI')).toBeInTheDocument();
      expect(screen.getByText('5 người')).toBeInTheDocument();
      expect(screen.getByText('12 người')).toBeInTheDocument();
    });
  });

  it('9. Hiển thị số liệu phễu tuyển dụng động và hoạt động n8n đồng bộ', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      initAuth: vi.fn(),
      token: 'valid-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Phễu Tuyển Dụng & Sàng Lọc AI (5 Giai đoạn Đồng Bộ)')).toBeInTheDocument();
      expect(screen.getByText('Elliot Alderson')).toBeInTheDocument();
      expect(screen.getByText('95% Phù hợp')).toBeInTheDocument();
      expect(screen.getByText('6 hồ sơ đã tiếp nhận')).toBeInTheDocument();
    });
  });
});
