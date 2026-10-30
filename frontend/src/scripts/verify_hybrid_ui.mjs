import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const out='/tmp/hr-hybrid-ui';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const candidate={id:'synthetic',jobId:'job',name:'Ứng viên kiểm thử',email:'synthetic@example.invalid',cvUrl:'synthetic.pdf',matchScore:62.5,aiStatus:'DONE',createdAt:'2026-10-30',updatedAt:'2026-10-30',parsedSkillsJson:{skills:['Node.js'],evaluation:{id:'evaluation',status:'NEEDS_REVIEW',approvalStatus:'PENDING_HR'}}};
  await page.addInitScript(()=>{localStorage.setItem('token','synthetic-browser-fixture');localStorage.setItem('user',JSON.stringify({id:'hr',fullName:'HR kiểm thử',email:'hr@example.invalid',role:'HR',isActive:true}));});
  await page.route('http://localhost:3001/**',route=>{
   const p=new URL(route.request().url()).pathname;let data=[];
   if(p==='/auth/me')data={id:'hr',fullName:'HR kiểm thử',role:'HR',email:'hr@example.invalid',isActive:true};
   if(p==='/recruitment/admin/jobs')data=[{id:'job',title:'Backend Engineer',status:'OPEN',description:'Backend',requirements:'Node.js',createdAt:'2026-10-30',_count:{candidates:1}}];
   if(p==='/recruitment/jobs/job/candidates')data=[candidate];
   if(p.endsWith('/rubric'))data={approved:{id:'rubric',requiredSkills:['Node.js'],weights:{skills:40,projects:30,production:20,discipline:10}},suggestedSkills:['Node.js'],defaultWeights:{skills:40,projects:30,production:20,discipline:10}};
   if(p.endsWith('/evaluations'))data=[{id:'evaluation',status:'NEEDS_REVIEW',createdAt:'2026-10-30',events:[],report:{matchScore:62.5,approvalStatus:'PENDING_HR',reviewReasons:['NEAR_DECISION_THRESHOLD'],criteria:[{id:'skills',level:3,points:30,weight:40,rule:'ratio',evidence:[{quote:'Developed a NodeJS application.',segmentId:'s1'}]}]}}];
   if(p.endsWith('/cv'))return route.fulfill({status:404,contentType:'application/json',body:'{}'});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.goto('http://localhost:3000/recruitment');
  await page.getByText(candidate.name,{exact:true}).click();
  await page.getByRole('heading',{name:'Đánh giá có bằng chứng'}).waitFor();
  await page.getByText('Duyệt kết quả sau khi xem bằng chứng').waitFor();
  if(await page.getByRole('button',{name:'Lên lịch Meet'}).isEnabled())throw Error('Unapproved candidate can be scheduled');
  await page.keyboard.press('Shift+Tab');
  if(!await page.getByRole('dialog').evaluate(el=>el.contains(document.activeElement)))throw Error('Focus escaped dialog');
  await page.locator('summary').filter({hasText:'Kỹ năng phù hợp JD'}).click();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)throw Error(`Horizontal overflow at ${width}px`);
  await page.screenshot({path:`${out}/evaluation-${width}.png`,fullPage:true});
  console.log(`PASS: evidence review, approval gate and no page overflow at ${width}px`);
  await page.close();
 }
}finally{await browser.close();}
