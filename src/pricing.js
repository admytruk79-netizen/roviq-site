const PRICING_KEY = "vehicle_pricing_config:v1";

export const DEFAULT_PRICING = {
  marginPercent: 7.5,
  minimumMargin: 3000,
  riskReserve: 500,
  shippingLow: 5000,
  shippingHigh: 7000,
  roundTo: 100,
  configVersion: 3
};

function money(n){ return Math.round(Number(n)||0); }
function roundUp(n, step){ step=Math.max(1,Number(step)||100); return Math.ceil(n/step)*step; }

export async function getPricingConfig(env){
  if(!env.CONTENT) return {...DEFAULT_PRICING};
  const raw=await env.CONTENT.get(PRICING_KEY);
  if(!raw) return {...DEFAULT_PRICING};
  try {
    const saved=JSON.parse(raw);
    const isLegacyDefault =
      !saved.configVersion &&
      Number(saved.marginPercent)===9 &&
      Number(saved.minimumMargin)===3500 &&
      Number(saved.riskReserve)===750;
    if(isLegacyDefault){
      const migrated={...DEFAULT_PRICING};
      await env.CONTENT.put(PRICING_KEY,JSON.stringify(migrated));
      return migrated;
    }
    const wasPreviousShippingDefault =
      Number(saved.configVersion||0) < 3 &&
      Number(saved.shippingLow)===3000 &&
      Number(saved.shippingHigh)===5500;
    if(wasPreviousShippingDefault){
      const migrated={...DEFAULT_PRICING,...saved,shippingLow:5000,shippingHigh:7000,configVersion:3};
      await env.CONTENT.put(PRICING_KEY,JSON.stringify(migrated));
      return migrated;
    }
    return {...DEFAULT_PRICING,...saved};
  } catch {
    return {...DEFAULT_PRICING};
  }
}

export async function savePricingConfig(env, input){
  const current=await getPricingConfig(env);
  const next={...current};
  for(const key of Object.keys(DEFAULT_PRICING)){
    if(input[key]!==undefined && input[key]!==null && input[key]!==""){
      const n=Number(input[key]);
      if(Number.isFinite(n) && n>=0) next[key]=n;
    }
  }
  if(env.CONTENT) await env.CONTENT.put(PRICING_KEY,JSON.stringify(next));
  return next;
}

export function calculateVehiclePricing(vehicle, config){
  const ask=Number(vehicle.askingPrice||0);
  if(!ask) return {
    hasPrice:false,
    vehiclePrice:null,
    shippingLow:money(config.shippingLow),
    shippingHigh:money(config.shippingHigh),
    totalLow:null,
    totalHigh:null
  };

  const margin=Math.max(
    Number(config.minimumMargin)||0,
    ask*((Number(config.marginPercent)||0)/100)
  );
  const vehiclePrice=roundUp(ask+margin+(Number(config.riskReserve)||0),config.roundTo);
  const shippingLow=money(config.shippingLow);
  const shippingHigh=money(config.shippingHigh);
  return {
    hasPrice:true,
    vehiclePrice,
    shippingLow,
    shippingHigh,
    totalLow:vehiclePrice+shippingLow,
    totalHigh:vehiclePrice+shippingHigh,
    internal:{
      acquisitionBaseline:ask,
      grossMarginBeforeReserve:margin,
      riskReserve:Number(config.riskReserve)||0
    }
  };
}

export function publicPricing(vehicle, config){
  const p=calculateVehiclePricing(vehicle,config);
  const { internal, ...safe }=p;
  return safe;
}
