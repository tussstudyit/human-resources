// Explicit opt-in production test. Creates only TEST records; sends two test messages
// to TEST_RECIPIENT. Uses real public API, WF05/06, Calendar, SMTP and callbacks.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../dist/prisma/prisma.service.js';
import { EvaluationService } from '../dist/recruitment/evaluation.service.js';
import { signAction } from '../dist/recruitment/action-links.js';
assert.equal(process.env.RUN_PRODUCTION_DELIVERY_TEST, 'yes');
const recipient=process.env.TEST_RECIPIENT;
assert.ok(recipient && process.env.TEST_HR_EMAIL && process.env.TEST_HR_PASSWORD);
const base=process.env.TEST_API_URL||'https://api.cvresources.tech';
const db=new PrismaService(),service=new EvaluationService(db),results=[];
let token,job,filename;
async function request(route,{method='GET',body,auth=true,status=200}={}) {
 const r=await fetch(base+route,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(auth&&token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal(r.status,status,`${method} ${route}: ${r.status}, expected ${status}`);
 const data=await r.json();results.push(`${method} ${route}: ${status}`);return data;
}
async function waitDelivery(id,action) {
 const deadline=Date.now()+150000;
 while(Date.now()<deadline){const event=await db.evaluationEvent.findUnique({where:{deduplicationKey:`${id}:${action}`}});
  if(['SENT','FAILED','UNKNOWN'].includes(event?.data?.status)){assert.equal(event.data.status,'SENT',`${action} must have verified delivery`);return event.data;}
  await new Promise(r=>setTimeout(r,1000));}
 throw Error(`${action} delivery timed out`);
}
try {
 for(const route of ['/auth/me','/recruitment/stats','/recruitment/admin/jobs','/onboarding/my-tasks','/performance/my-kpis'])await request(route,{auth:false,status:401});
 await request('/auth/login',{method:'POST',auth:false,body:{email:process.env.TEST_HR_EMAIL,password:randomUUID()},status:401});
 const login=await request('/auth/login',{method:'POST',auth:false,body:{email:process.env.TEST_HR_EMAIL,password:process.env.TEST_HR_PASSWORD},status:201});
 token=login.accessToken;assert.equal(login.user.role,'HR');assert.equal('password' in login.user,false);
 assert.equal((await request('/auth/me')).role,'HR');
 for(const route of ['/recruitment/stats','/recruitment/admin/jobs','/departments','/onboarding/my-tasks','/performance/my-kpis','/performance/my-feedbacks','/performance/dashboard'])await request(route);
 job=await request('/recruitment/jobs',{method:'POST',body:{title:'[TEST] VPS WF05 WF06 - no recruitment decision',description:'Disposable integration test fixture.',requirements:'NodeJS'},status:201});
 await request(`/recruitment/jobs/${job.id}`,{method:'PATCH',body:{description:'TEST fixture for real delivery verification.'}});
 await request(`/recruitment/jobs/${job.id}`,{auth:false});
 await request(`/recruitment/jobs/${job.id}/rubric/approve`,{method:'POST',body:{requiredSkills:[],weights:{skills:100}},status:400});
 await request(`/recruitment/jobs/${job.id}/rubric/approve`,{method:'POST',body:{requiredSkills:['NodeJS'],weights:{skills:40,projects:30,production:20,discipline:10}},status:201});
 filename=`delivery-test-${randomUUID()}.pdf`;
 await writeFile(join(process.cwd(),'uploads','cv',filename),'%PDF-1.4\nSynthetic delivery fixture\n%%EOF');
 const candidate=await db.candidate.create({data:{name:'TEST delivery requested by owner',email:recipient,cvUrl:filename,jobId:job.id}});
 await request(`/recruitment/candidates/${candidate.id}/cv`,{auth:false,status:401});
 const cv=await fetch(base+`/recruitment/candidates/${candidate.id}/cv`,{headers:{Authorization:`Bearer ${token}`}});assert.equal(cv.status,200);assert.ok(cv.headers.get('content-type').includes('pdf'));
 const run=await service.start(candidate.id),ctx=await service.claim(run.id);
 // Deliberately deterministic fixture: this does not claim an AI evaluation occurred.
 await service.complete(run.id,{claimToken:ctx.claimToken,status:'DONE',cvHash:ctx.cvHash,modelId:'synthetic-delivery-fixture',extraction:{claims:[{criterion:'skills',skill:'NodeJS',quote:'Developed NodeJS applications.',segmentId:'s1'}],employmentIntervals:[],missingInformation:[]},segments:[{id:'s1',text:'Developed NodeJS applications.'}]});
 await request(`/recruitment/candidates/${candidate.id}/schedule-interview`,{method:'POST',body:{interviewType:'ONLINE'},status:409});
 await request(`/recruitment/evaluations/${run.id}/approve`,{method:'POST',body:{},status:201});
 let interview,pool;
 if(process.env.TEST_SKIP_PROVIDER_DELIVERY!=='yes'){
 await request(`/recruitment/candidates/${candidate.id}/schedule-interview`,{method:'POST',body:{interviewType:'ONLINE'},status:201});
 interview=await waitDelivery(run.id,'INTERVIEW');
 assert.ok(interview.metadata.googleCalendarEventId);assert.match(interview.metadata.googleMeetUrl,/^https:\/\/meet\.google\.com\//);assert.equal(interview.metadata.isRealGoogleMeet,true);
 const duplicate=await request(`/recruitment/candidates/${candidate.id}/schedule-interview`,{method:'POST',body:{interviewType:'ONLINE'},status:201});assert.equal(duplicate.delivery.data.status,'SENT');
 await request(`/recruitment/candidates/${candidate.id}/talent-pool`,{method:'POST',body:{scenario:'CV_SCREENING'},status:201});
 pool=await waitDelivery(run.id,'TALENT_POOL');
 const saved=await db.candidate.findUniqueOrThrow({where:{id:candidate.id}});
 assert.equal(saved.parsedSkillsJson.interviewSchedule.googleCalendarEventId,interview.metadata.googleCalendarEventId);
 assert.ok(saved.parsedSkillsJson.talentPool);assert.equal((await service.claimDelivery(run.id,'INTERVIEW')).claimed,false);
 const history=await request(`/recruitment/candidates/${candidate.id}/evaluations`);assert.ok(history[0].events.some(e=>e.type.startsWith('DELIVERY')));assert.equal('claimToken' in history[0],false);
 }
 const rsvpToken=signAction(candidate.id,run.id,'rsvp'),cxToken=signAction(candidate.id,run.id,'cx');
 for(const [route,params,expected] of [
  [`/recruitment/candidates/${candidate.id}/rsvp`,{token:rsvpToken,status:'INVALID'},400],
  [`/recruitment/candidates/${candidate.id}/rsvp`,{token:rsvpToken,status:'CONFIRMED'},201],
  [`/recruitment/candidates/${candidate.id}/rsvp`,{token:rsvpToken,status:'RESCHEDULE'},201],
  [`/recruitment/cx-feedback?candidateId=${candidate.id}`,{token:cxToken,score:'6'},400],
  [`/recruitment/cx-feedback?candidateId=${candidate.id}`,{token:cxToken,score:'4'},201],
 ]){
  const response=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params)});
  assert.equal(response.status,expected,`Signed action ${route}`);results.push(`Signed action ${route}: ${expected}`);
 }
 const afterActions=await db.candidate.findUniqueOrThrow({where:{id:candidate.id}});
 assert.equal(afterActions.parsedSkillsJson.interviewSchedule.rsvpStatus,'RESCHEDULE_REQUESTED');
 const feedback=await db.evaluationEvent.findUniqueOrThrow({where:{deduplicationKey:`${run.id}:CX`}});assert.equal(feedback.data.score,4);
 for(const action of ['rsvp','cx-feedback']){
  const path=action==='rsvp'?`/recruitment/candidates/${candidate.id}/rsvp?token=invalid`:'/recruitment/cx-feedback?token=invalid';
  const r=await fetch(base+path);assert.equal(r.status,401);
 }
 console.log(JSON.stringify({passed:results.length,checks:results,delivery:{recipient,interview,pool},fixture:'synthetic; not an AI scoring test'},null,2));
} finally {
 if(job)await db.jobPost.delete({where:{id:job.id}});
 if(filename)await unlink(join(process.cwd(),'uploads','cv',filename)).catch(()=>{});
 await db.$disconnect();
}
