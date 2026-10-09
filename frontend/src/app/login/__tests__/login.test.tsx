import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../page';
import { useAuthStore } from '@/store/useAuthStore';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('LoginPage - Xác Thực Người Dùng Chuẩn UI/UX Pro Max', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();
  const mockInitAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      initAuth: mockInitAuth,
      clearError: mockClearError,
    });
  });

  it('1. Hiển thị đầy đủ thông tin Brand, Telemetry và Form Đăng Nhập chuẩn (Không có tài khoản mẫu)', () => {
    render(<LoginPage />);

    expect(screen.getByText('HR Platform')).toBeInTheDocument();
    expect(screen.getByText('// AUTHENTICATION_GATEWAY')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Đăng nhập hệ thống' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ten.ban@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập vào Hệ thống/i })).toBeInTheDocument();

    // Đảm bảo không còn nút tài khoản mẫu
    expect(screen.queryByText(/TÀI_KHOẢN_MẪU/i)).not.toBeInTheDocument();
    expect(screen.queryByText('HR Director')).not.toBeInTheDocument();
    expect(screen.queryByText('HR Manager')).not.toBeInTheDocument();
  });

  it('2. Nút xem mật khẩu (Eye Toggle) thay đổi input type từ password sang text', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByLabelText('Hiện mật khẩu');
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe('text');

    const hideBtn = screen.getByLabelText('Ẩn mật khẩu');
    fireEvent.click(hideBtn);

    expect(passwordInput.type).toBe('password');
  });

  it('3. Submit form gọi hàm login với email và password chính xác', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('ten.ban@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập vào Hệ thống/i });

    fireEvent.change(emailInput, { target: { value: 'hr@company.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('hr@company.com', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/recruitment');
    });
  });

  it('4. Hiển thị thông báo lỗi và cho phép người dùng đóng lỗi', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
      error: 'Email hoặc mật khẩu không chính xác',
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      initAuth: mockInitAuth,
      clearError: mockClearError,
    });

    render(<LoginPage />);

    expect(screen.getByText('Email hoặc mật khẩu không chính xác')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Đóng thông báo');
    fireEvent.click(closeBtn);

    expect(mockClearError).toHaveBeenCalled();
  });

  it('5. Hiển thị liên kết sang Cổng Tuyển Dụng Công Khai (/careers)', () => {
    render(<LoginPage />);

    const careersLink = screen.getByRole('link', { name: /Xem việc làm/i });
    expect(careersLink).toBeInTheDocument();
    expect(careersLink).toHaveAttribute('href', '/careers');
  });
});
