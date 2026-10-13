import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {scenarios,choices} from './scenarios.js';
test('Every QR destination has complete reflection and reveal content',()=>{
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
});
test('Every workshop item has facilitator details and explained practical choices',()=>{
  for(const s of scenarios){assert.ok(s.label&&s.question&&s.clue&&s.time);assert.equal(s.actions.filter(a=>a[1]).length,1);assert.ok(s.actions.length>=3);for(const a of s.actions)assert.ok(a[0]&&a[2]);assert.ok(Array.isArray(s.recovery));if(s.answer==='suspicious')assert.ok(s.recovery.length)}
});
