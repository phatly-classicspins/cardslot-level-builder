const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('./core.js');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/presets.js','utf8')+';this.levels=CARDSLOT_PRESETS;',context);
let checks=0;
for(const raw of context.levels){
 const l=C.normalize(JSON.parse(JSON.stringify(raw)));assert.deepEqual(C.validate(l),[]);checks++;
 const before=JSON.stringify(l),geometry=C.geometry(l);assert.equal(geometry.length,l.stacks.length);assert.equal(JSON.stringify(l),before);geometry.forEach(p=>p.cards.forEach(c=>assert.ok(Number.isFinite(c.x)&&Number.isFinite(c.y))));checks++;
 const g=C.newGame(l);for(const id of l.solution){const i=l.stacks.findIndex(s=>s.id===id);assert.ok(C.tap(l,g,i),`${l.id}: ${id} blocked`);}assert.equal(g.result,'won',l.id);checks++;
 const restored=C.normalize(JSON.parse(JSON.stringify(l)));assert.equal(JSON.stringify(restored),JSON.stringify(l));checks++;
}
const base=C.normalize(JSON.parse(JSON.stringify(context.levels[0])));
base.stacks=[{...base.stacks[0],id:'a',count:6,fan:true,spread_direction:-1},{...base.stacks[0],id:'b',layer:1,count:3,color:'color_1',on_stack:'a'}];
const p=C.resolve(base);assert.equal(p[1].root,0);assert.equal(p[1].support,0);assert.equal(p[1].offset,6);assert.equal(p[1].direction,-1);checks++;
const bad=C.clone(base);bad.stacks[1].spread_angle=90;assert.ok(C.validate(bad).some(e=>e.includes('cọc đỡ')));checks++;
const balance=C.normalize(JSON.parse(JSON.stringify(context.levels[0])));balance.targets[0].capacity--;assert.ok(C.validate(balance).some(e=>e.includes('sức chứa')));checks++;
const invalid=C.clone(balance);invalid.stacks[1].id=invalid.stacks[0].id;assert.ok(C.validate(invalid).some(e=>e.includes('trùng')));checks++;
// rules of the game's BoardModel (D-040, D-041, elements) — small boards built here
const mk=(slots,buffer,targets,stacks)=>C.normalize({id:'t',n_slots:slots,buffer_capacity:buffer,targets:targets.map(([c,cap,hidden])=>({color:'color_'+c,capacity:cap,...(hidden?{hidden:true}:{})})),
  stacks:stacks.map(([id,x,layer,c,count,extra])=>({id,x,y:0,w:150,h:206,layer,color:'color_'+c,count,...(extra||{})}))});
// D-041: of 3 blues with 2 free cells, the third stays; the game is not lost while red still takes cards
let l=mk(2,2,[[0,3],[0,3],[1,3]],[['bl',0,0,1,3],['r',220,0,0,6]]),g=C.newGame(l);
assert.ok(C.tap(l,g,0));assert.equal(g.remaining[0],1);assert.equal(g.result,'playing');assert.equal(C.tap(l,g,0),false,'no room: the tap moves nothing');
C.tap(l,g,1);C.tap(l,g,0);assert.equal(g.result,'won');checks++;
// D-040: full holding area, nothing matches ⇒ stuck
l=mk(2,2,[[0,3],[1,3],[2,3],[3,3]],[['y',660,0,2,2],['y2',880,0,2,1],['r',0,0,0,3],['bl',220,0,1,3],['g',100,1,3,3]]);g=C.newGame(l);
C.tap(l,g,0);assert.equal(g.result,'stuck');checks++;
// R-24: a covered hidden stack is face down, shows its colour once uncovered
l=mk(2,6,[[0,3],[1,3]],[['h',0,0,0,3,{hidden:true}],['top',100,1,1,3]]);g=C.newGame(l);
assert.ok(C.hiddenNow(l,g,0));C.tap(l,g,1);assert.ok(!C.hiddenNow(l,g,0));checks++;
// R-25: a hidden pole shows "?" while it waits, not once it is at the front
l=mk(2,6,[[0,3],[1,3],[2,3,true]],[['r',0,0,0,3],['b',220,0,1,3],['y',440,0,2,3]]);g=C.newGame(l);
assert.equal(C.queued(l,g,0)[0].hidden,true);C.tap(l,g,0);assert.equal(C.queued(l,g,0).length,0);assert.equal(g.slots[0].color,'color_2');checks++;
// R-26: locked until uncovered and one completion; then it plays
l=mk(4,9,[[0,3],[1,3],[3,3],[2,3]],[['L',0,0,2,3,{lock:1}],['c',100,1,0,3],['b',400,0,1,3],['g',600,0,3,3]]);g=C.newGame(l);
assert.equal(C.canTap(l,g,0),false);C.tap(l,g,1);assert.equal(g.lock[0],0);C.tap(l,g,0);C.tap(l,g,2);C.tap(l,g,3);assert.equal(g.result,'won');checks++;
console.log(`${checks} checks passed: shipped solutions (with elements), geometry, round trips, inherited reverse fan, invalid support, balance, duplicate IDs, D-040, D-041, hidden stack, hidden pole, locked stack.`);
