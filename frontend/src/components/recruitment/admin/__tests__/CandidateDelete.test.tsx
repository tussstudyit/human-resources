import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import CandidateDetailModal from '../CandidateDetailModal';
import { deleteCandidate, fetchCandidateCvBlob } from '@/lib/api/recruitment';
import type { Candidate } from '@/types/recruitment';
const {showToast, auth}=vi.hoisted(()=>({showToast:vi.fn(),auth:{role:'HR'}}));
vi.mock('@/store/useAuthStore',()=>({useAuthStore:(select:(s:unknown)=>unknown)=>select({user:auth})}));
vi.mock('@/store/useToastStore',()=>({useToastStore:()=>({showToast})}));
vi.mock('@/lib/api/recruitment',()=>({fetchCandidateCvBlob:vi.fn(),deleteCandidate:vi.fn(),getEvaluationHistory:vi.fn(),getJobCandidates:vi.fn(),reEvaluateCandidate:vi.fn(),scheduleCandidateInterview:vi.fn(),archiveCandidateTalentPool:vi.fn()}));
vi.mock('../EvaluationPanel',()=>({default:()=>null}));
const candidate={id:'test',name:'TEST Candidate',email:'test@example.invalid',aiStatus:'DONE',jobId:'job',cvUrl:'test.pdf',parsedSkillsJson:{}} as Candidate;
beforeEach(()=>{vi.clearAllMocks();auth.role='HR';vi.mocked(fetchCandidateCvBlob).mockReturnValue(new Promise(()=>{}));});
it('requires confirmation, then removes exactly the selected candidate from the UI',async()=>{
 const onClose=vi.fn(),onCandidateDeleted=vi.fn();const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);
 vi.mocked(deleteCandidate).mockResolvedValue({success:true,id:'test',fileCleanupPending:false});
 render(<CandidateDetailModal candidate={candidate} onClose={onClose} onCandidateDeleted={onCandidateDeleted}/>);
 fireEvent.click(screen.getByRole('button',{name:'Xóa hồ sơ'}));expect(deleteCandidate).not.toHaveBeenCalled();
 confirm.mockReturnValue(true);fireEvent.click(screen.getByRole('button',{name:'Xóa hồ sơ'}));
 await waitFor(()=>expect(deleteCandidate).toHaveBeenCalledWith('test'));
 await waitFor(()=>expect(onCandidateDeleted).toHaveBeenCalledWith('test'));expect(onClose).toHaveBeenCalled();confirm.mockRestore();
});
it('keeps the record visible on a conflict and shows the server reason',async()=>{
 const confirm=vi.spyOn(window,'confirm').mockReturnValue(true),deleted=vi.fn();
 vi.mocked(deleteCandidate).mockRejectedValue({response:{data:{message:'Đang xử lý workflow'}}});
 render(<CandidateDetailModal candidate={candidate} onClose={vi.fn()} onCandidateDeleted={deleted}/>);
 fireEvent.click(screen.getByRole('button',{name:'Xóa hồ sơ'}));
 await waitFor(()=>expect(showToast).toHaveBeenCalledWith(expect.objectContaining({type:'error',message:'Đang xử lý workflow'})));
 expect(deleted).not.toHaveBeenCalled();confirm.mockRestore();
});
it('does not offer deletion to an employee, or while AI is processing',()=>{
 auth.role='EMPLOYEE';const {rerender}=render(<CandidateDetailModal candidate={candidate} onClose={vi.fn()}/>);
 expect(screen.queryByRole('button',{name:'Xóa hồ sơ'})).not.toBeInTheDocument();
 auth.role='HR';rerender(<CandidateDetailModal candidate={{...candidate,aiStatus:'PENDING'}} onClose={vi.fn()}/>);
 expect(screen.getByRole('button',{name:'Xóa hồ sơ'})).toBeDisabled();
});
