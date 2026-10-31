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
   code('Build Invitation and ICS',esc+`const plan=$('Plan Interview').first().json;const ctx=plan.ctx;const result=plan.online?$json:{};const location=plan.online?result.meetUrl:'Bộ phận Tuyển dụng sẽ liên hệ xác nhận địa điểm phỏng vấn trực tiếp.';
const fmt=s=>s.replace(/[-:]/g,'').split('.')[0]+'Z';const slash=String.fromCharCode(92);const clean=s=>String(s).split(slash).join(slash+slash).split(String.fromCharCode(13)).join(' ').split(String.fromCharCode(10)).join(' ').split(',').join(slash+',').split(';').join(slash+';');
const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HR Tech//Interview//VI','METHOD:REQUEST','BEGIN:VEVENT','UID:'+ctx.evaluationId+'@hrtech', 'DTSTAMP:'+fmt(new Date().toISOString()),'DTSTART:'+fmt(plan.start),'DTEND:'+fmt(plan.end),'SUMMARY:'+clean('Phỏng vấn '+ctx.jobTitle),'LOCATION:'+clean(location),'STATUS:CONFIRMED','SEQUENCE:0','END:VEVENT','END:VCALENDAR'].join(String.fromCharCode(13,10));
const binary=await this.helpers.prepareBinaryData(Buffer.from(ics),'interview.ics','text/calendar');
const formattedDate=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(new Date(plan.start));
const timeFormat=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',hour12:false});
const formattedTime=timeFormat.format(new Date(plan.start))+' – '+timeFormat.format(new Date(plan.end))+' (giờ Việt Nam, UTC+7)';
const isOnline=plan.online&&!!result.meetUrl;
const meetBlock=isOnline?'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;font-weight:600;color:#475569;width:140px;">Phòng Google Meet:</td><td style="padding:12px 16px;"><a href="'+esc(result.meetUrl)+'" style="color:#2563eb;font-weight:700;text-decoration:underline;word-break:break-all;">'+esc(result.meetUrl)+'</a></td></tr>':'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;font-weight:600;color:#475569;width:140px;">Địa điểm:</td><td style="padding:12px 16px;color:#1e293b;font-weight:600;">'+esc(location)+'</td></tr>';
const html='<div style="font-family:-apple-system,BlinkMacSystemFont,\\\'Segoe UI\\\',Roboto,Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">'
  +'<div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 24px;text-align:center;color:#ffffff;">'
  +'<div style="display:inline-block;padding:4px 14px;background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.4);border-radius:9999px;font-size:11px;font-weight:700;letter-spacing:1px;color:#60a5fa;text-transform:uppercase;margin-bottom:12px;">UPCAREER</div>'
  +'<h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1.3;">THƯ MỜI PHỎNG VẤN '+(isOnline?'TRỰC TUYẾN':'TRỰC TIẾP')+'</h1>'
  +'<p style="margin:8px 0 0 0;font-size:14px;color:#94a3b8;">Vị trí ứng tuyển: <strong style="color:#f8fafc;">'+esc(ctx.jobTitle)+'</strong></p>'
  +'</div>'
  +'<div style="padding:32px 28px;color:#1e293b;line-height:1.6;">'
  +'<p style="font-size:15px;margin:0 0 16px 0;">Kính gửi Anh/Chị <strong>'+esc(ctx.candidateName)+'</strong>,</p>'
  +'<p style="font-size:14px;color:#334155;margin:0 0 24px 0;">Cảm ơn Anh/Chị đã quan tâm và ứng tuyển vị trí <strong>'+esc(ctx.jobTitle)+'</strong>. Bộ phận Tuyển dụng UpCareer trân trọng mời Anh/Chị tham gia buổi phỏng vấn để trao đổi thêm về kinh nghiệm chuyên môn, yêu cầu công việc và định hướng hợp tác.</p>'
  +'<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">'
  +'<div style="background:#f1f5f9;padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;">Thông tin buổi phỏng vấn</div>'
  +'<table style="width:100%;border-collapse:collapse;font-size:14px;text-align:left;">'
  +'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;font-weight:600;color:#475569;width:140px;">Thời gian:</td><td style="padding:12px 16px;color:#0f172a;font-weight:600;">'+esc(formattedTime)+'<br><span style="color:#64748b;font-size:13px;font-weight:500;">'+esc(formattedDate)+'</span></td></tr>'
  +'<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;font-weight:600;color:#475569;">Hình thức:</td><td style="padding:12px 16px;color:#0f172a;font-weight:600;">'+(isOnline?'Phỏng vấn trực tuyến qua Google Meet':'Phỏng vấn trực tiếp tại văn phòng')+'</td></tr>'
  +meetBlock
  +'<tr><td style="padding:12px 16px;font-weight:600;color:#475569;">File đính kèm:</td><td style="padding:12px 16px;color:#059669;font-weight:600;font-size:13px;">interview.ics — Anh/Chị có thể mở tệp đính kèm để thêm lịch hẹn vào ứng dụng lịch cá nhân.</td></tr>'
  +'</table></div>'
  +'<div style="text-align:center;margin:30px 0 24px 0;">'
  +'<a href="'+esc(ctx.rsvpUrl)+'" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:8px;box-shadow:0 4px 6px -1px rgba(37,99,235,0.3);letter-spacing:0.3px;">Xác nhận tham gia / Đề nghị đổi lịch</a>'
  +'<p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">Kính đề nghị Anh/Chị xác nhận khả năng tham dự qua liên kết trên. Nếu cần thay đổi lịch, vui lòng gửi đề nghị để Bộ phận Tuyển dụng liên hệ sắp xếp.</p>'
  +'</div>'
  +'<div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 16px;border-radius:4px 8px 8px 4px;margin-bottom:24px;">'
  +'<div style="font-weight:700;font-size:13px;color:#1e40af;margin-bottom:4px;">Thông tin chuẩn bị:</div>'
  +'<ul style="margin:0;padding-left:20px;font-size:13px;color:#1e3a8a;line-height:1.5;">'
  +(isOnline?'<li>Anh/Chị vui lòng kiểm tra camera, micro và kết nối mạng trước giờ hẹn khoảng 5–10 phút.</li><li>Chuẩn bị không gian yên tĩnh, phù hợp cho buổi trao đổi trực tuyến.</li>':'<li>Anh/Chị vui lòng kiểm tra địa điểm và thông tin hướng dẫn đã được Bộ phận Tuyển dụng xác nhận.</li>')
  +'<li>Chuẩn bị nội dung trao đổi về kinh nghiệm và các dự án có liên quan; không chia sẻ tài liệu bảo mật của đơn vị khác.</li>'
  +'</ul></div>'
  +'<p style="font-size:14px;color:#334155;margin:0 0 4px 0;">Trân trọng,</p>'
  +'<p style="font-size:14px;font-weight:700;color:#0f172a;margin:0;">Bộ phận Tuyển dụng UpCareer</p>'
  +'<p style="font-size:12px;color:#64748b;margin:2px 0 0 0;">cvresources.tech</p>'
  +'</div>'
  +'<div style="background:#f1f5f9;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">'
  +'Nếu cần hỗ trợ, Anh/Chị vui lòng liên hệ Bộ phận Tuyển dụng qua upcareercvresources@gmail.com.'
  +'</div></div>';
return [{json:{ctx,subject:'[UpCareer] Thư mời phỏng vấn | '+ctx.jobTitle,html,metadata:{time:plan.start,type:plan.type,googleMeetUrl:result.meetUrl||null,isRealGoogleMeet:!!result.meetUrl,googleCalendarEventId:result.eventId||null}},binary:{calendar:binary}}];`,{onError:'continueErrorOutput'});
 } else {
  code('Build Talent Pool Feedback',esc+`const ctx=$('Claim Approved Delivery').first().json;const allowed=['CV_SCREENING','POST_INTERVIEW','TECHNICAL_TEST','CULTURE_FIT','TOP_TALENT'];const scenario=allowed.includes(ctx.options.stage)?ctx.options.stage:'CV_SCREENING';const reEngagementDate=new Date(Date.now()+180*86400000).toISOString().slice(0,10);
const isRejection=ctx.options.decision==='REJECT';
const futureTitle=isRejection?'Thông tin hỗ trợ':'Cơ hội kết nối trong tương lai';
const futureText=(isRejection?'':'Chúng tôi mong có cơ hội kết nối với Anh/Chị khi có vị trí phù hợp trong tương lai. ')+'Nếu có yêu cầu liên quan đến việc lưu giữ, cập nhật hoặc xóa hồ sơ, Anh/Chị vui lòng liên hệ upcareercvresources@gmail.com để được hỗ trợ.';
const stageThanks={
 CV_SCREENING:'Cảm ơn Anh/Chị đã gửi hồ sơ và quan tâm đến cơ hội làm việc cùng chúng tôi.',
 POST_INTERVIEW:'Cảm ơn Anh/Chị đã dành thời gian tham gia buổi phỏng vấn và trao đổi cùng đội ngũ tuyển dụng.',
 TECHNICAL_TEST:'Cảm ơn Anh/Chị đã dành thời gian tham gia bài đánh giá chuyên môn trong quy trình tuyển dụng.',
 CULTURE_FIT:'Cảm ơn Anh/Chị đã dành thời gian trao đổi về cách thức làm việc và định hướng nghề nghiệp.',
 TOP_TALENT:'Cảm ơn Anh/Chị đã quan tâm và tham gia quy trình tuyển dụng của chúng tôi.'
}[scenario];
const html='<div style="font-family:-apple-system,BlinkMacSystemFont,\\\'Segoe UI\\\',Roboto,Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">'
  +'<div style="background:linear-gradient(135deg,#0f172a 0%,#334155 100%);padding:36px 24px;text-align:center;color:#ffffff;">'
  +'<div style="display:inline-block;padding:4px 14px;background:rgba(148,163,184,0.2);border:1px solid rgba(148,163,184,0.4);border-radius:9999px;font-size:11px;font-weight:700;letter-spacing:1px;color:#cbd5e1;text-transform:uppercase;margin-bottom:12px;">UPCAREER</div>'
  +'<h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1.3;">THÔNG BÁO KẾT QUẢ ỨNG TUYỂN</h1>'
  +'<p style="margin:8px 0 0 0;font-size:14px;color:#94a3b8;">Vị trí ứng tuyển: <strong style="color:#f8fafc;">'+esc(ctx.jobTitle)+'</strong></p>'
  +'</div>'
  +'<div style="padding:32px 28px;color:#1e293b;line-height:1.6;">'
  +'<p style="font-size:15px;margin:0 0 16px 0;">Kính gửi Anh/Chị <strong>'+esc(ctx.candidateName)+'</strong>,</p>'
  +'<p style="font-size:14px;color:#334155;margin:0 0 16px 0;">'+esc(stageThanks)+'</p>'
  +'<p style="font-size:14px;color:#334155;margin:0 0 20px 0;">Sau khi xem xét theo yêu cầu tuyển dụng hiện tại, chúng tôi rất tiếc chưa thể tiếp tục quy trình ứng tuyển của Anh/Chị cho vị trí này. Kết quả được đưa ra trong phạm vi đợt tuyển dụng và không phải là đánh giá tổng thể về năng lực của Anh/Chị.</p>'
  +'<div style="background:#fefce8;border:1px solid #fef08a;border-radius:12px;padding:18px 20px;margin-bottom:24px;">'
  +'<div style="font-weight:700;font-size:13px;color:#854d0e;margin-bottom:6px;">' +esc(futureTitle)+'</div>'
  +'<p style="margin:0;font-size:13px;color:#713f12;line-height:1.5;">' +esc(futureText)+'</p>'
  +'</div>'
  +'<div style="text-align:center;margin:28px 0 24px 0;">'
  +'<a href="'+esc(ctx.cxUrl)+'" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#047857 100%);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:8px;box-shadow:0 4px 6px -1px rgba(5,150,105,0.3);">Chia sẻ trải nghiệm tuyển dụng</a>'
  +'<p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">Phản hồi là hoàn toàn tự nguyện và giúp chúng tôi cải thiện quy trình tuyển dụng.</p>'
  +'</div>'
  +'<p style="font-size:14px;color:#334155;margin:0 0 4px 0;">Trân trọng,</p>'
  +'<p style="font-size:14px;font-weight:700;color:#0f172a;margin:0;">Bộ phận Tuyển dụng UpCareer</p>'
  +'<p style="font-size:12px;color:#64748b;margin:2px 0 0 0;">cvresources.tech</p>'
  +'</div>'
  +'<div style="background:#f1f5f9;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">'
  +'Cảm ơn Anh/Chị. Kính chúc Anh/Chị nhiều thành công trong công việc và định hướng nghề nghiệp.'
  +'</div></div>';
return [{json:{ctx,subject:'[UpCareer] Thông báo kết quả ứng tuyển | '+ctx.jobTitle,html,metadata:{scenario,...(isRejection?{status:'REJECTED'}:{tier:'RETAINED_TALENT_POOL',reEngagementDate})}}}];`);
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
