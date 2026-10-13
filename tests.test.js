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
