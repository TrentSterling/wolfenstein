'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {runtime,poses,renderPose}=require('./support.cjs');
(async()=>{
    const html=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8'),r=runtime(html);
    const expected=poses.map(p=>r.render(p)),server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html);});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;const results=[];
    try {
        browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});
        for(const [width,height] of [[1280,800],[844,390],[390,844],[800,800]]){
            const context=await browser.newContext({viewport:{width,height}});
            try {
                const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
                await page.addInitScript('window.setInterval=()=>0;');
                await page.goto(process.env.WOLFENSTEIN_LIVE_URL||`http://127.0.0.1:${server.address().port}/`);
                const cases=[];for(let i=0;i<poses.length;i++){
                    const result=await page.evaluate(renderPose,poses[i]);assert.equal(result.text,expected[i],poses[i].name);assert.deepEqual(result.player,{x:poses[i].x,y:poses[i].y,angle:poses[i].angle});
                    cases.push({name:poses[i].name,hash:crypto.createHash('sha256').update(result.text).digest('hex'),bounds:result.bounds});
                }
                assert.deepEqual(errors,[]);results.push({width,height,cases});
            }finally{await context.close();}
        }
    }finally{if(browser)await browser.close();server.close();fs.mkdirSync('.projection-evidence',{recursive:true});fs.writeFileSync('.projection-evidence/results.json',JSON.stringify({results},null,2));}
    console.log(JSON.stringify({viewports:results.length,renderChecks:results.reduce((n,r)=>n+r.cases.length,0),passed:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
