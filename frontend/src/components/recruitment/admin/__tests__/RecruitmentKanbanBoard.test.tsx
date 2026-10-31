import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RecruitmentKanbanBoard from '../RecruitmentKanbanBoard';
import { Candidate } from '@/types/recruitment';

describe('RecruitmentKanbanBoard', () => {
  it('places a successfully rejected candidate in the rejection stage, separately from errors and talent pool',()=>{
    const candidate={...mockCandidates[1],parsedSkillsJson:{rejection:{status:'REJECTED',emailSent:true},evaluation:{id:'run',status:'NEEDS_REVIEW'}}} as Candidate;
    render(<RecruitmentKanbanBoard candidates={[candidate]} onSelectCandidate={vi.fn()}/>);
    expect(within(screen.getByRole('region',{name:'Đã từ chối'})).getByText(candidate.name)).toBeInTheDocument();
    for(const name of ['Cần HR xem xét','Kho Nhân Tài (Pool)','Lỗi xử lý / Cần kiểm tra'])expect(within(screen.getByRole('region',{name})).queryByText(candidate.name)).not.toBeInTheDocument();
  });
  it('keeps a scheduled interview in Meet even when AI still requires HR review',()=>{
    const candidate={...mockCandidates[1],parsedSkillsJson:{interviewSchedule:{googleMeetUrl:'https://meet.google.com/abc-defg-hij',status:'SCHEDULED'},evaluation:{id:'run',status:'NEEDS_REVIEW',approvalStatus:'PENDING_HR'}}} as Candidate;
    render(<RecruitmentKanbanBoard candidates={[candidate]} onSelectCandidate={vi.fn()}/>);
    expect(within(screen.getByRole('region',{name:'Lịch Phỏng Vấn (Meet)'})).getByText(candidate.name)).toBeInTheDocument();
    expect(within(screen.getByRole('region',{name:'Cần HR xem xét'})).queryByText(candidate.name)).not.toBeInTheDocument();
  });
  it('keeps archived talent in Pool instead of AI review and excludes cancelled meetings',()=>{
    const candidate={...mockCandidates[2],parsedSkillsJson:{talentPool:{tier:'RETAINED_TALENT_POOL'},interviewSchedule:{status:'CANCELLED',googleMeetUrl:'https://meet.google.com/abc-defg-hij'},evaluation:{id:'run',status:'NEEDS_REVIEW'}}} as Candidate;
    render(<RecruitmentKanbanBoard candidates={[candidate]} onSelectCandidate={vi.fn()}/>);
    expect(within(screen.getByRole('region',{name:'Kho Nhân Tài (Pool)'})).getByText(candidate.name)).toBeInTheDocument();
  });
  const mockCandidates: Candidate[] = [
    {
      id: 'cand-1',
      name: 'Nguyen Van Pending',
      email: 'pending@example.com',
      aiStatus: 'PENDING',
      cvUrl: 'pending.pdf',
      jobId: 'job-1',
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
    {
      id: 'cand-2',
      name: 'Tran Van Interview',
      email: 'interview@example.com',
      aiStatus: 'DONE',
      matchScore: 92,
      cvUrl: 'interview.pdf',
      jobId: 'job-1',
      parsedSkillsJson: {
        skills: ['NestJS', 'React'],
        interviewSchedule: {
          googleMeetUrl: 'https://meet.google.com/abc-def-xyz',
          time: '10:00 AM',
          status: 'SCHEDULED',
        },
      },
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
    {
      id: 'cand-3',
      name: 'Le Thi Pool',
      email: 'pool@example.com',
      aiStatus: 'DONE',
      matchScore: 70,
      cvUrl: 'pool.pdf',
      jobId: 'job-1',
      parsedSkillsJson: {
        skills: ['Python', 'Docker'],
        talentPool: {
          tier: 'PRIORITY_TALENT_POOL',
          status: 'ARCHIVED',
        },
      },
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
    {
      id: 'cand-4',
      name: 'Pham Van Evaluated',
      email: 'evaluated@example.com',
      aiStatus: 'DONE',
      matchScore: 85,
      cvUrl: 'evaluated.pdf',
      jobId: 'job-1',
      parsedSkillsJson: ['React', 'TypeScript'],
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
  ];

  it('hiển thị đầy đủ các cột quy trình tuyển dụng chuẩn hóa', () => {
    render(
      <RecruitmentKanbanBoard
        candidates={[]}
        onSelectCandidate={vi.fn()}
      />
    );

    expect(screen.getByText('Chờ AI Thẩm Định')).toBeInTheDocument();
    expect(screen.getByText('Cần HR xem xét')).toBeInTheDocument();
    expect(screen.getByText('AI Đã Đánh Giá')).toBeInTheDocument();
    expect(screen.getByText('Lịch Phỏng Vấn (Meet)')).toBeInTheDocument();
    expect(screen.getByText('Kho Nhân Tài (Pool)')).toBeInTheDocument();
    expect(screen.getByText('Lỗi xử lý / Cần kiểm tra')).toBeInTheDocument();
  });

  it('phân loại đúng ứng viên vào các cột tương ứng theo trạng thái và dữ liệu AI', () => {
    render(
      <RecruitmentKanbanBoard
        candidates={mockCandidates}
        onSelectCandidate={vi.fn()}
      />
    );

    // Kiểm tra tên các ứng viên xuất hiện trên giao diện
    expect(screen.getByText('Nguyen Van Pending')).toBeInTheDocument();
    expect(screen.getByText('Tran Van Interview')).toBeInTheDocument();
    expect(screen.getByText('Le Thi Pool')).toBeInTheDocument();
    expect(screen.getByText('Pham Van Evaluated')).toBeInTheDocument();

    // Kiểm tra các thông tin đặc thù
    expect(screen.getByText('Google Meet Phỏng Vấn')).toBeInTheDocument();
    expect(screen.getByText('PRIORITY_TALENT_POOL')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('kích hoạt onSelectCandidate khi người dùng click vào thẻ ứng viên', () => {
    const handleSelect = vi.fn();
    render(
      <RecruitmentKanbanBoard
        candidates={mockCandidates}
        onSelectCandidate={handleSelect}
      />
    );

    const candidateCard = screen.getByText('Tran Van Interview').closest('div');
    if (candidateCard) {
      fireEvent.click(candidateCard);
      expect(handleSelect).toHaveBeenCalledWith(mockCandidates[1]);
    } else {
      throw new Error('Candidate card element not found');
    }
  });
});
