import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getVehicleInventory,normalizePriorInventory,retainRecentUnseenVehicles,discoverFleetInventory,searchServiceListingToHints,discoverSearchService,checkSearchServiceVin} from './inventory.js';

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

const kendall={id:"kendall-ford-vancouver",name:"Kendall Ford of Vancouver",usedOnly:true,
  searchService:{pageUrl:"https://dealer.test/used-vehicles/",typeSlugs:["Used","Certified Used"]}};
const usedF150={vin:"1ftfw1e81pfa00001",year:2023,make:"Ford",model:"F-150",trim:"XLT",type:"Used",
  vdp_url:"https://dealer.test/inventory/used-2023-ford-f-150-xlt-4wd-supercrew-1ftfw1e81pfa00001/",
  mileage:21450,styles:{style_name:"XLT 4WD SuperCrew 5.5' Box",exterior_color:"Oxford White"},
  pricing:{our_price:41995},media:{images:["https://img.test/1.jpg"]},
  mechanical:{engine:"2.7L V6",drivetrain:"4WD",fuel_type:"Gasoline Fuel",transmission:"10-Speed Automatic"}};

test("search service listing maps to exact used crew-cab record", () => {
  const item=searchServiceListingToHints(usedF150,kendall);
  assert.equal(item.url,usedF150.vdp_url);
  assert.equal(item.hints.vin,"1FTFW1E81PFA00001");
  assert.equal(item.hints.askingPrice,41995);
  assert.equal(item.hints.mileageMi,21450);
  assert.equal(item.hints.fuel,"Gasoline");
  assert.equal(item.hints.condition,"used");
});

test("search service rejects regular cabs, new trucks, high mileage and other models", () => {
  assert.equal(searchServiceListingToHints({...usedF150,styles:{style_name:"XL 4WD Reg Cab 8' Box"}},kendall),null);
  assert.equal(searchServiceListingToHints({...usedF150,type:"New"},kendall),null);
  assert.equal(searchServiceListingToHints({...usedF150,mileage:48000},kendall),null);
  assert.equal(searchServiceListingToHints({...usedF150,model:"Explorer"},kendall),null);
  assert.equal(searchServiceListingToHints({...usedF150,make:"GMC",model:"Sierra 3500HD",styles:{style_name:"4WD Crew Cab 159\" Denali Ultimate"}},kendall),null);
  assert.ok(searchServiceListingToHints({...usedF150,make:"GMC",model:"Sierra 2500HD",styles:{style_name:"4WD Crew Cab 153.7\" SLE"}},kendall));
});

function searchFetcher(listings){
  const calls=[];
  const fetcher=async (url,init={})=>{
    calls.push({url,init});
    if(url===kendall.searchService.pageUrl) return new Response('<script>var SEARCH_SERVICE = {"search":"https://api.test/listings/1","apiKey":"k","visibleStatusValues":["publish"]}; var X=1;</script>');
    return new Response(JSON.stringify({data:{listings}}),{headers:{"content-type":"application/json"}});
  };
  return {fetcher,calls};
}

test("discoverSearchService queries used types and keeps qualifying trucks", async () => {
  const {fetcher,calls}=searchFetcher([usedF150,{...usedF150,vin:"X2",type:"New"}]);
  const r=await discoverSearchService(kendall,fetcher);
  assert.equal(r.ok,true);
  assert.equal(r.found.length,1);
  const body=JSON.parse(calls[1].init.body);
  assert.deepEqual(body.filters.type_slug,["Used","Certified Used"]);
  assert.equal(calls[1].init.headers["x-api-key"],"k");
});

test("checkSearchServiceVin reports sold when VIN left the dealer index", async () => {
  assert.equal((await checkSearchServiceVin(kendall,"1FTFW1E81PFA00001",searchFetcher([usedF150]).fetcher)).item.hints.askingPrice,41995);
  assert.equal((await checkSearchServiceVin(kendall,"1FTFW1E81PFA00001",searchFetcher([]).fetcher)).item,null);
});

test("crew cab can be read from the VDP slug when style is missing; field map is requested", async () => {
  const thin={...usedF150,styles:{}};
  assert.ok(searchServiceListingToHints(thin,kendall));
  assert.equal(searchServiceListingToHints({...thin,vdp_url:"https://dealer.test/inventory/used-2023-ford-f-150-xl-4wd-regular-cab-x/"},kendall),null);
  const calls=[];
  const fetcher=async (url,init={})=>{calls.push(init);
    if(url===kendall.searchService.pageUrl) return new Response('<script>var SEARCH_SERVICE = {"search":"https://api.test/l/1","apiKey":"k"}; var SEARCH_SERVICE_FIELD_MAP = {"requestedFields":["vin","styles"]}; var Y=2;</script>');
    return new Response(JSON.stringify({data:{listings:[]}}));};
  await discoverSearchService(kendall,fetcher);
  assert.deepEqual(JSON.parse(calls[1].body).requestedFields,["vin","styles"]);
});

import { getNewTrucks, coreNewTruckToCard } from './new-trucks.js';
import { ukrainePage } from './pages/ukraine.js';

const coreRow=(o={})=>({id:'u1',condition:'new',vin:'1GTUUDED4TG344911',year:2026,make:'GMC',model:'Sierra 1500',trim:'SLT Crew Cab',
  mileage:5,drivetrain:'4WD',fuel_type:'Gasoline Fuel',exterior_color:'Summit White',image_urls:['https://img.test/1.jpg','http://insecure/x.jpg'],
  public_price_cents:7451780,price_cents:7451780,...o});

test("Core new truck maps to a card with the marked-up price only", () => {
  const c=coreNewTruckToCard(coreRow());
  assert.equal(c.price,74518);
  assert.equal(c.image,'https://img.test/1.jpg');
  assert.equal(c.fuel,'Gasoline');
  assert.equal(coreNewTruckToCard(coreRow({public_price_cents:null,price_cents:null})).price,null);
});

test("getNewTrucks pages Core until total and forwards search filters", async () => {
  const urls=[];
  const rows=n=>Array.from({length:n},(_,i)=>coreRow({vin:`VIN${String(i).padStart(14,'0')}`}));
  const fetcher=async url=>{
    urls.push(url);
    const offset=Number(new URL(url).searchParams.get('offset'));
    return new Response(JSON.stringify({inventory:offset===0?rows(100):rows(16),total:116}));
  };
  const r=await getNewTrucks(new URLSearchParams({q:'Sierra',make:'GMC'}),fetcher,null);
  assert.equal(r.vehicles.length,116);
  assert.equal(urls.length,2);
  assert.match(urls[0],/condition=new/);
  assert.match(urls[0],/q=Sierra/);
  assert.match(urls[0],/make=GMC/);
});

test("Trucks page New tab renders Core trucks with shipping and no dealer names", () => {
  const html=ukrainePage({},{vehicles:[coreNewTruckToCard(coreRow())]},null,null,false,new URLSearchParams({type:'new'}));
  assert.match(html,/2026 GMC Sierra 1500/);
  assert.match(html,/&#36;74,518/);
  assert.match(html,/&#36;5,000–&#36;7,000/);
  assert.match(html,/href="\/ukraine\?type=new" aria-current="page"/);
  assert.doesNotMatch(html,/Beaverton GMC|Carr|Kendall/);
});
