const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=f=>JSON.parse(fs.readFileSync(`n8n/workflows/${f}`,'utf8'));
const wf=read('WF_04_cv_parser_ai_scoring.json'),interview=read('WF_05_interview_scheduler.json'),reject=read('WF_06_rejection_notification.json');
async function run(w,name,input,previous={},helpers={}){
 const source=w.nodes.find(n=>n.name===name).parameters.jsCode;
 const context={$json:input,$input:{first:()=>input.json?input:{json:input},all:()=>[{json:input}]},
  $:name=>({first:()=>({json:previous[name]})}),Buffer,URL};
 return (await vm.runInNewContext('(async function(){'+source+'}).call(thisArg)',{...context,thisArg:{helpers}},{timeout:1000}))[0];
}
test('exports contain executable, connected nodes and no literal API keys',()=>{
 for(const w of [wf,interview,reject]){
  const names=new Set(w.nodes.map(n=>n.name));assert.equal(names.size,w.nodes.length);
  for(const n of w.nodes){
   if(n.type.endsWith('.code'))new (Object.getPrototypeOf(async function(){}).constructor)(n.parameters.jsCode);
   if(n.type.endsWith('.webhook'))assert.ok(n.webhookId,'Stable production webhook path requires webhookId');
   for(const p of n.parameters.headerParameters?.parameters||[])if(p.name==='x-api-key')assert.ok(p.value.startsWith('='));
   if(n.parameters.url?.includes('{{'))assert.ok(n.parameters.url.startsWith('='));
  }
  for(const [source,outs] of Object.entries(w.connections)){assert.ok(names.has(source));for(const edges of Object.values(outs).flat())for(const e of edges)assert.ok(names.has(e.node));}
 }
 assert.ok(wf.nodes.length>=45&&wf.nodes.length<=55);assert.ok(!wf.nodes.some(n=>n.type.endsWith('.stickyNote')));
});
test('upstream error and truncated AI output never become valid scored extractions',async()=>{
 const previous={'Canonical Context':{ctx:{evaluationId:'synthetic'}}};
 for(const response of [{error:'rate limited'},{candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{}'}]}}]},
  {candidates:[{finishReason:'STOP',content:{parts:[{text:'{"matchScore":95}'}]}}]}]){
  const output=await run(wf,'Validate AI Extraction',response,previous);assert.equal(output.json.valid,false);assert.equal(output.json.matchScore,undefined);
 }
});
test('document evidence drives score; repair and initial validation use the same schema',async()=>{
 const ctx={evaluationId:'synthetic',rubric:{requiredSkills:['Node.js'],weights:{skills:40,projects:30,production:20,discipline:10}},referenceDate:'2026-10-30'};
 const extraction={claims:[{criterion:'skills',skill:'NodeJS',quote:'Developed a NodeJS application.',segmentId:'s1'}],employmentIntervals:[],missingInformation:[]};
 const response={candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(extraction)}]}}]};
 for(const name of ['Validate AI Extraction','Validate Repaired Extraction'])assert.equal((await run(wf,name,response,{'Canonical Context':{ctx}})).json.valid,true);
 const scored=await run(wf,'Compute Deterministic Rubric',{ctx,extraction,segments:[{id:'s1',text:'Developed a NodeJS application.'}]});
 assert.equal(scored.json.report.matchScore,40);
});
test('invitation contains real calendar link and actual CRLF ICS attachment',async()=>{
 const ctx={candidateName:'<script>',candidateEmail:'synthetic@example.invalid',jobTitle:'Node.js',evaluationId:'synthetic',rsvpUrl:'https://example.invalid/rsvp?token=x'};
 const plan={ctx,online:true,type:'ONLINE',start:'2026-11-04T02:30:00.000Z',end:'2026-11-04T03:30:00.000Z'};
 let content;
 const out=await run(interview,'Build Invitation and ICS',{meetUrl:'https://meet.google.com/abc-defg-hij',eventId:'real-event'},
  {'Plan Interview':plan},{prepareBinaryData:async buffer=>{content=buffer.toString();return {data:'test'};}});
 assert.ok(content.includes('\r\n'));assert.ok(!content.includes('\\r\\n'));assert.ok(out.binary.calendar);
 assert.ok(out.json.html.includes('&lt;script&gt;'));assert.equal(out.json.metadata.isRealGoogleMeet,true);
});
test('SMTP failure is persisted instead of reported as sent',async()=>{
 const ctx={candidateEmail:'synthetic@example.invalid'};
 for(const w of [interview,reject]){
  const name=w===interview?'Build Invitation and ICS':'Build Talent Pool Feedback';
  const previous={[name]:{ctx,metadata:{}}};
  assert.equal((await run(w,'Inspect SMTP Outcome',{error:'SMTP refused'},previous)).json.status,'FAILED');
  assert.equal((await run(w,'Inspect SMTP Outcome',{accepted:['synthetic@example.invalid']},previous)).json.status,'SENT');
 }
});
