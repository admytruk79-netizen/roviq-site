import { calculateVehiclePricing } from "./pricing.js";

const COSTING_KEY = "vehicle_costing_records:v1";

function now(){ return new Date().toISOString(); }
async function read(env){
  if(!env.CONTENT) return [];
  const raw=await env.CONTENT.get(COSTING_KEY);
  if(!raw) return [];
  try { const x=JSON.parse(raw); return Array.isArray(x)?x:[]; } catch { return []; }
}
async function write(env, rows){
  if(env.CONTENT) await env.CONTENT.put(COSTING_KEY,JSON.stringify(rows.slice(0,1000)));
}

export async function syncVehicleCosting(env, vehicles, config){
  const existing=await read(env);
  const byId=new Map(existing.map(r=>[r.vehicleId,r]));
  for(const v of (vehicles||[])){
    if(!v?.id) continue;
    const prior=byId.get(v.id)||{};
    const acquisitionPrice=Number(v.askingPrice||prior.acquisitionPrice||0) || null;
    if(!acquisitionPrice && !prior.acquisitionPrice) continue;

    const input={...v,askingPrice:acquisitionPrice};
    const calc=calculateVehiclePricing(input,config);
    byId.set(v.id,{
      vehicleId:v.id,
      vin:v.vin||prior.vin||null,
      sourceId:v.sourceId||prior.sourceId||null,
      acquisitionPrice,
      marginPercent:Number(config.marginPercent)||0,
      minimumMargin:Number(config.minimumMargin)||0,
      riskReserve:Number(config.riskReserve)||0,
      shippingLow:Number(config.shippingLow)||0,
      shippingHigh:Number(config.shippingHigh)||0,
      roundTo:Number(config.roundTo)||100,
      roviqVehiclePrice:calc.vehiclePrice,
      deliveredLow:calc.totalLow,
      deliveredHigh:calc.totalHigh,
      updatedAt:now(),
      sourceVerifiedAt:v.lastVerifiedAt||prior.sourceVerifiedAt||null
    });
  }
  const rows=[...byId.values()].sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
  await write(env,rows);
  return rows;
}

export async function getVehicleCosting(env){
  return read(env);
}

export async function getCostingMap(env){
  const rows=await read(env);
  return new Map(rows.map(r=>[r.vehicleId,r]));
}

export function publicCosting(record){
  if(!record || !Number(record.roviqVehiclePrice)) return {
    hasPrice:false,
    vehiclePrice:null,
    shippingLow:Number(record?.shippingLow||0),
    shippingHigh:Number(record?.shippingHigh||0)
  };
  return {
    hasPrice:true,
    vehiclePrice:Number(record.roviqVehiclePrice),
    shippingLow:Number(record.shippingLow||0),
    shippingHigh:Number(record.shippingHigh||0)
  };
}
