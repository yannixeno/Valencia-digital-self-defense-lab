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
  assert.match(source,/if\(action==='reveal'&&checks.length\)/);
});
