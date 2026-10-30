'use client';

import { useEffect, useState } from 'react';
import { Candidate, EvaluationHistory } from '@/types/recruitment';
import { approveEvaluation, approveJobRubric, getEvaluationHistory, getJobRubric } from '@/lib/api/recruitment';
import { useAuthStore } from '@/store/useAuthStore';

const labels: Record<string,string> = {skills:'Kỹ năng phù hợp JD',projects:'Dự án và giải quyết vấn đề',production:'Production và quy mô',discipline:'Kỷ luật kỹ thuật'};
const reasons: Record<string,string> = {
  RUBRIC_APPROVAL_REQUIRED:'Cần HR duyệt rubric của vị trí, sau đó bấm Chấm lại.',
  DOCUMENT_UNREADABLE_OR_OCR_REQUIRED:'Không đọc được văn bản PDF. Cần bản CV có chữ hoặc HR đọc thủ công.',
  UNSUPPORTED_OR_DUPLICATE_EVIDENCE:'Có bằng chứng không khớp hoặc bị lặp.',
  NO_VERIFIED_EVIDENCE:'Chưa có bằng chứng hợp lệ để chấm.',
  EMPLOYMENT_DATES_UNVERIFIED:'Chưa xác minh được mốc thời gian kinh nghiệm.',
  AI_REPORTED_MISSING_INFORMATION:'Hồ sơ thiếu thông tin cần xem xét.',
  NEAR_DECISION_THRESHOLD:'Điểm gần ngưỡng phân loại, cần người đánh giá.',
  POSSIBLE_PROMPT_INJECTION:'Tài liệu có nội dung chỉ dẫn bất thường.',
  JD_CHANGED_DURING_EVALUATION:'JD đã đổi trong lúc chấm. Cần đánh giá lại.',
  PROCESSING_TIMEOUT:'Quá thời gian xử lý. Kiểm tra dịch vụ rồi chấm lại.',
};
export default function EvaluationPanel({candidate,onApproved,refreshKey=0}:{candidate:Candidate;onApproved?:(id:string)=>void;refreshKey?:number}) {
  const isHr=useAuthStore(s=>s.user?.role==='HR');
  const [history,setHistory]=useState<EvaluationHistory[]>([]);
  const [rubric,setRubric]=useState<Awaited<ReturnType<typeof getJobRubric>>|null>(null);
  const [skills,setSkills]=useState('');
  const [weights,setWeights]=useState<Record<string,number>>({skills:40,projects:30,production:20,discipline:10});
  const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    let active=true;setError('');
    Promise.all([getEvaluationHistory(candidate.id),getJobRubric(candidate.jobId)]).then(([runs,config])=>{
      if(!active)return;setHistory(runs);setRubric(config);
      setSkills((config.approved?.requiredSkills||config.suggestedSkills).join(', '));
      setWeights(config.approved?.weights||config.defaultWeights);
    }).catch(()=>{if(active)setError('Không tải được lịch sử/rubric. Vui lòng thử lại.');});
    return ()=>{active=false;};
  },[candidate.id,candidate.jobId,candidate.updatedAt,revision,refreshKey]);
  const latest=history[0];
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  async function approveRubric() {
    setError('');setMessage('');
    const required=skills.split(',').map(s=>s.trim()).filter(Boolean);
    if(!required.length||total!==100||Object.values(weights).some(n=>!Number.isFinite(n)||n<0||n>100)){
      setError('Nhập ít nhất một kỹ năng và tổng trọng số bằng 100.');return;
    }
    setBusy(true);
    try{await approveJobRubric(candidate.jobId,required,weights);setMessage('Đã lưu rubric được duyệt. Bấm Chấm lại để áp dụng cho hồ sơ này.');setRevision(x=>x+1);}
    catch{setError('Không lưu được rubric. Kiểm tra quyền HR và thử lại.');}finally{setBusy(false);}
  }
  async function approveResult() {
    if(!latest)return;setBusy(true);setError('');
    try{await approveEvaluation(latest.id);onApproved?.(latest.id);setMessage('Đã duyệt kết quả. Bạn có thể chọn lên lịch hoặc phản hồi ứng viên.');setRevision(x=>x+1);}
    catch{setError('Không duyệt được kết quả. Hồ sơ có thể vừa được chấm lại; hãy tải lại.');}finally{setBusy(false);}
  }
  return <section className="space-y-4 rounded-lg border border-slate-200 p-4" aria-label="Đánh giá có bằng chứng">
    <h3 className="font-semibold text-slate-900">Đánh giá có bằng chứng</h3>
    <p className="text-xs text-slate-600">Điểm được tính theo rubric. Trích dẫn xác nhận nội dung tự khai trong CV, chưa xác minh ngoài thực tế.</p>
    {error&&<p role="alert" className="text-sm text-red-700">{error} <button className="underline" onClick={()=>setRevision(x=>x+1)}>Tải lại</button></p>}
    {message&&<p role="status" className="text-sm text-green-800">{message}</p>}
    <details open={!rubric?.approved} className="space-y-3">
      <summary className="cursor-pointer text-sm font-medium">Rubric vị trí: {rubric?.approved?'đã duyệt':'chưa được duyệt'}</summary>
      <label className="block text-xs" htmlFor="rubric-skills">Kỹ năng yêu cầu, phân cách bằng dấu phẩy</label>
      <input id="rubric-skills" value={skills} disabled={!isHr||busy} onChange={e=>setSkills(e.target.value)} className="w-full rounded border border-slate-300 p-2 text-sm"/>
      <div className="grid grid-cols-2 gap-2">{Object.keys(weights).map(id=><label key={id} className="text-xs">{labels[id]||id}
        <input type="number" min="0" max="100" value={weights[id]} disabled={!isHr||busy} onChange={e=>setWeights(w=>({...w,[id]:Number(e.target.value)}))} className="mt-1 w-full rounded border border-slate-300 p-2"/>
      </label>)}</div>
      <p className="text-xs">Tổng trọng số: {total}/100</p>
      {isHr&&<button onClick={approveRubric} disabled={busy} className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50">{busy?'Đang lưu…':'Duyệt rubric phiên bản mới'}</button>}
    </details>
    {latest?<>
      <p className="text-sm font-medium">Trạng thái: {latest.status==='NEEDS_REVIEW'?'Cần HR xem xét':latest.status==='FAILED'?'Lỗi xử lý':latest.status==='DONE'?'Đã chấm':'Đang xử lý'}</p>
      {(latest.report?.reviewReasons||[latest.errorCode]).filter(Boolean).map(reason=><p key={reason} className="text-xs text-amber-900">{reasons[reason!]||reason}</p>)}
      {latest.report?.criteria?.map(c=><details key={c.id} className="rounded border border-slate-200 p-2">
        <summary className="cursor-pointer text-sm">{labels[c.id]||c.id}: {c.points}/{c.weight}</summary>
        {c.evidence.length?c.evidence.map((e,i)=><blockquote key={i} className="mt-2 border-l-2 border-slate-300 pl-2 text-xs text-slate-700">“{e.quote}” <span className="text-slate-500">({e.segmentId})</span></blockquote>):<p className="mt-2 text-xs text-slate-600">Chưa đủ bằng chứng cho tiêu chí này.</p>}
      </details>)}
      {isHr&&typeof latest.report?.matchScore==='number'&&latest.report.approvalStatus!=='APPROVED'&&<button disabled={busy} onClick={approveResult} className="rounded bg-red-700 px-3 py-2 text-sm text-white disabled:opacity-50">Duyệt kết quả sau khi xem bằng chứng</button>}
      {latest.report?.approvalStatus==='APPROVED'&&<p className="text-xs text-green-800">Kết quả đã được HR duyệt.</p>}
    </>:<p className="text-xs text-slate-600">Chưa có lịch sử theo phiên bản. Bấm Chấm lại để đánh giá bằng workflow mới.</p>}
    <details><summary className="cursor-pointer text-sm">Lịch sử đánh giá ({history.length})</summary>
      <ol className="mt-2 space-y-2">{history.map(run=><li key={run.id} className="border-t border-slate-100 pt-2 text-xs">
        {new Date(run.createdAt).toLocaleString('vi-VN')} — {run.status} — {run.report?.matchScore??'Chưa có điểm'}
        {run.events.filter(e=>e.type.startsWith('DELIVERY')).map(e=><p key={e.id}>{e.type}: {String(e.data.action||'')} {String(e.data.status||'')}</p>)}
      </li>)}</ol>
    </details>
  </section>;
}
