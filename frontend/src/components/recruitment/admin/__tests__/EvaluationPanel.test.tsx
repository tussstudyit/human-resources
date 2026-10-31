import { render,screen,fireEvent,waitFor } from '@testing-library/react';
import { describe,it,expect,vi,beforeEach } from 'vitest';
import EvaluationPanel from '../EvaluationPanel';
import { approveEvaluation,approveJobRubric,getEvaluationHistory,getJobRubric } from '@/lib/api/recruitment';
import type { Candidate } from '@/types/recruitment';
vi.mock('@/lib/api/recruitment',()=>({approveEvaluation:vi.fn(),approveJobRubric:vi.fn(),getEvaluationHistory:vi.fn(),getJobRubric:vi.fn()}));
vi.mock('@/store/useAuthStore',()=>({useAuthStore:(select:(s:unknown)=>unknown)=>select({user:{role:'HR'}})}));
const candidate={id:'synthetic',jobId:'job',updatedAt:'2026-10-30'} as Candidate;
beforeEach(()=>{
  vi.clearAllMocks();
  vi.mocked(getJobRubric).mockResolvedValue({suggestedSkills:['Node.js'],defaultWeights:{skills:40,projects:30,production:20,discipline:10},approved:null});
  vi.mocked(getEvaluationHistory).mockResolvedValue([]);
});
describe('Evidence review panel',()=>{
 it('shows automatic rubric and allows optional editing without a pre-scoring approval gate',async()=>{
  vi.mocked(getJobRubric).mockResolvedValue({suggestedSkills:['Flutter'],defaultWeights:{skills:40,projects:30,production:20,discipline:10},approved:null,active:{id:'automatic',requiredSkills:['Flutter','Dart'],weights:{skills:40,projects:30,production:20,discipline:10},approvedAt:null},source:'AUTOMATIC'});
  render(<EvaluationPanel candidate={candidate}/>);
  await screen.findByText('Rubric vị trí: tự động từ JD');
  expect(screen.getByDisplayValue('Flutter, Dart')).toBeInTheDocument();
  expect(screen.getByText(/CV được chấm tự động, không cần duyệt rubric trước/)).toBeInTheDocument();
  expect(screen.queryByText('Duyệt rubric phiên bản mới')).not.toBeInTheDocument();
 });
 it('explains rate limiting without offering approval for an unscored run',async()=>{
  vi.mocked(getEvaluationHistory).mockResolvedValue([{id:'evaluation',status:'NEEDS_REVIEW',errorCode:'AI_RATE_LIMITED',createdAt:'2026-10-30',events:[],report:{matchScore:null,approvalStatus:'PENDING_HR',reviewReasons:['AI_RATE_LIMITED']}}]);
  render(<EvaluationPanel candidate={candidate}/>);
  await screen.findByText(/Dịch vụ AI đang giới hạn yêu cầu/);
  expect(screen.queryByText('Duyệt kết quả sau khi xem bằng chứng')).not.toBeInTheDocument();
 });
 it('explains missing history and prevents approving an empty rubric',async()=>{
  render(<EvaluationPanel candidate={candidate}/>);
  await screen.findByDisplayValue('Node.js');
  fireEvent.change(screen.getByLabelText('Kỹ năng yêu cầu, phân cách bằng dấu phẩy'),{target:{value:''}});
  fireEvent.click(screen.getByText('Lưu rubric điều chỉnh'));
  expect(screen.getByRole('alert')).toHaveTextContent('ít nhất một kỹ năng');expect(approveJobRubric).not.toHaveBeenCalled();
 });
 it('shows document evidence and explicitly approves the selected evaluation',async()=>{
  vi.mocked(getEvaluationHistory).mockResolvedValue([{id:'evaluation',status:'NEEDS_REVIEW',createdAt:'2026-10-30',events:[],report:{matchScore:40,approvalStatus:'PENDING_HR',reviewReasons:['NEAR_DECISION_THRESHOLD'],criteria:[{id:'skills',points:40,weight:40,level:4,rule:'ratio',evidence:[{quote:'Developed NodeJS application.',segmentId:'s1'}]}]}}]);
  vi.mocked(approveEvaluation).mockResolvedValue({success:true});const onApproved=vi.fn();
  render(<EvaluationPanel candidate={candidate} onApproved={onApproved}/>);
  await screen.findByText('Duyệt kết quả sau khi xem bằng chứng');
  expect(screen.getByText(/Developed NodeJS application/)).toBeInTheDocument();
  fireEvent.click(screen.getByText('Duyệt kết quả sau khi xem bằng chứng'));
  await waitFor(()=>expect(approveEvaluation).toHaveBeenCalledWith('evaluation'));
  await waitFor(()=>expect(onApproved).toHaveBeenCalledWith('evaluation'));
 });
 it('does not offer approval for a failed, unscored document',async()=>{
  vi.mocked(getEvaluationHistory).mockResolvedValue([{id:'evaluation',status:'FAILED',errorCode:'PROCESSING_TIMEOUT',createdAt:'2026-10-30',events:[],report:{matchScore:null,approvalStatus:'PENDING_HR'}}]);
  render(<EvaluationPanel candidate={candidate}/>);
  await screen.findByText('Trạng thái: Lỗi xử lý');expect(screen.queryByText('Duyệt kết quả sau khi xem bằng chứng')).not.toBeInTheDocument();
 });
});
