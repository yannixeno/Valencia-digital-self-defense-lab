import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {scenarios} from './scenarios.js';
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
if(base && !/^\/[A-Za-z0-9_.-]+$/.test(base)) throw new Error('BASE_PATH must be a single repository path, such as /workshop');
let html=await readFile('index.html','utf8');
html=html.replace('<head>',`<head><meta name="app-base" content="${base}">`).replace('href="/styles.css"',`href="${base}/styles.css"`).replace('src="/app.js"',`src="${base}/app.js"`);
await mkdir('dist',{recursive:true});
for(const name of ['app.js','scenarios.js','styles.css'])await copyFile(name,`dist/${name}`);
await writeFile('dist/index.html',html);
await writeFile('dist/404.html',html);
await writeFile('dist/.nojekyll','');
for(const route of [...scenarios.map(s=>`challenge/${s.id}`),'complete','facilitator']){await mkdir(`dist/${route}`,{recursive:true});await writeFile(`dist/${route}/index.html`,html)}
console.log(`Built static site for ${base||'/'} with ${scenarios.length} direct challenge destinations.`);
