import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// 1. Mock window.matchMedia: JSDOM thiếu hoàn toàn (undefined)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 2. Mock window.scrollTo: JSDOM có sẵn hàm nhưng log cảnh báo "Not implemented"
window.scrollTo = vi.fn();

// 3. Mock next/navigation for App Router components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));
