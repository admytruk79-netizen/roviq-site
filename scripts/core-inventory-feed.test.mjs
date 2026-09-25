import {test} from 'node:test';
import assert from 'node:assert/strict';
import {coreInventoryBatches,publishCoreInventory} from './core-inventory-feed.mjs';

const database={
  sources:[{id:'ford',inventoryPagesOk:2,inventoryPagesFailed:0},{id:'chevy',inventoryPagesOk:1,inventoryPagesFailed:1}],
  vehicles:[
    {id:'f1',sourceId:'ford',sourceUrl:'https://dealer.example/f1',make:'Ford',model:'F-150',askingPrice:30000,mileageMi:12000},
    {id:'c1',sourceId:'chevy',sourceUrl:'https://dealer.example/c1',make:'Chevrolet',model:'Silverado',askingPrice:null,mileageMi:null}
  ]
};
const pricingConfig={marginPercent:8.5,minimumMargin:3500};

test('Core batches preserve margins and avoid retiring cars from a partial crawl',()=>{
  const batches=coreInventoryBatches(database,pricingConfig);
  assert.equal(batches[0].completeSnapshot,true);
  assert.equal(batches[0].payload[0].marginCents,350000);
  assert.equal(batches[0].payload[0].priceCents,3000000);
  assert.equal(batches[1].completeSnapshot,false);
  assert.equal(batches[1].payload[0].priceCents,undefined);
  assert.equal(batches[1].payload[0].mileage,undefined);
});

test('Core publication authenticates and sends private source batches',async()=>{
  const calls=[];
  const fetcher=async(url,options)=>{
    calls.push({path:new URL(url).pathname,options});
    return {ok:true,status:200,json:async()=>({accessToken:'test-token'})};
  };
  const result=await publishCoreInventory(database,{baseUrl:'https://core.example',email:'sync@example.com',password:'secret',pricingConfig,fetcher});
  assert.equal(result.length,2);
  assert.equal(calls[0].path,'/api/auth/login');
  assert.equal(calls[1].options.headers.authorization,'Bearer test-token');
  assert.equal(JSON.parse(calls[2].options.body).completeSnapshot,false);
});
