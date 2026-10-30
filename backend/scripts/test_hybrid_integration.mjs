// Isolated synthetic records only. Never sends email or invokes Gemini/n8n.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir,writeFile,unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../dist/prisma/prisma.service.js';
import { EvaluationService } from '../dist/recruitment/evaluation.service.js';
const db=new PrismaService(),service=new EvaluationService(db),filename=`hybrid-test-${randomUUID()}.pdf`;
const file=join(process.cwd(),'uploads','cv',filename);let job;
try {
 await mkdir(join(process.cwd(),'uploads','cv'),{recursive:true});await writeFile(file,'%PDF-1.4\nSynthetic test fixture\n%%EOF');
 job=await db.jobPost.create({data:{title:'Synthetic hybrid regression test',description:'NodeJS backend',requirements:'NodeJS'}});
 await service.approveRubric(job.id,{requiredSkills:['NodeJS'],weights:{skills:40,projects:30,production:20,discipline:10}},'synthetic-test-reviewer');
 const candidate=await db.candidate.create({data:{name:'Synthetic Test',email:`${randomUUID()}@example.invalid`,cvUrl:filename,jobId:job.id,
  parsedSkillsJson:{interviewSchedule:{status:'EXISTING_TEST_METADATA'},talentPool:{tag:'preserve-test-metadata'}}}});
 const first=await service.start(candidate.id);
 const claims=await Promise.all([service.claim(first.id),service.claim(first.id)]);
 assert.equal(claims.filter(c=>c.claimed).length,1,'one execution must own the run');
 const ctx=claims.find(c=>c.claimed);
 await assert.rejects(service.complete(first.id,{claimToken:'wrong',status:'DONE'}));
 const second=await service.start(candidate.id),secondCtx=await service.claim(second.id);
 const extraction={claims:[{criterion:'skills',skill:'NodeJS',quote:'Developed a NodeJS application.',segmentId:'s1'}],employmentIntervals:[],missingInformation:[]};
 // The source PDF may contain NUL; both evidence verification and persistence must survive it.
 const segments=[{id:'s1',text:'Developed a NodeJS application.\u0000'}];
 const finish=c=>({claimToken:c.claimToken,status:'DONE',cvHash:c.cvHash,extraction,segments,modelId:'synthetic-fixture'});
 assert.equal((await service.complete(first.id,finish(ctx))).projectionUpdated,false,'older callback cannot overwrite latest run');
 await assert.rejects(service.approve(first.id,'synthetic-test-reviewer'));
 const completed=await service.complete(second.id,finish(secondCtx));assert.equal(completed.matchScore,40);
 const cleanRun=await db.evaluationRun.findUniqueOrThrow({where:{id:second.id}});
 assert.ok(!JSON.stringify(cleanRun.report).includes('\\u0000'),'PostgreSQL report must be free of NUL');
 assert.equal((await service.complete(second.id,finish(secondCtx))).duplicate,true);
 const stored=await db.candidate.findUniqueOrThrow({where:{id:candidate.id}});
 assert.equal(stored.parsedSkillsJson.interviewSchedule.status,'EXISTING_TEST_METADATA');assert.equal(stored.parsedSkillsJson.talentPool.tag,'preserve-test-metadata');
 await service.approve(second.id,'synthetic-test-reviewer');
 await db.evaluationEvent.create({data:{evaluationId:second.id,type:'DELIVERY_REQUESTED',deduplicationKey:`${second.id}:INTERVIEW`,data:{status:'PENDING',options:{interviewType:'ONLINE'}}}});
 const delivery=await Promise.all([service.claimDelivery(second.id,'INTERVIEW'),service.claimDelivery(second.id,'INTERVIEW')]);
 assert.equal(delivery.filter(c=>c.claimed).length,1,'one sender must own delivery');
 await service.delivery(second.id,{action:'INTERVIEW',status:'FAILED',metadata:{googleMeetUrl:'https://meet.google.com/fake',isRealGoogleMeet:false}});
 const unchanged=await db.candidate.findUniqueOrThrow({where:{id:candidate.id}});assert.equal(unchanged.parsedSkillsJson.interviewSchedule.status,'EXISTING_TEST_METADATA');
 await service.saveCx(candidate.id,new URL(delivery.find(c=>c.claimed).cxUrl).searchParams.get('token'),4);
 assert.equal((await db.evaluationEvent.findUnique({where:{deduplicationKey:`${second.id}:CX`}})).data.score,4);
 const stale=await service.start(candidate.id);await db.evaluationRun.update({where:{id:stale.id},data:{createdAt:new Date(Date.now()-3600000)}});
 await service.expireStaleRuns();assert.equal((await db.evaluationRun.findUnique({where:{id:stale.id}})).status,'FAILED');
 const history=await service.history(candidate.id);assert.equal(history.length,3);assert.ok(!('claimToken' in history[0]));
 console.log('PASS: atomic claims, stale callbacks, deterministic score, metadata merge, HR approval, delivery deduplication, CX persistence, watchdog and history redaction');
} finally {
 if(job)await db.jobPost.delete({where:{id:job.id}});
 await unlink(file).catch(()=>{});await db.$disconnect();
}
