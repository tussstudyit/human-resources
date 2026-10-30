import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationModal } from '../ApplicationModal';
import { TopDevJob, TopDevCompany } from '@/types/topdev';
import * as recruitmentApi from '@/lib/api/recruitment';

vi.mock('@/lib/api/recruitment', () => ({
  applyJob: vi.fn(),
}));

const mockCompany: TopDevCompany = {
  id: 'comp-cyberlogitec-123',
  name: 'CyberLogitec Vietnam',
  logo: '/images/companies/cyberlogitec.png',
  logoText: 'CLT',
  city: 'Hồ Chí Minh',
  district: 'Quận 7',
  address: 'Tòa nhà IPC, Quận 7',
  size: '100 - 500 nhân viên',
  industry: 'Logistics IT Solutions',
  country: 'Việt Nam · Hàn Quốc',
  verified: true,
};

const mockJob: TopDevJob = {
  id: 'job-cyberlogitec-123',
  backendJobId: 'backend-uuid-456',
  title: 'Lead System Security Engineer',
  company: mockCompany,
  location: 'Hồ Chí Minh',
  salary: { display: '2,500 - 3,500 USD', currency: 'USD' },
  level: 'Lead / Manager',
  experienceYears: '4+ năm kinh nghiệm',
  skills: ['Linux', 'Kubernetes'],
  postedTime: '2 giờ trước',
  workType: 'Hybrid',
  viewsCount: 150,
  applicantsCount: 7,
  description: ['Chịu trách nhiệm an ninh mạng hệ thống.'],
  requirements: ['Linux, Kubernetes, Docker.'],
  benefits: ['Chế độ đãi ngộ cạnh tranh.'],
  techStackDetails: {
    primary: ['Linux', 'Kubernetes'],
    secondary: ['Docker'],
  },
};

function fillApplicant() {
  fireEvent.change(screen.getByLabelText(/Họ và tên/),{target:{value:'Đoàn Thanh Huy'}});
  fireEvent.change(screen.getByLabelText(/Email liên hệ/),{target:{value:'huy.dev@gmail.com'}});
  fireEvent.change(screen.getByLabelText(/Số điện thoại/),{target:{value:'0912345678'}});
}

describe('ApplicationModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('keeps the draft when returning to the JD and clears it for a different job',()=>{
    const onClose=vi.fn();
    const {rerender}=render(<ApplicationModal job={mockJob} isOpen={true} onClose={onClose}/>);
    fillApplicant();
    fireEvent.click(screen.getByRole('button',{name:'Xem lại mô tả công việc'}));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByLabelText(/Họ và tên/)).toHaveValue('Đoàn Thanh Huy');
    expect(recruitmentApi.applyJob).not.toHaveBeenCalled();
    rerender(<ApplicationModal job={{...mockJob,id:'other-job'}} isOpen={true} onClose={onClose}/>);
    for(const field of screen.getAllByRole('textbox'))expect(field).toHaveValue('');
  });

  it('không render khi isOpen = false', () => {
    const { container } = render(
      <ApplicationModal
        job={mockJob}
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('render thông tin ứng tuyển và trường nhập liệu khi isOpen = true', () => {
    render(
      <ApplicationModal
        job={mockJob}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Ứng tuyển vị trí này')).toBeInTheDocument();
    expect(screen.getByText('Lead System Security Engineer')).toBeInTheDocument();
    expect(screen.getByText(/CyberLogitec Vietnam/i)).toBeInTheDocument();
    for (const field of screen.getAllByRole('textbox')) expect(field).toHaveValue('');
    expect(screen.getByRole('region', {name:'Biểu mẫu ứng tuyển'})).not.toHaveClass('fixed');
    expect(screen.getByText('Đính kèm hồ sơ CV')).toBeInTheDocument();
  });

  it('báo lỗi khi không đính kèm file CV hoặc định dạng không phải PDF', async () => {
    render(
      <ApplicationModal
        job={mockJob}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    fillApplicant();
    // Thử submit form khi chưa upload file
    const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ ứng tuyển/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Vui lòng đính kèm file CV định dạng PDF/i)).toBeInTheDocument();

    // Thử upload file không phải PDF (ví dụ .docx)
    const invalidFile = new File(['mock content'], 'my_cv.docx', { type: 'application/msword' });
    const fileInput = screen.getByLabelText(/Tải lên tệp CV PDF/i);
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByText(/Vui lòng chọn file CV định dạng PDF để AI Agent có thể phân tích chính xác/i)).toBeInTheDocument();
  });

  it('gọi API applyJob thành công và hiển thị màn hình xác nhận', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.mocked(recruitmentApi.applyJob).mockResolvedValueOnce({
      success: true,
      id: 'app-success-789',
    });

    render(
      <ApplicationModal
        job={mockJob}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    fillApplicant();
    // Upload file PDF hợp lệ bằng userEvent.upload
    const validPdf = new File(['%PDF-1.4 mock content'], 'CV_DoanThanhHuy.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText(/Tải lên tệp CV PDF/i), validPdf);

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ ứng tuyển/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(recruitmentApi.applyJob).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: 'backend-uuid-456',
          name: 'Đoàn Thanh Huy',
          email: 'huy.dev@gmail.com',
          phone: '0912345678',
          file_cv: validPdf,
        })
      );
      expect(handleSuccess).toHaveBeenCalledWith(
        'Đoàn Thanh Huy',
        'Lead System Security Engineer',
        expect.stringContaining('APP-')
      );
      expect(screen.getByText('Nộp Hồ Sơ Ứng Tuyển Thành Công!')).toBeInTheDocument();
    });

    // Bấm nút Đóng trên màn hình thành công
    const closeBtn = screen.getByRole('button', { name: /Hoàn tất & Quay lại xem việc làm/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
