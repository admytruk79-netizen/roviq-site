import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getVehicleInventory,normalizePriorInventory} from './inventory.js';

function environment(rows){
  const data=new Map([
    ['vehicle_inventory:v1',JSON.stringify({version:32,vehicles:rows})],
    ['vehicle_live_database:v1',JSON.stringify({version:32,vehicles:rows})]
  ]);
  return {CONTENT:{get:async key=>data.get(key)||null,put:async(key,value)=>{data.set(key,value)}}};
}
const vehicle=(mileageMi)=>({
  id:'ROVIQ-US-12345678',sourceUrl:'https://dealer.example/vehicle/123',
  status:'available',lastDiscoveredAt:new Date().toISOString(),
  year:2025,make:'Ford',model:'F-150',mileageMi,askingPrice:30000
});

test('public inventory shows only marked-up price and no dealer cost',async()=>{
  const result=await getVehicleInventory(environment([vehicle(12000)]));
  assert.equal(result.vehicles.length,1);
  assert.equal(result.vehicles[0].pricing.vehiclePrice,33500);
  assert.equal(result.vehicles[0].pricing.hasPrice,true);
  assert.equal('dealerPrice' in result.vehicles[0].pricing,false);
  assert.equal('subtotal' in result.vehicles[0].pricing,false);
  assert.equal('sourceUrl' in result.vehicles[0],false);
});

test('vehicles without verified mileage do not appear as zero-mileage listings',async()=>{
  const result=await getVehicleInventory(environment([vehicle(null)]));
  assert.equal(result.databaseRows,1);
  assert.equal(result.vehicles.length,0);
});

test('legacy inferred zero mileage is discarded during refresh',()=>{
  assert.equal(normalizePriorInventory({version:31,vehicles:[vehicle(0)]})[0].mileageMi,null);
  assert.equal(normalizePriorInventory({version:32,vehicles:[vehicle(0)]})[0].mileageMi,0);
});
