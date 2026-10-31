// Deletes only the disposable fixture created in this script. No external messages.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFile,access,unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {PrismaService} from '../dist/prisma/prisma.service.js';
import {EvaluationService} from '../dist/recruitment/evaluation.service.js';
const db=new PrismaService(),evaluations=new EvaluationService(db),base=process.env.TEST_API_URL||'http://localhost:3001';
assert.ok(process.env.TEST_HR_EMAIL&&process.env.TEST_HR_PASSWORD);
let job,filename;
try{
 const login=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.TEST_HR_EMAIL,password:process.env.TEST_HR_PASSWORD})});assert.equal(login.status,201);const auth=await login.json();assert.equal(auth.user.role,'HR');const headers={Authorization:'Bearer '+auth.accessToken};
 job=await db.jobPost.create({data:{title:'[TEST] candidate deletion',description:'Synthetic deletion fixture only',requirements:'NodeJS'}});
 filename=`delete-test-${randomUUID()}.pdf`;const file=join(process.cwd(),'uploads','cv',filename);await writeFile(file,'%PDF-1.4\nSynthetic deletion test\n%%EOF');
 const c=await db.candidate.create({data:{name:'TEST DELETE ONLY',email:`${randomUUID()}@example.invalid`,jobId:job.id,cvUrl:filename,aiStatus:'DONE'}}),url=base+'/recruitment/candidates/'+c.id;
 assert.equal((await fetch(url,{method:'DELETE'})).status,401);
 if(process.env.TEST_EMPLOYEE_EMAIL&&process.env.TEST_EMPLOYEE_PASSWORD){
  const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.TEST_EMPLOYEE_EMAIL,password:process.env.TEST_EMPLOYEE_PASSWORD})});assert.equal(r.status,201);const employee=await r.json();assert.equal(employee.user.role,'EMPLOYEE');
  assert.equal((await fetch(url,{method:'DELETE',headers:{Authorization:'Bearer '+employee.accessToken}})).status,403);
 }
 const run=await evaluations.start(c.id);assert.equal((await fetch(url,{method:'DELETE',headers})).status,409,'cannot delete active evaluation');
 const ctx=await evaluations.claim(run.id);await evaluations.complete(run.id,{claimToken:ctx.claimToken,status:'FAILED',errorCode:'SYNTHETIC_DELETION_TEST'});
 const event=await db.evaluationEvent.create({data:{evaluationId:run.id,type:'DELIVERY_REQUESTED',deduplicationKey:`${run.id}:INTERVIEW`,data:{status:'PENDING'}}});
 assert.equal((await fetch(url,{method:'DELETE',headers})).status,409,'cannot delete pending delivery');
 await db.evaluationEvent.update({where:{id:event.id},data:{data:{status:'UNKNOWN'}}});
 assert.equal((await fetch(url,{method:'DELETE',headers})).status,409,'cannot delete unresolved delivery');
 await db.evaluationEvent.update({where:{id:event.id},data:{data:{status:'FAILED'}}});
 const deleted=await fetch(url,{method:'DELETE',headers});assert.equal(deleted.status,200);assert.equal((await deleted.json()).fileCleanupPending,false);
 assert.equal(await db.candidate.findUnique({where:{id:c.id}}),null);assert.equal(await db.evaluationRun.count({where:{candidateId:c.id}}),0);assert.equal(await db.evaluationEvent.count({where:{evaluationId:run.id}}),0);
 await assert.rejects(access(file));assert.equal((await fetch(url,{method:'DELETE',headers})).status,404);
 await writeFile(file,'%PDF-1.4\nShared synthetic fixture\n%%EOF');
 const shared=[];for(let i=0;i<2;i++)shared.push(await db.candidate.create({data:{name:'TEST SHARED FILE',email:`${randomUUID()}@example.invalid`,jobId:job.id,cvUrl:filename,aiStatus:'DONE'}}));
 assert.equal((await fetch(base+'/recruitment/candidates/'+shared[0].id,{method:'DELETE',headers})).status,200);await access(file);
 assert.equal((await fetch(base+'/recruitment/candidates/'+shared[1].id,{method:'DELETE',headers})).status,200);await assert.rejects(access(file));
 console.log('PASS: delete auth/RBAC, active evaluation/delivery conflicts, candidate/history cascade, CV cleanup, shared file protection and repeated-delete 404; only synthetic data removed');
}finally{if(job)await db.jobPost.delete({where:{id:job.id}});if(filename)await unlink(join(process.cwd(),'uploads','cv',filename)).catch(()=>{});await db.$disconnect();}
