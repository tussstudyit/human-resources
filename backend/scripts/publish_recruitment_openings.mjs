// Explicitly publishes the reviewed catalog via the normal HR API; never changes existing jobs.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../data/recruitment_openings_2026-10.json',import.meta.url),'utf8'));
assert.equal(process.env.PUBLISH_RECRUITMENT_OPENINGS,'yes');
assert.ok(process.env.TEST_HR_EMAIL&&process.env.TEST_HR_PASSWORD&&process.env.OPENINGS_REPORT_FILE);
const base=process.env.TEST_API_URL||'https://api.cvresources.tech',report={created:[],skipped:[]};
const normalized=s=>s.normalize('NFKC').trim().toLowerCase();
assert.equal(new Set(catalog.map(j=>normalized(j.title))).size,catalog.length);
for(const j of catalog){assert.ok(j.title&&j.description&&j.requirements);assert.equal(j.status,'OPEN');}
const login=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.TEST_HR_EMAIL,password:process.env.TEST_HR_PASSWORD})});
assert.equal(login.status,201);const auth=await login.json();assert.equal(auth.user.role,'HR');
const headers={'Content-Type':'application/json',Authorization:`Bearer ${auth.accessToken}`};
const res=await fetch(base+'/recruitment/admin/jobs',{headers});assert.equal(res.status,200);
const existing=await res.json(),titles=new Set(existing.map(j=>normalized(j.title)));
try{
 for(const job of catalog){
  if(titles.has(normalized(job.title))){report.skipped.push(job.title);continue;}
  const created=await fetch(base+'/recruitment/jobs',{method:'POST',headers,body:JSON.stringify(job)});assert.equal(created.status,201,job.title);
  const saved=await created.json();report.created.push({id:saved.id,title:saved.title});titles.add(normalized(saved.title));
  await writeFile(process.env.OPENINGS_REPORT_FILE,JSON.stringify(report,null,2));
 }
 const publicResponse=await fetch(base+'/recruitment/jobs');assert.equal(publicResponse.status,200);
 const open=await publicResponse.json();for(const job of report.created)assert.ok(open.some(j=>j.id===job.id&&j.status==='OPEN'));
 report.totalOpen=open.length;console.log(JSON.stringify(report,null,2));
}finally{await writeFile(process.env.OPENINGS_REPORT_FILE,JSON.stringify(report,null,2));}
