'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {runtime,source,poses}=require('./support.cjs');
const html=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const baseline=require('./baseline.json');
const validFrame=text=>{const rows=text.split('\n');assert.equal(rows.length,40);assert(rows.every(r=>r.length===120));assert(!/[^@%#*+=\-:. \n]/.test(text));return rows;};

test('configuration, map, movement, collision, controls and20Hz scheduling remain exact',()=>{
    const s=source(html),parts=s.split('        // --- Main Rendering Function (Raycasting) ---');
    assert.equal(sha(parts[0]),baseline.beforeRenderer);assert.equal(sha(s.slice(s.indexOf('        // --- Game Loop ---'))),baseline.afterRenderer);
    const r=runtime(html);assert.equal(r.q.FOV,Math.PI/3);assert.deepEqual(r.intervals,[50]);
    const states=[];for(const seg of baseline.movement){Object.keys(r.q.keysPressed).forEach(k=>delete r.q.keysPressed[k]);Object.assign(r.q.keysPressed,seg.controls);if(seg.pose)Object.assign(r.q.player,seg.pose);for(let i=0;i<seg.ticks;i++)r.q.updateGame();states.push(r.snapshot());}
    assert.deepEqual(states,baseline.movement.map(s=>s.after));
});
test('straight wall has constant height across every column',()=>{
    const r=runtime(html),rows=validFrame(r.render(poses.find(p=>p.name==='flat-south')));
    for(let x=0;x<120;x++)assert.equal(rows.filter(row=>row[x]==='#').length,27,'flat wall column '+x);
});
test('near wall, corners, cardinal rays and full turn retain complete finite frames',()=>{
    const r=runtime(html);for(const p of poses){const before={...p};validFrame(r.render(p));assert.deepEqual(r.snapshot(),{x:before.x,y:before.y,angle:before.angle});}
    const rows=r.render(poses.find(p=>p.name==='near-south')).split('\n');assert(rows.every(row=>/^%{120}$/.test(row)));
});
test('planar wall projection obeys analytic perpendicular depth at oblique headings',()=>{
    const r=runtime(html);
    for(let y=0;y<24;y++)for(let x=0;x<24;x++)r.q.map[y][x]=x===0||x===23||y===0||y===23?1:0;
    for(const angle of [-.3,-.1,0,.1,.3]) {
        const rows=validFrame(r.render({x:20.5,y:12.5,angle}));
        for(let x=0;x<120;x++) {
            // A ray at theta intersects x=23 at ray distance2.5/cos(theta).
            // Project that intersection back onto the camera's forward axis.
            const offset=Math.atan((2*(x+.5)/120-1)*Math.tan(Math.PI/6));
            const depth=2.5/Math.cos(angle+offset)*Math.cos(offset),height=Math.floor(40/depth);
            const top=Math.max(0,20-height/2),bottom=Math.min(39,20+height/2);
            const shade='@%#*+=-:. '[Math.min(9,Math.floor(Math.min(1,depth/12)*10))];
            for(let y=0;y<40;y++) {const expected=y<top?' ':y<=bottom?shade:y/40<.6?'.':y/40<.8?'-':'=';assert.equal(rows[y][x],expected,'analytic wall '+angle+'/'+x+'/'+y);}
        }
    }
});
