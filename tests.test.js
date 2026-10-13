import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {scenarios,choices} from './scenarios.js';
test('Every story scene has complete reflection and reveal content',()=>{
  assert.ok(scenarios.length>=5);assert.equal(new Set(scenarios.map(s=>s.id)).size,scenarios.length);
  for(const s of scenarios){assert.match(s.id,/^[a-z0-9-]+$/);assert.ok(choices[s.answer]);assert.ok(s.flags.length);assert.ok(s.check.length);assert.ok(s.protect);if(s.url)assert.ok(s.url.endsWith('.example'))}
});
test('Application has no credential entry fields or response transmission',async()=>{
  const source=await readFile('app.js','utf8');
  assert.doesNotMatch(source,/type=["'](?:password|email|text)["']/);
  assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket)\b/);
  assert.doesNotMatch(source,/localStorage|sessionStorage/);
  assert.match(source,/b.dataset.action==='reflect'&&choice&&inspected.size/);
  assert.match(source,/b.dataset.action==='reveal'&&reflections.size/);
  assert.match(source,/b.dataset.action==='done'&&actionIndex!==null/);
  assert.match(source,/let stage='inspect'/); assert.doesNotMatch(source,/reveal\|\|inspected.has/);
});
test('Every workshop item has facilitator details and explained practical choices',()=>{
  for(const s of scenarios){assert.ok(s.label&&s.question&&s.clue&&s.time);assert.equal(s.actions.filter(a=>a[1]).length,1);assert.ok(s.actions.length>=3);for(const a of s.actions)assert.ok(a[0]&&a[2]);assert.ok(Array.isArray(s.recovery));if(s.answer==='suspicious')assert.ok(s.recovery.length)}
});

test('Workshop includes legitimate context and independent event verification',()=>{assert.ok(scenarios.some(s=>s.answer==='safe'));assert.ok(scenarios.some(s=>s.answer==='more'));const expected=scenarios.find(s=>s.id==='expected-sign-in');assert.equal(expected.matchingNumber,'42');assert.ok(scenarios.find(s=>s.id==='club-announcement').calendar)});

test('Direct entry and full decision flow render without an intro or answer leak',async()=>{
 const {runInNewContext}=await import('node:vm'); const handlers={};let html='';
 const app={set innerHTML(value){html=value},get innerHTML(){return html},querySelectorAll(){return []},querySelector(){return null},addEventListener(name,fn){handlers[name]=fn}};
 const source=(await readFile('app.js','utf8')).replace(/import .*?;\r?\n/,'');
 let reflectButton={disabled:true},revealButton={disabled:true},doneButton={disabled:true};app.querySelector=selector=>selector.includes('reflect')?reflectButton:selector.includes('reveal')?revealButton:selector.includes('done')?doneButton:null;
 const sandbox={scenarios,choices,document:{querySelector(selector){return selector==='#app'?app:null}},location:{pathname:'/challenge/club-announcement',origin:'https://workshop.example'},window:{addEventListener(){},scrollTo(){}},history:{pushState(){}}};
 runInNewContext(source,sandbox);assert.match(html,/Campus calendar/);assert.doesNotMatch(html,/Open this item|Treat this as suspicious|data-warning/);
 const click=dataset=>handlers.click({target:{closest(selector){return selector==='button'?{dataset,disabled:false}:null}}});
 click({choice:'more'});click({action:'reflect'});assert.doesNotMatch(html,/What would you check/);
 handlers.toggle({target:{matches(selector){return selector==='details[data-clue]'},open:true,dataset:{clue:'calendar'}}});
 click({action:'reflect'});assert.match(html,/What would you check/);click({action:'reveal'});assert.doesNotMatch(html,/data-warning/);
 handlers.change({target:{matches(){return true},value:'0',checked:true}});click({action:'reveal'});assert.match(html,/data-warning/);
 click({action:'act'});assert.match(html,/What would you actually do/);click({action:'done'});assert.doesNotMatch(html,/YOUR TAKE-HOME HABIT/);
 click({practical:'0'});click({action:'done'});assert.match(html,/YOUR TAKE-HOME HABIT/);
 for(const item of scenarios){sandbox.location.pathname='/challenge/'+item.id;runInNewContext(source,{...sandbox});assert.doesNotMatch(html,/undefined|Open this item/);assert.match(html,/data-clue/)}
});

