// Exercises production webhooks with synthetic CV only. WF_04 never sends email.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile,unlink,readFile } from 'node:fs/promises';
import { join,basename } from 'node:path';
import { PrismaService } from '../dist/prisma/prisma.service.js';
import { EvaluationService } from '../dist/recruitment/evaluation.service.js';
const db=new PrismaService(),service=new EvaluationService(db);let job,uploadedFile;
const filename=`hybrid-live-${randomUUID()}.pdf`,file=join(process.cwd(),'uploads','cv',filename);
function pdf(text){const content='BT /F1 10 Tf 40 780 Td '+text.split('\n').map((l,i)=>(i?'0 -15 Td ':'')+'('+l.replace(/[()\\]/g,'\\$&')+') Tj').join('\n')+' ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`];let data='%PDF-1.4\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(data));data+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}const xref=Buffer.byteLength(data);data+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return data;}
async function dispatch(run){const response=await fetch('http://localhost:5679/webhook/process-cv',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':process.env.N8N_API_KEY},body:JSON.stringify({evaluationId:run.id})});assert.equal(response.status,202,`Webhook acceptance ${response.status}`);
 return waitRun(run);}
async function waitRun(run){const deadline=Date.now()+240000;while(Date.now()<deadline){const saved=await db.evaluationRun.findUniqueOrThrow({where:{id:run.id}});if(!['PENDING','PROCESSING'].includes(saved.status))return saved;await new Promise(r=>setTimeout(r,1000));}throw Error('Live evaluation timeout');}
try {
 const stats=await fetch('http://localhost:3001/recruitment/stats');assert.equal(stats.status,401);
 const invalid=await fetch('http://localhost:5679/webhook/process-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(invalid.status,403);
 const malformed=await fetch('http://localhost:5679/webhook/process-cv',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':process.env.N8N_API_KEY},body:'{}'});assert.equal(malformed.status,400);
 await writeFile(file,pdf('Synthetic CV for software engineering validation\nDeveloped a NodeJS application for a project.\nOptimized PostgreSQL system latency by 50%.\nImplemented unit tests and CI/CD for the application.\nEmployment dates: 2024-01 to 2025-12.'));
 job=await db.jobPost.create({data:{title:'Synthetic NodeJS Backend',description:'Develop backend applications.',requirements:'NodeJS, PostgreSQL'}});
 const form=new FormData();form.set('name','Synthetic Workflow Test');form.set('email',`${randomUUID()}@example.invalid`);form.set('jobId',job.id);
 form.set('file_cv',new Blob([await readFile(file)],{type:'application/pdf'}),'synthetic.pdf');
 const application=await fetch('http://localhost:3001/recruitment/apply',{method:'POST',body:form});assert.equal(application.status,201);
 const candidate=await application.json();uploadedFile=join(process.cwd(),'uploads','cv',basename(candidate.cvUrl));
 let started;const acceptanceDeadline=Date.now()+10000;
 while(Date.now()<acceptanceDeadline){const c=await db.candidate.findUniqueOrThrow({where:{id:candidate.id}});if(c.latestEvaluationId){started={id:c.latestEvaluationId};break;}await new Promise(r=>setTimeout(r,100));}
 assert.ok(started,'Application must create a versioned evaluation');
 const missing=await waitRun(started);assert.equal(missing.status,'NEEDS_REVIEW');assert.equal(missing.errorCode,'RUBRIC_APPROVAL_REQUIRED');assert.equal((await db.candidate.findUnique({where:{id:candidate.id}})).matchScore,null);
 console.log('PASS: live auth guard, input rejection, public PDF upload, configured backend dispatcher, missing-rubric review and callback persistence');
 if(process.argv.includes('--ai')) {
  await service.approveRubric(job.id,{requiredSkills:['NodeJS','PostgreSQL'],weights:{skills:40,projects:30,production:20,discipline:10}},'synthetic-live-reviewer');
  const result=await dispatch(await service.start(candidate.id));
  const report=result.report;
  console.log(JSON.stringify({liveAI:{status:result.status,errorCode:result.errorCode,model:result.modelId,matchScore:report?.matchScore,criteria:report?.criteria?.length||0,reviewReasons:report?.reviewReasons}}));
  assert.ok(['DONE','NEEDS_REVIEW'].includes(result.status),'Pipeline should finish or request review');
  if(typeof report?.matchScore==='number')assert.equal(report.criteria.length,4);
 }
} finally {if(job)await db.jobPost.delete({where:{id:job.id}});await unlink(file).catch(()=>{});if(uploadedFile)await unlink(uploadedFile).catch(()=>{});await db.$disconnect();}
