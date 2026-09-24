import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncVehicleInventory, getVehicleInventory } from '../src/inventory.js';

const keys = ['vehicle_inventory:v1', 'vehicle_live_database:v1'];
const values = new Map();
function wrangler(...args) {
  return execFileSync('npx', ['wrangler', ...args], { encoding:'utf8', maxBuffer:10*1024*1024 });
}
for (const key of keys) {
  try { values.set(key, wrangler('kv:key', 'get', key, '--binding=CONTENT', '--text')); }
  catch (error) {
    if (!String(error.stderr||'').includes('key not found')) throw error;
  }
}
const env = { CONTENT: {
  get: async key => values.get(key)||null,
  put: async (key,value) => { values.set(key,value); }
} };

// Multiple passes rotate the detail-page cursor; discoveries alone do not
// count as customer-ready vehicles.
for (let pass=0;pass<3;pass++) await syncVehicleInventory(env);
const inventory = await getVehicleInventory(env);
const state = JSON.parse(values.get(keys[0])||'{}');
const healthy = (state.sources||[]).filter(s=>s.inventoryPagesOk>0).length;
console.log(JSON.stringify({ databaseRows:state.databaseRows, publicVehicles:inventory.vehicles.length,
  healthySources:healthy, sources:(state.sources||[]).map(s=>({id:s.id,pagesOk:s.inventoryPagesOk,discovered:s.discovered})) },null,2));
if (inventory.vehicles.length<10 || healthy<2) throw new Error('Inventory sync did not meet publication threshold');

const dir=mkdtempSync(join(tmpdir(),'roviq-inventory-'));
try {
  for(const key of keys){
    const path=join(dir,key.replaceAll(':','-')+'.json');
    writeFileSync(path,values.get(key));
    wrangler('kv:key','put',key,'--binding=CONTENT',`--path=${path}`);
  }
} finally { rmSync(dir,{recursive:true,force:true}); }