test('Story is complete, sequenced and links each scene to the next',async()=>{
 assert.equal(scenarios[0].id,'expected-sign-in');assert.equal(scenarios.at(-1).id,'club-announcement');
 const source=(await readFile('app.js','utf8')).replace(/import .*?;\r?\n/,'');const {runInNewContext}=await import('node:vm');let html='';
 const app={set innerHTML(value){html=value},querySelectorAll(){return []},querySelector(){return null},addEventListener(){}};
 for(let i=0;i<scenarios.length;i++){
 const scene=scenarios[i];for(const field of ['storyTime','chapter','intro','bridge'])assert.ok(scene[field]);
 const sandbox={scenarios,choices,document:{querySelector(selector){return selector==='#app'?app:null}},location:{pathname:'/challenge/'+scene.id,origin:'https://workshop.example'},window:{addEventListener(){},scrollTo(){}},history:{pushState(){}}};
 runInNewContext(source+";stage='done';actionIndex=0;render();",sandbox);
 assert.match(html,new RegExp('Moment '+(i+1)+' of '+scenarios.length));assert.ok(html.includes(scene.bridge));
 assert.ok(html.includes(i<scenarios.length-1?'href=\"/challenge/'+scenarios[i+1].id+'/\"':'href=\"/complete\"'));
 assert.doesNotMatch(html,/scan another|Scan a workshop/);
 }
});

test('Preview actions stay separate from verdicts and preserve privacy',async()=>{
 const {runInNewContext}=await import('node:vm');const handlers={};let html='';const notice={textContent:''};
 const app={set innerHTML(value){html=value},querySelectorAll(){return []},querySelector(selector){return selector==='.preview-notice'?notice:null},addEventListener(name,fn){handlers[name]=fn}};
 const source=(await readFile('app.js','utf8')).replace(/import .*?;\r?\n/,'');const sandbox={scenarios,choices,document:{querySelector(selector){return selector==='#app'?app:null}},location:{pathname:'/challenge/expected-sign-in',origin:'https://workshop.example'},window:{addEventListener(){},scrollTo(){}},history:{pushState(){}}};runInNewContext(source,sandbox);
 const click=dataset=>handlers.click({target:{closest(selector){return selector==='button'?{dataset,disabled:false}:null}}});
 assert.match(html,/arriving/);click({preview:'approve'});assert.match(notice.textContent,/No real sign-in/);assert.doesNotMatch(html,/YOUR TAKE-HOME HABIT|data-warning/);
 click({preview:'replay'});assert.match(html,/arriving/);assert.match(html,/What do you notice/);
 sandbox.location.pathname='/challenge/confirmed-class-update';runInNewContext(source,{...sandbox});click({mail:'course'});assert.match(html,/SEPARATE SAMPLE/);assert.match(html,/Room 204/);assert.doesNotMatch(html,/data-warning/);click({mail:'scenario'});assert.match(html,/Morgan/);click({preview:'delete'});assert.match(notice.textContent,/no real email was deleted/);
 const css=await readFile('workshop.css','utf8');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/notification-arrive/);
});

