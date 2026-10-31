// Run on a reviewed production release. Does not approve results or send mail.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { PrismaService } from '../dist/prisma/prisma.service.js';
import { EvaluationService } from '../dist/recruitment/evaluation.service.js';
assert.equal(process.env.BACKFILL_AUTOMATIC_RUBRICS,'yes');
assert.ok(process.env.AUTOMATIC_RUBRICS_REPORT);
const db=new PrismaService(),service=new EvaluationService(db),report={jobs:[],reprocessed:[]};
try{
 const jobs=await db.jobPost.findMany({where:{status:'OPEN'},orderBy:{createdAt:'asc'}});
 for(const job of jobs){const rubric=await service.ensureRubric(job.id);report.jobs.push({jobId:job.id,title:job.title,rubricId:rubric?.id||null,source:rubric?.approvedAt?'HR':rubric?'AUTOMATIC':'JD_REQUIREMENTS_REQUIRED'});}
 const blocked=await db.evaluationRun.findMany({where:{errorCode:'RUBRIC_APPROVAL_REQUIRED'},orderBy:{createdAt:'desc'}});
 for(const old of blocked){
  const candidate=await db.candidate.findUnique({where:{id:old.candidateId}});
  if(!candidate||candidate.latestEvaluationId!==old.id)continue;
  const rubric=await service.ensureRubric(candidate.jobId);if(!rubric)continue;
  const run=await service.start(candidate.id);
  const item={candidateId:candidate.id,oldEvaluationId:old.id,evaluationId:run.id};report.reprocessed.push(item);
  try{
   const r=await fetch(process.env.TEST_N8N_WEBHOOK||process.env.N8N_CV_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':process.env.N8N_API_KEY},body:JSON.stringify({evaluationId:run.id}),signal:AbortSignal.timeout(15000)});
   assert.equal(r.status,202,'WF04 must accept the replacement run');
  }catch(error){await service.dispatchFailed(run.id);Object.assign(item,{status:'FAILED',errorCode:'DISPATCH_FAILED'});throw error;}
  const deadline=Date.now()+600000;
  while(Date.now()<deadline){const saved=await db.evaluationRun.findUniqueOrThrow({where:{id:run.id}});if(!['PENDING','PROCESSING'].includes(saved.status)){Object.assign(item,{status:saved.status,errorCode:saved.errorCode,matchScore:saved.report?.matchScore??null});break;}await new Promise(r=>setTimeout(r,1500));}
  if(!item.status){Object.assign(item,{status:'PROCESSING',errorCode:'BACKFILL_WAIT_TIMEOUT'});throw Error('Replacement evaluation did not finish before the backfill deadline');}
  await writeFile(process.env.AUTOMATIC_RUBRICS_REPORT,JSON.stringify(report,null,2));
  // Run candidates serially to avoid a burst against the Gemini rate limit.
 }
 console.log(JSON.stringify(report,null,2));
}finally{await writeFile(process.env.AUTOMATIC_RUBRICS_REPORT,JSON.stringify(report,null,2));await db.$disconnect();}
