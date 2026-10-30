const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base='http://host.docker.internal:3001';
for(const [number,file,action,route] of [[5,'WF_05_interview_scheduler.json','INTERVIEW','schedule-interview'],[6,'WF_06_rejection_notification.json','TALENT_POOL','rejection-notification']]) {
 const old=JSON.parse(fs.readFileSync(path.join(root,'n8n/workflows',file)));
 const mail=old.nodes.find(n=>n.type.endsWith('.emailSend'));
 const calendar=old.nodes.find(n=>n.type.endsWith('.googleCalendar'));
 const nodes=[],connections={};
 const add=(name,type,parameters,extra={})=>nodes.push({name,id:crypto.createHash('sha256').update(name).digest('hex').slice(0,24),type:'n8n-nodes-base.'+type,
  typeVersion:({webhook:2,httpRequest:4.2,code:2,if:2.2,respondToWebhook:1.4,emailSend:2.1,googleCalendar:1.3})[type],position:[Math.floor(nodes.length/6)*400,(nodes.length%6)*220],parameters,...(type==='webhook'?{webhookId:number===5?'8607d305-cb6f-4467-8af3-031cc974db23':'4c41a4c1-c88d-448a-b062-5ee178a1723d'}:{}),...extra});
 const code=(n,js,extra={})=>add(n,'code',{jsCode:js},extra);
 const edge=(a,b,o=0)=>{const outs=(connections[a]??={main:[]}).main;while(outs.length<=o)outs.push([]);outs[o].push({node:b,type:'main',index:0});};
 const iff=(n,expression)=>add(n,'if',{conditions:{options:{caseSensitive:true,leftValue:'',typeValidation:'strict',version:2},conditions:[{leftValue:expression,rightValue:true,operator:{type:'boolean',operation:'true',singleValue:true}}],combinator:'and'},options:{}});
 const response=(n,status,body)=>add(n,'respondToWebhook',{respondWith:'json',responseBody:body,options:{responseCode:status}});
 const api=(n,url,body,extra={})=>add(n,'httpRequest',{method:'POST',url:'='+base+url,sendHeaders:true,
  headerParameters:{parameters:[{name:'x-api-key',value:"={{ $('Receive Approved Action').first().json.headers['x-api-key'] }}"}]},
  sendBody:true,specifyBody:'json',jsonBody:body,options:{timeout:15000}},extra);
 add('Receive Approved Action','webhook',{httpMethod:'POST',path:route,authentication:'headerAuth',responseMode:'responseNode',options:{}},{credentials:{httpHeaderAuth:{id:'FAph8kba5iEDxNvF',name:'Backend API Key'}}});
 code('Validate Request',`const id=$json.body?.evaluationId;return [{json:{evaluationId:id,valid:typeof id==='string'&&/^[0-9a-f-]{36}$/i.test(id)&&typeof $json.headers?.['x-api-key']==='string'}}];`);
 iff('Request Valid?','={{ $json.valid }}');
 response('Reject Request',400,'={{ {error:"INVALID_ACTION_REQUEST"} }}');
 api('Claim Approved Delivery',"/recruitment/evaluations/{{ $json.evaluationId }}/delivery/claim",`={{ {action:${JSON.stringify(action)}} }}`,{onError:'continueErrorOutput'});
 iff('Delivery Claimed?','={{ $json.claimed === true }}');
 response('Already Handled',200,'={{ {duplicate:true,status:$json.status} }}');
 response('Accept Delivery',202,'={{ {evaluationId:$json.evaluationId,status:"ACCEPTED"} }}');
 const esc=`const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));`;
 if(number===5) {
  code('Plan Interview',`const ctx=$('Claim Approved Delivery').first().json;const type=ctx.options.interviewType||'ONLINE';if(!['ONLINE','OFFLINE'].includes(type))throw Error('INVALID_INTERVIEW_TYPE');
const local=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const date=new Date(local+'T02:30:00.000Z');let days=3;while(days){date.setUTCDate(date.getUTCDate()+1);if(![0,6].includes(date.getUTCDay()))days--;}
return [{json:{ctx,type,start:date.toISOString(),end:new Date(date.getTime()+3600000).toISOString(),online:type==='ONLINE'}}];`,{onError:'continueErrorOutput'});
  iff('Online Interview?','={{ $json.online }}');
  add('Create Google Calendar and Meet','googleCalendar',{calendar:{__rl:true,value:'primary',mode:'list'},
   start:"={{ $('Plan Interview').first().json.start }}",end:"={{ $('Plan Interview').first().json.end }}",
   additionalFields:{summary:"={{ 'Phỏng vấn ' + $('Plan Interview').first().json.ctx.jobTitle }}",
    description:'Phỏng vấn đã được HR duyệt.',attendees:["={{ $('Plan Interview').first().json.ctx.candidateEmail }}"],conferenceDataUi:{conferenceDataValues:{conferenceSolution:'hangoutsMeet'}}}},
   {credentials:calendar?.credentials,onError:'continueRegularOutput'});
  code('Validate Calendar Result',`const plan=$('Plan Interview').first().json;const url=$json.hangoutLink||$json.conferenceData?.entryPoints?.find(p=>p.entryPointType==='video')?.uri;
return [{json:{...plan,eventId:$json.id||null,meetUrl:url||null,calendarValid:!!$json.id&&typeof url==='string'&&url.startsWith('https://meet.google.com/')&&/^[a-z0-9-]+$/i.test(url.slice(24))}}];`);
  iff('Calendar Confirmed?','={{ $json.calendarValid }}');
  code('Build Invitation and ICS',esc+`const plan=$('Plan Interview').first().json;const ctx=plan.ctx;const result=plan.online?$json:{};const location=plan.online?result.meetUrl:'HR sẽ xác nhận địa điểm phỏng vấn trực tiếp.';
const fmt=s=>s.replace(/[-:]/g,'').split('.')[0]+'Z';const slash=String.fromCharCode(92);const clean=s=>String(s).split(slash).join(slash+slash).split(String.fromCharCode(13)).join(' ').split(String.fromCharCode(10)).join(' ').split(',').join(slash+',').split(';').join(slash+';');
const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HR Tech//Interview//VI','METHOD:REQUEST','BEGIN:VEVENT','UID:'+ctx.evaluationId+'@hrtech', 'DTSTAMP:'+fmt(new Date().toISOString()),'DTSTART:'+fmt(plan.start),'DTEND:'+fmt(plan.end),'SUMMARY:'+clean('Phỏng vấn '+ctx.jobTitle),'LOCATION:'+clean(location),'STATUS:CONFIRMED','SEQUENCE:0','END:VEVENT','END:VCALENDAR'].join(String.fromCharCode(13,10));
const binary=await this.helpers.prepareBinaryData(Buffer.from(ics),'interview.ics','text/calendar');
return [{json:{ctx,subject:'Thư mời phỏng vấn – '+ctx.jobTitle,html:'<p>Chào '+esc(ctx.candidateName)+',</p><p>Thời gian: '+esc(new Date(plan.start).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}))+'</p><p>'+esc(location)+'</p><p><a href="'+esc(ctx.rsvpUrl)+'">Xác nhận hoặc đề nghị dời lịch</a></p>',metadata:{time:plan.start,type:plan.type,googleMeetUrl:result.meetUrl||null,isRealGoogleMeet:!!result.meetUrl,googleCalendarEventId:result.eventId||null}},binary:{calendar:binary}}];`,{onError:'continueErrorOutput'});
 } else {
  code('Build Talent Pool Feedback',esc+`const ctx=$('Claim Approved Delivery').first().json;const allowed=['CV_SCREENING','POST_INTERVIEW','TECHNICAL_TEST','CULTURE_FIT','TOP_TALENT'];const scenario=allowed.includes(ctx.options.stage)?ctx.options.stage:'CV_SCREENING';const reEngagementDate=new Date(Date.now()+180*86400000).toISOString().slice(0,10);
return [{json:{ctx,subject:'Phản hồi hồ sơ ứng tuyển – '+ctx.jobTitle,html:'<p>Chào '+esc(ctx.candidateName)+',</p><p>Cảm ơn bạn đã ứng tuyển '+esc(ctx.jobTitle)+'. Sau khi xem xét, bộ phận tuyển dụng hiện chưa tiếp tục hồ sơ cho vị trí này. Chúng tôi trân trọng thời gian và sự quan tâm của bạn.</p><p>Nếu bạn đồng ý lưu hồ sơ, HR có thể liên hệ khi có cơ hội phù hợp.</p><p><a href="'+esc(ctx.cxUrl)+'">Đánh giá trải nghiệm tuyển dụng</a></p>',metadata:{tier:'RETAINED_TALENT_POOL',scenario,reEngagementDate}}}];`);
 }
 const build=number===5?'Build Invitation and ICS':'Build Talent Pool Feedback';
 add('Send Candidate Email','emailSend',{fromEmail:mail.parameters.fromEmail,toEmail:'={{ $json.ctx.candidateEmail }}',subject:'={{ $json.subject }}',emailFormat:'html',html:'={{ $json.html }}',options:number===5?{attachments:'calendar'}:{}},
  {credentials:mail.credentials,onError:'continueRegularOutput'});
 code('Inspect SMTP Outcome',`const packet=$('${build}').first().json;const accepted=$json.accepted;const ok=!$json.error&&Array.isArray(accepted)&&accepted.some(e=>String(e).toLowerCase()===packet.ctx.candidateEmail.toLowerCase());return [{json:{ctx:packet.ctx,status:ok?'SENT':'FAILED',metadata:packet.metadata}}];`);
 code('Prepare Delivery Failure',`const ctx=$('Claim Approved Delivery').first().json;return [{json:{ctx,status:'FAILED',metadata:{errorCode:'PROVIDER_OR_PROCESSING_FAILED'}}}];`);
 api('Record Actual Delivery',"/recruitment/evaluations/{{ $json.ctx.evaluationId }}/delivery",`={{ {action:${JSON.stringify(action)},status:$json.status,metadata:$json.metadata} }}`,{retryOnFail:true,maxTries:3,waitBetweenTries:2000});
 response('Reject Unauthorized or Unavailable',503,'={{ {error:"DELIVERY_CLAIM_REJECTED_OR_UNAVAILABLE"} }}');
 for(const [a,b] of [['Receive Approved Action','Validate Request'],['Validate Request','Request Valid?'],['Request Valid?','Claim Approved Delivery'],['Claim Approved Delivery','Delivery Claimed?'],['Delivery Claimed?','Accept Delivery']])edge(a,b);
 edge('Request Valid?','Reject Request',1);edge('Claim Approved Delivery','Reject Unauthorized or Unavailable',1);edge('Delivery Claimed?','Already Handled',1);
 if(number===5){edge('Accept Delivery','Plan Interview');edge('Plan Interview','Online Interview?');edge('Plan Interview','Prepare Delivery Failure',1);
  edge('Online Interview?','Create Google Calendar and Meet');edge('Online Interview?',build,1);edge('Create Google Calendar and Meet','Validate Calendar Result');edge('Validate Calendar Result','Calendar Confirmed?');edge('Calendar Confirmed?',build);edge('Calendar Confirmed?','Prepare Delivery Failure',1);edge(build,'Prepare Delivery Failure',1);
 } else edge('Accept Delivery',build);
 edge(build,'Send Candidate Email');edge('Send Candidate Email','Inspect SMTP Outcome');edge('Inspect SMTP Outcome','Record Actual Delivery');edge('Prepare Delivery Failure','Record Actual Delivery');
 const wf={id:old.id,name:`[HR] WF_0${number} - Approved ${action} & Verified Delivery`,active:false,nodes,connections,
  settings:{executionOrder:'v1',saveDataErrorExecution:'all',saveDataSuccessExecution:'all',saveManualExecutions:true,saveExecutionProgress:true,executionTimeout:180}};
 for(const folder of ['n8n/workflows','workflows'])fs.writeFileSync(path.join(root,folder,file),JSON.stringify(wf,null,2)+'\n');
 console.log(`Generated WF_0${number}: ${nodes.length} nodes`);
}