// Exercise the real app handlers without introducing a browser dependency into the static project.
async function branchHarness(id,basePath=''){
 const {runInNewContext}=await import('node:vm');const handlers={};let html='';
 const button={disabled:false,focus(){}};
 const app={set innerHTML(value){html=value},querySelectorAll(selector){if(selector!=='[data-route]')return [];return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*data-route[^>]*>/g)].map(match=>{let href=match[1];return {dataset:{},getAttribute(){return href},setAttribute(name,value){html=html.replace('href="'+href+'"','href="'+value+'"');href=value}}})},querySelector(){return button},addEventListener(name,fn){handlers[name]=fn}};
 const source=(await readFile('app.js','utf8')).replace(/import .*?;\r?\n/,'');
 const context={scenarios,choices,document:{querySelector(selector){return selector==='#app'?app:selector==='meta[name=app-base]'?{content:basePath}:null}},location:{pathname:basePath+'/challenge/'+id,origin:'https://workshop.example'},window:{addEventListener(){},scrollTo(){}},history:{pushState(){}}};
 runInNewContext(source,context);
 return {html:()=>html,click:dataset=>handlers.click({target:{closest(selector){return selector==='button'?{dataset,disabled:false}:null}}}),reflect(){handlers.change({target:{matches(){return true},value:'0',checked:true}})},inspect(key='link'){handlers.toggle({target:{matches(selector){return selector==='details[data-clue]'},open:true,dataset:{clue:key}}})}};
}
test('Optional branch graphs have valid transitions, safe previews, and reachable endings',()=>{
 for(const s of scenarios.filter(s=>s.interaction)){
  const graph=s.interaction;assert.ok(graph.steps[graph.start]);assert.equal(graph.steps[graph.start].view,'original');
  const reachable=new Set(),visit=id=>{if(reachable.has(id))return;reachable.add(id);const step=graph.steps[id];assert.ok(step.title);assert.ok(Array.isArray(step.actions));assert.equal(new Set(step.actions.map(a=>a.id)).size,step.actions.length);if(step.resolved)assert.ok(step.review);for(const a of step.actions){assert.ok(a.label);assert.ok(graph.steps[a.next],s.id+': '+a.next);visit(a.next)}};visit(graph.start);
  assert.equal(reachable.size,Object.keys(graph.steps).length,s.id+' has unreachable steps');assert.ok([...reachable].some(id=>graph.steps[id].review));
  // Every reachable node has a path to a learning endpoint, including recovery branches.
  const canFinish=id=>{const seen=new Set(),queue=[id];while(queue.length){const at=queue.shift();if(seen.has(at))continue;seen.add(at);if(graph.steps[at].review)return true;queue.push(...graph.steps[at].actions.map(a=>a.next))}return false};for(const id of reachable)assert.ok(canFinish(id),s.id+': '+id);
  const serialized=JSON.stringify(graph);assert.doesNotMatch(serialized,/https?:\/\//);assert.ok(graph.facilitator.points&&graph.facilitator.unsafe&&graph.facilitator.safe&&graph.facilitator.question);
 }
});
test('Unexpected approval unfolds into an alert and actionable recovery, without duplicate verdicts',async()=>{
 const h=await branchHarness('mfa-request');assert.doesNotMatch(h.html(),/Password changed successfully/);
 h.click({branch:'approve'});assert.match(h.html(),/Sign-in approved · simulation/);assert.doesNotMatch(h.html(),/Password changed successfully/);
 h.click({branch:'next'});assert.match(h.html(),/Password changed successfully/);h.click({branch:'ignore'});assert.match(h.html(),/unfamiliar sign-in remains/);h.click({branch:'security'});h.click({branch:'change'});assert.match(h.html(),/Account secured in this simulation/);
 h.click({action:'branch-done'});assert.doesNotMatch(h.html(),/YOUR TAKE-HOME HABIT/);h.click({action:'branch-reflect'});assert.doesNotMatch(h.html(),/You chose <strong>/);h.click({action:'reveal'});assert.doesNotMatch(h.html(),/data-warning/);h.reflect();h.click({action:'reveal'});assert.match(h.html(),/data-warning/);assert.doesNotMatch(h.html(),/Decide what I’d actually do/);h.click({action:'branch-done'});assert.match(h.html(),/YOUR TAKE-HOME HABIT/);assert.match(h.html(),/Change the password and sign out other sessions/);
});
test('Denying an unexpected request leads to activity checking, not another approval question',async()=>{
 const h=await branchHarness('mfa-request');h.click({preview:'deny'});assert.match(h.html(),/Request denied/);h.click({branch:'check'});h.click({action:'branch-reflect'});assert.doesNotMatch(h.html(),/You chose <strong>|data-choice=/);assert.match(h.html(),/What would you check/);
});
test('Lunch and internship disclose sensitive requests only as the student progresses',async()=>{
 const lunch=await branchHarness('qr-free-food');assert.doesNotMatch(lunch.html(),/College sign-in is required|Sign in to claim your meal|fixed demo identity/);lunch.click({branch:'claim'});assert.match(lunch.html(),/College sign-in is required/);lunch.click({branch:'continue'});assert.match(lunch.html(),/fixed demo identity/);lunch.click({branch:'signin'});assert.match(lunch.html(),/Before entering anything/);lunch.click({branch:'inspect'});assert.match(lunch.html(),/does not make valencia-meals/);lunch.click({branch:'stop'});assert.match(lunch.html(),/You checked the offer independently/);
 const job=await branchHarness('internship-offer');assert.doesNotMatch(job.html(),/No interview is required|\$2,400|\$600/);job.click({branch:'more'});assert.match(job.html(),/No interview is required/);assert.doesNotMatch(job.html(),/\$2,400|\$600/);job.click({branch:'continue'});assert.match(job.html(),/\$2,400/);assert.doesNotMatch(job.html(),/\$600/);job.click({branch:'continue'});assert.match(job.html(),/\$600/);job.click({branch:'send'});assert.match(job.html(),/sample check is later rejected/);job.click({branch:'bank'});assert.match(job.html(),/Bank contacted/);
});
test('Jamie self-confirmation is distinct from a saved-number call; sent codes permit recovery',async()=>{
 const h=await branchHarness('social-message');h.click({branch:'ask'});assert.match(h.html(),/yeah lol it’s me/);assert.match(h.html(),/does not independently establish/);h.click({branch:'send'});assert.match(h.html(),/thanks!! you’re the best/);assert.match(h.html(),/YOUR account/);h.click({branch:'change'});assert.match(h.html(),/Account secured/);
 const call=await branchHarness('social-message');call.click({branch:'call'});assert.match(call.html(),/That isn’t my account/);call.click({branch:'report'});assert.match(call.html(),/Code kept private/);
});
test('Branch controls reject stale/unknown actions and reset on direct entry',async()=>{
 const h=await branchHarness('mfa-request');const initial=h.html();h.click({branch:'not-a-step'});assert.equal(h.html(),initial);h.click({branch:'approve'});const approved=h.html();h.click({branch:'deny'});assert.equal(h.html(),approved);
 assert.equal((await branchHarness('mfa-request')).html(),initial);
});

test('Login, password email, and delivery have an exploratory bad path and independent exits',async()=>{
 const login=await branchHarness('fake-login');login.click({branch:'signin'});assert.match(login.html(),/Before entering anything, take another look/);assert.match(login.html(),/domain-callout/);login.click({branch:'address'});assert.match(login.html(),/A Teams link brought you here/);login.click({branch:'back'});assert.match(login.html(),/data-branch="signin"/);login.click({branch:'official'});assert.match(login.html(),/Official app opened independently/);
 const email=await branchHarness('password-reset');assert.match(email.html(),/college-mail-header/);email.click({branch:'open'});assert.match(email.html(),/Keep your account active · sample sign-in/);assert.match(email.html(),/college-mail-header/);email.click({branch:'back'});assert.match(email.html(),/Your password expires/);email.click({branch:'portal'});assert.match(email.html(),/College portal opened independently/);
 const parcel=await branchHarness('package-delivery');assert.doesNotMatch(parcel.html(),/Card number|Expiration date|CVV/);parcel.click({branch:'open'});assert.match(parcel.html(),/PACKAGE ON HOLD/);assert.doesNotMatch(parcel.html(),/Card number/);parcel.click({branch:'schedule'});for(const field of ['Name','Address','Card number','Expiration date','CVV'])assert.ok(parcel.html().includes(field));assert.doesNotMatch(parcel.html(),/<input|<textarea|<select/);parcel.click({branch:'continue'});assert.match(parcel.html(),/no payment was made/);parcel.click({branch:'order'});assert.match(parcel.html(),/Original order checked/);
});
test('Every branch action can be exercised from its reachable state without exposing editable personal fields',async()=>{
 for(const s of scenarios.filter(s=>s.interaction)){
  const paths=new Map([[s.interaction.start,[]]]),queue=[s.interaction.start];while(queue.length){const id=queue.shift();for(const a of s.interaction.steps[id].actions){if(!paths.has(a.next)){paths.set(a.next,[...paths.get(id),a.id]);queue.push(a.next)}}}
  for(const [id,path] of paths){for(const action of s.interaction.steps[id].actions){const h=await branchHarness(s.id);for(const move of path)h.click({branch:move});assert.ok(h.html().includes('data-branch="'+action.id+'"'),s.id+': '+id+' must offer '+action.id);h.click({branch:action.id});assert.doesNotMatch(h.html(),/<input|<textarea|<select|<form/);assert.doesNotMatch(h.html(),/undefined/);assert.match(h.html(),/FICTIONAL SIMULATION|EDUCATIONAL PREVIEW/);}}
 }
});
test('Pages-prefixed branch URLs and facilitator notes preserve existing routes and safe scenarios',async()=>{
 const h=await branchHarness('qr-free-food','/Valencia-digital-self-defense-lab');h.click({branch:'staff'});h.click({action:'branch-reflect'});h.reflect();h.click({action:'reveal'});h.click({action:'branch-done'});assert.match(h.html(),/A DAY AT VALENCIA/);assert.match(h.html(),/href="\/Valencia-digital-self-defense-lab\/challenge\/fake-login\/"/);
 for(const id of ['expected-sign-in','confirmed-class-update','club-announcement']){assert.equal(scenarios.find(s=>s.id===id).interaction,undefined);const safe=await branchHarness(id);assert.match(safe.html(),/What do you notice/);assert.doesNotMatch(safe.html(),/data-branch=/);}
 const {runInNewContext}=await import('node:vm');let html='';const source=(await readFile('app.js','utf8')).replace(/import .*?;\r?\n/,'');const app={set innerHTML(v){html=v},querySelectorAll(){return []},querySelector(){return null},addEventListener(){}};runInNewContext(source,{scenarios,choices,document:{querySelector:q=>q==='#app'?app:q==='meta[name=app-base]'?{content:'/repo'}:null},location:{pathname:'/repo/facilitator',origin:'https://workshop.example'},window:{addEventListener(){}},history:{}});assert.equal((html.match(/Interactive path notes/g)||[]).length,7);for(const s of scenarios){assert.ok(html.includes('/repo/challenge/'+s.id+'/'));assert.ok(html.includes(s.question));}
});

test('Email branch consequences restore the scenario pane after browsing unrelated sample mail',async()=>{
 const h=await branchHarness('internship-offer');h.click({mail:'course'});assert.match(h.html(),/SEPARATE SAMPLE/);h.click({branch:'verify'});assert.match(h.html(),/Career center check · simulation/);assert.doesNotMatch(h.html(),/SEPARATE SAMPLE/);
});

test('Previous-step navigation follows the shorter branch lesson and an explicit verdict can restore the original flow',async()=>{
 const h=await branchHarness('mfa-request');h.click({branch:'deny'});h.click({branch:'check'});h.click({action:'branch-reflect'});h.reflect();h.click({action:'reveal'});h.click({action:'branch-done'});h.click({action:'previous'});assert.match(h.html(),/data-warning/);assert.doesNotMatch(h.html(),/What would you actually do/);h.click({action:'previous'});assert.match(h.html(),/What would you check/);h.click({action:'previous'});h.inspect('context');h.click({choice:'suspicious'});h.click({action:'reflect'});assert.match(h.html(),/You chose <strong>Suspicious/);h.reflect();h.click({action:'reveal'});assert.match(h.html(),/Decide what I’d actually do/);
});
