import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getVehicleInventory,normalizePriorInventory,retainRecentUnseenVehicles,discoverFleetInventory} from './inventory.js';

function environment(rows){
  const data=new Map([
    ['vehicle_inventory:v1',JSON.stringify({version:32,vehicles:rows})],
    ['vehicle_live_database:v1',JSON.stringify({version:32,vehicles:rows})]
  ]);
  return {CONTENT:{get:async key=>data.get(key)||null,put:async(key,value)=>{data.set(key,value)}}};
}
const vehicle=(mileageMi)=>({
  id:'ROVIQ-US-12345678',sourceUrl:'https://dealer.example/used/Ford/123',
  condition:'used',status:'available',lastDiscoveredAt:new Date().toISOString(),
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

test('customer inventory contains only trucks below 30,000 miles',async()=>{
  const rows=[vehicle(29999),{...vehicle(30000),id:'ROVIQ-US-87654321',sourceUrl:'https://dealer.example/used/Ford/456'}];
  const result=await getVehicleInventory(environment(rows));
  assert.equal(result.vehicles.length,1);
  assert.equal(result.vehicles[0].mileageMi,29999);
});

test('legacy inferred zero mileage is discarded during refresh',()=>{
  assert.equal(normalizePriorInventory({version:31,vehicles:[vehicle(0)]})[0].mileageMi,null);
  assert.equal(normalizePriorInventory({version:32,vehicles:[vehicle(0)]})[0].mileageMi,0);
});

test('partial dealer outage retains only recent previously discovered cars',()=>{
  const now=new Date().toISOString();
  const prior={...vehicle(12000),sourceId:'ford',lastDiscoveredAt:now};
  const failed={ford:{inventoryPagesOk:1,inventoryPagesFailed:1}};
  assert.deepEqual(retainRecentUnseenVehicles([], [prior],failed),[prior]);
  assert.deepEqual(retainRecentUnseenVehicles([], [prior],{ford:{inventoryPagesOk:2,inventoryPagesFailed:0}}),[]);
  assert.deepEqual(retainRecentUnseenVehicles([], [{...prior,lastDiscoveredAt:new Date(Date.now()-25*3600000).toISOString()}],failed),[]);
  assert.deepEqual(retainRecentUnseenVehicles([{...prior,mileageMi:13000}], [prior],failed).map(v=>v.mileageMi),[13000]);
});


test('fleet parser keeps each price with its own VIN',()=>{
  const html=`
    <section>2024 Ford F-150 SuperCrew Cab 4WD Pickup
      VIN 1FTFW1RG7RFB85608
      Mileage 28,033 Drivetrain 4WD Fuel Type Gasoline Transmission 10-Speed Automatic
      Color Blue Metallic Vehicle Trim Raptor
      MSRP | $69,733 Doc Fee | + $250 Price* | $69,983
    </section>
    <section>2022 Ford F-150 SuperCrew Cab 4WD Pickup
      VIN 1FTFW1E50NFA11111
      Mileage 21,000 Drivetrain 4WD Fuel Type Gasoline Transmission 10-Speed Automatic
      Color White Vehicle Trim XLT
      MSRP | $25,231 Doc Fee | + $250 Price* | $25,481
    </section>`;
  const rows=discoverFleetInventory(html,{id:'kendall-eugene-fleet',name:'Kendall Ford of Eugene'},'https://dealer.example/used');
  const raptor=rows.find(r=>r.hints.vin==='1FTFW1RG7RFB85608');
  const xlt=rows.find(r=>r.hints.vin==='1FTFW1E50NFA11111');
  assert.equal(raptor.hints.askingPrice,69983);
  assert.equal(xlt.hints.askingPrice,25481);
});

test('stale dealer price is not reused when current listing has no valid price',async()=>{
  const row={...vehicle(12000),askingPrice:null};
  const data=new Map([
    ['vehicle_inventory:v1',JSON.stringify({version:33,vehicles:[row]})],
    ['vehicle_live_database:v1',JSON.stringify({version:33,vehicles:[row]})],
    ['vehicle_costing_records:v1',JSON.stringify([{vehicleId:row.id,acquisitionPrice:25000,dealerPrice:25000,customerVehiclePrice:28500,shippingLow:5000,shippingHigh:7000}])]
  ]);
  const env={CONTENT:{get:async key=>data.get(key)||null,put:async(key,value)=>{data.set(key,value)}}};
  const result=await getVehicleInventory(env);
  assert.equal(result.vehicles.length,1);
  assert.equal(result.vehicles[0].pricing.hasPrice,false);
  assert.equal(result.vehicles[0].pricing.vehiclePrice,null);
});
