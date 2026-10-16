import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopDevJobDetailView } from '../TopDevJobDetailView';
import { TopDevJob, TopDevCompany } from '@/types/topdev';

const mockCompany: TopDevCompany = {
  id: 'comp-cyberlogitec-123',
  name: 'CyberLogitec Vietnam',
  logo: '/images/companies/cyberlogitec.png',
  logoText: 'CLT',
  city: 'Hồ Chí Minh',
  district: 'Quận 7',
  address: 'Tòa nhà IPC, Quận 7',
  size: '100 - 500 nhân viên',
  industry: 'Logistics IT & Maritime Solutions',
  country: 'Việt Nam · Hàn Quốc',
  bannerImage: '/images/cyberlogitec_workshop.jpg',
  verified: true,
};

const mockJob: TopDevJob = {
  id: 'test-job-1',
  title: 'Lead System Security Engineer',
  company: mockCompany,
  location: 'Hồ Chí Minh (Quận 7)',
  salary: {
    display: '2,500 - 3,500 USD',
    min: 2500,
    max: 3500,
    currency: 'USD',
  },
  level: 'Lead / Manager',
  experienceYears: '4+ năm kinh nghiệm',
  skills: ['Linux', 'Kubernetes', 'Security', 'Docker'],
  postedTime: '2 giờ trước',
  urgent: true,
  workType: 'Hybrid',
  viewsCount: 200,
  applicantsCount: 7,
  remainingDays: 12,
  description: [
    'Chịu trách nhiệm thiết kế và triển khai kiến trúc bảo mật hệ thống thông tin.',
    'Giám sát an ninh mạng SIEM/SOC, kiểm thử thâm nhập và quét lỗ hổng bảo mật định kỳ.',
  ],
  responsibilities: [
    'Chịu trách nhiệm thiết kế và triển khai kiến trúc bảo mật hệ thống thông tin.',
    'Giám sát an ninh mạng SIEM/SOC, kiểm thử thâm nhập và quét lỗ hổng bảo mật định kỳ.',
  ],
  requirements: [
    'Tối thiểu 4 năm kinh nghiệm làm việc trong lĩnh vực bảo mật hạ tầng mạng hoặc DevSecOps.',
  ],
  skillsAndQualifications: [
    {
      category: 'Kinh nghiệm & Nền tảng chuyên môn',
      items: [
        'Tối thiểu 4 năm kinh nghiệm làm việc trong lĩnh vực bảo mật hạ tầng mạng hoặc DevSecOps.',
      ],
    },
    {
      category: 'Kỹ năng công nghệ & Công cụ cốt lõi',
      items: ['Thành thạo công nghệ và nền tảng: Linux, Kubernetes, Docker, Security.'],
    },
  ],
  benefits: [
    'Mức lương cạnh tranh, xét tăng lương 2 lần/năm.',
    'Thưởng tháng 13 + thưởng hiệu quả kinh doanh dự án.',
  ],
  techStackDetails: {
    primary: ['Linux', 'Kubernetes'],
    secondary: ['Docker', 'Security'],
  },
};

const mockRelatedJobs: TopDevJob[] = [
  {
    id: 'test-job-2',
    title: 'Senior DevOps Specialist',
    company: mockCompany,
    location: 'Hồ Chí Minh',
    salary: { display: '2,000 - 3,000 USD', currency: 'USD' },
    level: 'Senior',
    experienceYears: '3+ năm',
    skills: ['CI/CD', 'AWS'],
    postedTime: '1 ngày trước',
    workType: 'Hybrid',
    viewsCount: 180,
    applicantsCount: 4,
    description: ['Vận hành hệ thống CI/CD.'],
    requirements: ['AWS, Terraform, CI/CD.'],
    benefits: ['Lương tháng 13.'],
    techStackDetails: {
      primary: ['CI/CD', 'AWS'],
      secondary: ['Terraform'],
    },
  },
];

describe('TopDevJobDetailView Component', () => {
  it('render đầy đủ thông tin chi tiết việc làm chuẩn TopDev', () => {
    const handleApply = vi.fn();
    const handleBack = vi.fn();

    render(
      <TopDevJobDetailView
        job={mockJob}
        allJobs={[mockJob, ...mockRelatedJobs]}
        onApplyClick={handleApply}
        onBack={handleBack}
      />
    );

    // Tiêu đề và mức lương
    expect(screen.getAllByText('Lead System Security Engineer').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2,500 - 3,500 USD')).toBeInTheDocument();
    expect(screen.getAllByText('CyberLogitec Vietnam').length).toBeGreaterThanOrEqual(1);

    // Banner hạn nộp hồ sơ màu hồng chuẩn TopDev
    expect(screen.getByText(/Hạn nộp hồ sơ sắp kết thúc trong/i)).toBeInTheDocument();
    expect(screen.getAllByText(/12 ngày/i).length).toBeGreaterThanOrEqual(1);

    // Các mục nội dung JD
    expect(screen.getByText('Mô tả công việc')).toBeInTheDocument();
    expect(screen.getByText('Yêu cầu ứng viên')).toBeInTheDocument();
    expect(screen.getByText('Quyền lợi dành cho bạn')).toBeInTheDocument();

    // Thông tin công ty & việc làm liên quan bên cột phải
    expect(screen.getByText('100 - 500 nhân viên')).toBeInTheDocument();
    expect(screen.getByText('Senior DevOps Specialist')).toBeInTheDocument();
  });

  it('gọi onApplyClick khi bấm nút Ứng tuyển ngay', () => {
    const handleApply = vi.fn();

    render(
      <TopDevJobDetailView
        job={mockJob}
        allJobs={[mockJob]}
        onApplyClick={handleApply}
      />
    );

    const applyButtons = screen.getAllByRole('button', { name: /Ứng tuyển ngay/i });
    fireEvent.click(applyButtons[0]);

    expect(handleApply).toHaveBeenCalledTimes(1);
  });

  it('gọi onBack khi bấm nút Quay lại danh sách việc làm', () => {
    const handleBack = vi.fn();

    render(
      <TopDevJobDetailView
        job={mockJob}
        allJobs={[mockJob]}
        onApplyClick={vi.fn()}
        onBack={handleBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /Quay lại danh sách việc làm/i });
    fireEvent.click(backButton);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('gọi onSelectRelatedJob khi bấm vào việc làm cùng công ty', () => {
    const handleSelectRelated = vi.fn();

    render(
      <TopDevJobDetailView
        job={mockJob}
        allJobs={[mockJob, ...mockRelatedJobs]}
        onApplyClick={vi.fn()}
        onSelectRelatedJob={handleSelectRelated}
      />
    );

    const relatedJobCard = screen.getByText('Senior DevOps Specialist');
    fireEvent.click(relatedJobCard);

    expect(handleSelectRelated).toHaveBeenCalledWith(mockRelatedJobs[0]);
  });
});
