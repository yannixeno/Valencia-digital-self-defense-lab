import http from 'node:http';
import {readFile} from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const allowed = new Set(['index.html','app.js','scenarios.js','styles.css','workshop.css','campus3d.js']);
const mime = {html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml'};
http.createServer(async (req,res)=>{
  const path = new URL(req.url,'http://localhost').pathname.replace(/\/$/,'') || '/';
  const name = path === '/' || path.startsWith('/challenge/') || ['/complete','/facilitator','/cards'].includes(path) ? 'index.html' : path.slice(1);
  if (!allowed.has(name) && !/^qr\/[a-z0-9-]+\.svg$/.test(name) && !/^vendor\/(three\.module\.js|three\.core\.js|THREE-LICENSE\.txt)$/.test(name)) {res.writeHead(404);res.end('Not found');return;}
  try {const body=await readFile(new URL(name,root));res.writeHead(200,{'Content-Type':mime[name.split('.').pop()]+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);} catch {res.writeHead(500);res.end('Unable to load app');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log(`Local: http://localhost:${Number(process.env.PORT)||3000}`));
