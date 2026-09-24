import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncVehicleInventory, getVehicleInventory } from '../src/inventory.js';

const keys = ['vehicle_inventory:v1', 'vehicle_live_database:v1'];
const values = new Map();

function wrangler(...args) {
  return execFileSync('npx', ['wrangler', ...args], {
    encoding:'utf8',
    maxBuffer:20*1024*1024,
    env:{...process.env}
  });
}

for (const key of keys) {
  try {
    values.set(key, wrangler('kv:key', 'get', key, '--binding=CONTENT', '--text'));
  } catch (error) {
    const err=String(error.stderr||error.message||'');
    if (!/key not found|not found|404/i.test(err)) throw error;
  }
}

const env = {
  CONTENT: {
    get: async key => values.get(key)||null,
    put: async (key,value) => { values.set(key,value); }
  }
};

// Run several passes from the GitHub runner so dealer sites that block
// Cloudflare Worker egress can still be discovered and enriched.
for (let pass=0; pass<6; pass++) {
  await syncVehicleInventory(env);
}

const inventory = await getVehicleInventory(env);
const state = JSON.parse(values.get(keys[0])||'{}');
const healthy = (state.sources||[]).filter(s=>Number(s.inventoryPagesOk||0)>0).length;

console.log(JSON.stringify({
  databaseRows:Number(state.databaseRows||0),
  publicVehicles:inventory.vehicles.length,
  candidateCap:Number(state.candidateCap||0),
  healthySources:healthy,
  sources:(state.sources||[]).map(s=>({
    id:s.id,
    pagesOk:Number(s.inventoryPagesOk||0),
    pagesFailed:Number(s.inventoryPagesFailed||0),
    discovered:Number(s.discovered||0),
    availableVehicles:Number(s.availableVehicles||0),
    publicReadyVehicles:Number(s.publicReadyVehicles||0)
  }))
},null,2));

if (inventory.vehicles.length<10 || healthy<2) {
  throw new Error('Inventory sync did not meet minimum publication threshold');
}

const dir=mkdtempSync(join(tmpdir(),'roviq-inventory-'));
try {
  for (const key of keys) {
    const value=values.get(key);
    if(!value) throw new Error('Missing generated KV payload for '+key);
    const path=join(dir,key.replaceAll(':','-')+'.json');
    writeFileSync(path,value);
    wrangler('kv:key','put',key,'--binding=CONTENT',`--path=${path}`);
  }
} finally {
  rmSync(dir,{recursive:true,force:true});
}
