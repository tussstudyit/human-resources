// One explicitly labelled TEST message to the recipient authorized by the owner.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFile,unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {PrismaService} from '../dist/prisma/prisma.service.js';
import {EvaluationService} from '../dist/recruitment/evaluation.service.js';
assert.equal(process.env.RUN_REJECTION_DELIVERY_TEST,'yes');assert.ok(process.env.TEST_RECIPIENT&&process.env.TEST_HR_EMAIL&&process.env.TEST_HR_PASSWORD);
const db=new PrismaService(),service=new EvaluationService(db),base=process.env.TEST_API_URL||'https://api.cvresources.tech';let job,file;
try{
 const login=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.TEST_HR_EMAIL,password:process.env.TEST_HR_PASSWORD})});assert.equal(login.status,201);const auth=await login.json();assert.equal(auth.user.role,'HR');const headers={'Content-Type':'application/json',Authorization:'Bearer '+auth.accessToken};
 job=await db.jobPost.create({data:{title:'[TEST] WF06 rejection - integration verification',description:'Synthetic fixture, no recruitment decision about a real applicant.',requirements:'Golang'}});
 const filename=`reject-test-${randomUUID()}.pdf`;file=join(process.cwd(),'uploads','cv',filename);await writeFile(file,'%PDF-1.4\nSynthetic fixture\n%%EOF');
 const c=await db.candidate.create({data:{name:'TEST WF06 - synthetic profile',email:process.env.TEST_RECIPIENT,jobId:job.id,cvUrl:filename}});
 const run=await service.start(c.id),ctx=await service.claim(run.id);
 await service.complete(run.id,{claimToken:ctx.claimToken,status:'DONE',cvHash:ctx.cvHash,modelId:'synthetic-rejection-fixture',extraction:{claims:[],employmentIntervals:[],missingInformation:[]},segments:[{id:'s1',text:'Synthetic profile for email workflow verification only.'}]});
 const url=base+`/recruitment/candidates/${c.id}/reject`,body=JSON.stringify({scenario:'CV_SCREENING'});
 assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body})).status,401);
 assert.equal((await fetch(url,{method:'POST',headers,body})).status,409,'HR result approval is still required');
 assert.equal((await fetch(base+`/recruitment/evaluations/${run.id}/approve`,{method:'POST',headers,body:'{}'})).status,201);
 const accepted=await fetch(url,{method:'POST',headers,body});assert.equal(accepted.status,201);assert.equal((await accepted.json()).success,true);
 let delivered;const deadline=Date.now()+150000;
 while(Date.now()<deadline){const e=await db.evaluationEvent.findUnique({where:{deduplicationKey:`${run.id}:TALENT_POOL`}});if(['SENT','FAILED','UNKNOWN'].includes(e?.data?.status)){delivered=e;break;}await new Promise(r=>setTimeout(r,1000));}
 assert.equal(delivered?.data?.status,'SENT','Provider must confirm the TEST message was accepted');
 const saved=await db.candidate.findUniqueOrThrow({where:{id:c.id}});assert.equal(saved.parsedSkillsJson.rejection.status,'REJECTED');assert.equal(saved.parsedSkillsJson.rejection.emailSent,true);assert.equal(saved.parsedSkillsJson.talentPool,undefined);
 const duplicate=await fetch(url,{method:'POST',headers,body});assert.equal(duplicate.status,201);assert.equal((await duplicate.json()).delivery.data.status,'SENT');
 const conflicting=await fetch(base+`/recruitment/candidates/${c.id}/talent-pool`,{method:'POST',headers,body:'{}'});assert.equal(conflicting.status,409);
 assert.equal(await db.evaluationEvent.count({where:{evaluationId:run.id,type:'DELIVERY_RESULT'}}),1,'A duplicate request must not send another email');
 console.log(JSON.stringify({recipient:process.env.TEST_RECIPIENT,workflow:'WF_06',status:'SENT',candidateState:'REJECTED',talentPoolStored:false,duplicateEmailPrevented:true,unapprovedRequestBlocked:true,testSubject:job.title}));
 assert.equal((await fetch(base+`/recruitment/candidates/${c.id}`,{method:'DELETE',headers})).status,200);
}finally{if(job)await db.jobPost.delete({where:{id:job.id}});if(file)await unlink(file).catch(()=>{});await db.$disconnect();}
