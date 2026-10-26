'use strict';
const fs=require('node:fs'),vm=require('node:vm');

function source(html) {
    html=html.replace(/\r\n/g,'\n');
    const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
    const games=scripts.filter(s=>s.includes('function updateGame()'));
    if(games.length!==1)throw Error('Expected one game script');
    return games[0];
}
function runtime(html) {
    const nodes={},intervals=[];
    const context=vm.createContext({document:{getElementById:id=>nodes[id]??={textContent:''},addEventListener(){}},console:{log(){}},setInterval:(fn,ms)=>intervals.push(ms),Math});
    vm.runInContext(source(html),context,{timeout:1000});
    const q=vm.runInContext('({player,map,keysPressed,renderFrame,updateGame,isWall,FOV,SCREEN_WIDTH,SCREEN_HEIGHT})',context);
    return {q,intervals,render(pose){Object.assign(q.player,{x:pose.x,y:pose.y,angle:pose.angle});q.renderFrame();return nodes.gameScreen.textContent;},snapshot:()=>JSON.parse(JSON.stringify(q.player))};
}
const poses=[
    {name:'spawn',x:3.5,y:3.5,angle:Math.PI/4},
    {name:'flat-south',x:10.5,y:21.5,angle:Math.PI/2},
    {name:'flat-oblique-left',x:10.5,y:21.5,angle:Math.PI/2-.18},
    {name:'flat-oblique-right',x:10.5,y:21.5,angle:Math.PI/2+.18},
    {name:'near-south',x:10.5,y:22.9999,angle:Math.PI/2},
    {name:'east-corner',x:22.5,y:22.5,angle:Math.PI/4},
    {name:'west-corner',x:1.5,y:1.5,angle:Math.PI*1.25},
    ...[0,Math.PI/2,Math.PI,Math.PI*1.5].map((angle,i)=>({name:'cardinal-'+i,x:10,y:22,angle})),
    ...Array.from({length:16},(_,i)=>({name:'turn-'+i,x:3.5,y:3.5,angle:i*Math.PI/8}))
];
// Actual browser globals are classic-script lexical bindings. No input events.
function renderPose(pose) {
    Object.assign(player,{x:pose.x,y:pose.y,angle:pose.angle});renderFrame();
    return {text:gameScreen.textContent,player:{...player},bounds:gameScreen.getBoundingClientRect().toJSON(),viewport:[innerWidth,innerHeight]};
}
module.exports={source,runtime,poses,renderPose};
