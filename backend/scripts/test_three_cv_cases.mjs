// Exercises real WF04 with synthetic PDFs on disposable job copies. Never invokes WF05/06.
import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {join,basename} from 'node:path';
import {PrismaService} from '../dist/prisma/prisma.service.js';
assert.equal(process.env.RUN_SYNTHETIC_CV_CASES,'yes');
const db=new PrismaService(),base=process.env.TEST_API_URL||'https://api.cvresources.tech',dir=process.env.TEST_CV_DIRECTORY,output=process.env.TEST_CV_REPORT,results=[];
assert.ok(dir&&output&&process.env.TEST_HR_EMAIL&&process.env.TEST_HR_PASSWORD);
const cases=[['01_CV_Golang_Phu_hop_cao.pdf','TEST 01 Minh An Tran',80,100],['02_CV_Golang_Phu_hop_trung_binh.pdf','TEST 02 Bao Nguyen',50,79.99],['03_CV_Golang_Phu_hop_thap.pdf','TEST 03 Linh Pham',0,49.99]];
try{
 const login=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.TEST_HR_EMAIL,password:process.env.TEST_HR_PASSWORD})});assert.equal(login.status,201);const auth=await login.json();assert.equal(auth.user.role,'HR');const headers={Authorization:'Bearer '+auth.accessToken};
 const source=await db.jobPost.findFirstOrThrow({where:{title:'Senior Golang Backend Engineer (Microservices)',status:'OPEN'}});
 for(const [filename,name,min,max]of cases){let job,uploaded;
  try{
   job=await db.jobPost.create({data:{title:'[TEST CV CASE] '+source.title,description:source.description,requirements:source.requirements}});
   const form=new FormData();form.set('name',name);form.set('email','doanthanhhuy1309@gmail.com');form.set('jobId',job.id);form.set('file_cv',new Blob([await readFile(join(dir,filename))],{type:'application/pdf'}),filename);
   const response=await fetch(base+'/recruitment/apply',{method:'POST',body:form});assert.equal(response.status,201);const candidate=await response.json();uploaded=join(process.cwd(),'uploads','cv',basename(candidate.cvUrl));
   let run;const deadline=Date.now()+600000;
   while(Date.now()<deadline){const c=await db.candidate.findUniqueOrThrow({where:{id:candidate.id}});if(c.latestEvaluationId){const r=await db.evaluationRun.findUniqueOrThrow({where:{id:c.latestEvaluationId}});if(!['PENDING','PROCESSING'].includes(r.status)){run=r;break;}}await new Promise(r=>setTimeout(r,1500));}
   assert.ok(run,'Real AI scoring did not finish');const score=run.report?.matchScore;
   const result={filename,status:run.status,model:run.modelId,score,errorCode:run.errorCode,criteria:run.report?.criteria?.map(c=>({id:c.id,points:c.points,weight:c.weight})),reviewReasons:run.report?.reviewReasons,expectedRange:[min,max],rangeMatched:typeof score==='number'&&score>=min&&score<=max};results.push(result);
   await writeFile(output,JSON.stringify({recipient:'doanthanhhuy1309@gmail.com',sourceJobId:source.id,sourceTitle:source.title,results},null,2));console.log(JSON.stringify(result));
   assert.equal(typeof score,'number','A PDF fixture must produce an actual score');
   const removed=await fetch(base+'/recruitment/candidates/'+candidate.id,{method:'DELETE',headers});assert.equal(removed.status,200,'Only the synthetic test candidate is deleted');
  }finally{if(job)await db.jobPost.delete({where:{id:job.id}});if(uploaded)await unlink(uploaded).catch(()=>{});}
 }
 assert.ok(results.every(r=>r.rangeMatched),'One CV did not land in its intended scoring band; inspect evidence before adjusting fixture');
 console.log('PASS: 3 PDF fixtures scored by real WF04, all intended score bands verified, synthetic records cleaned using the new delete endpoint; no emails sent');
}finally{await db.$disconnect();}
