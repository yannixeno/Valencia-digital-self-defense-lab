import {cp,mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {scenarios} from './scenarios.js';
import {createHash} from 'node:crypto';
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
if(base && !/^\/[A-Za-z0-9_.-]+$/.test(base)) throw new Error('BASE_PATH must be a single repository path, such as /workshop');
let html=await readFile('index.html','utf8');
html=html.replace('<head>',`<head><meta name="app-base" content="${base}">`).replace('href="/styles.css"',`href="${base}/styles.css"`).replace('src="/app.js"',`src="${base}/app.js"`);
await mkdir('dist',{recursive:true});
html=html.replace('href="/workshop.css"',`href="${base}/workshop.css"`);
const version=createHash('sha256').update((await Promise.all(['app.js','scenarios.js','styles.css','workshop.css','campus3d.js'].map(name=>readFile(name,'utf8')))).join('')).digest('hex').slice(0,12);
await cp('vendor','dist/vendor',{recursive:true});
await copyFile('campus3d.js','dist/campus3d.js');
for(const name of ['app.js','scenarios.js','styles.css','workshop.css'])await copyFile(name,`dist/${name}`);
await writeFile('dist/app.js',(await readFile('app.js','utf8')).replace("'./campus3d.js'",`'./campus3d.js?v=${version}'`).replace("'./scenarios.js'",`'./scenarios.js?v=${version}'`));
html=html.replaceAll('/styles.css"',`/styles.css?v=${version}"`).replaceAll('/workshop.css"',`/workshop.css?v=${version}"`).replaceAll('/app.js"',`/app.js?v=${version}"`);
await writeFile('dist/index.html',html);
await writeFile('dist/404.html',html);
await writeFile('dist/.nojekyll','');
for(const route of [...scenarios.map(s=>`challenge/${s.id}`),'complete','facilitator','cards']){await mkdir(`dist/${route}`,{recursive:true});await writeFile(`dist/${route}/index.html`,html)}
console.log(`Built static site for ${base||'/'} with ${scenarios.length} direct challenge destinations.`);


