const PRICING_KEY = "vehicle_pricing_config:v1";

export const DEFAULT_PRICING = {
  marginPercent: 8.5,
  minimumMargin: 3500,
  shippingLow: 5000,
  shippingHigh: 7000,
  configVersion: 6
};

function money(n){ return Math.round(Number(n)||0); }

export async function getPricingConfig(env){
  if(!env.CONTENT) return {...DEFAULT_PRICING};
  const raw=await env.CONTENT.get(PRICING_KEY);
  if(!raw) return {...DEFAULT_PRICING};
  try {
    const saved=JSON.parse(raw);
    const migrated={
      marginPercent:Number(saved.marginPercent ?? DEFAULT_PRICING.marginPercent)||DEFAULT_PRICING.marginPercent,
      minimumMargin:Number(saved.minimumMargin ?? saved.processingFee ?? DEFAULT_PRICING.minimumMargin)||DEFAULT_PRICING.minimumMargin,
      shippingLow:Number(saved.shippingLow ?? DEFAULT_PRICING.shippingLow)||DEFAULT_PRICING.shippingLow,
      shippingHigh:Number(saved.shippingHigh ?? DEFAULT_PRICING.shippingHigh)||DEFAULT_PRICING.shippingHigh,
      configVersion:6
    };
    if(Number(saved.configVersion||0)<6) await env.CONTENT.put(PRICING_KEY,JSON.stringify(migrated));
    return migrated;
  } catch {
    return {...DEFAULT_PRICING};
  }
}

export async function savePricingConfig(env, input){
  const current=await getPricingConfig(env);
  const next={...current,configVersion:6};
  for(const key of ["marginPercent","minimumMargin","shippingLow","shippingHigh"]){
    if(input[key]!==undefined && input[key]!==null && input[key]!==""){
      const n=Number(input[key]);
      if(Number.isFinite(n) && n>=0) next[key]=n;
    }
  }
  if(env.CONTENT) await env.CONTENT.put(PRICING_KEY,JSON.stringify(next));
  return next;
}

export function calculateVehiclePricing(vehicle, config){
  const dealerPrice=money(vehicle.askingPrice||0);
  const shippingLow=money(config.shippingLow);
  const shippingHigh=money(config.shippingHigh);

  if(!dealerPrice) return {
    hasPrice:false,
    vehiclePrice:null,
    shippingLow,
    shippingHigh,
    internal:{dealerPrice:null,margin:null}
  };

  const percentageMargin=dealerPrice*((Number(config.marginPercent)||0)/100);
  const margin=money(Math.max(Number(config.minimumMargin)||0,percentageMargin));
  const vehiclePrice=money(dealerPrice+margin);

  return {
    hasPrice:true,
    vehiclePrice,
    shippingLow,
    shippingHigh,
    internal:{dealerPrice,margin}
  };
}

export function publicPricing(vehicle, config){
  const p=calculateVehiclePricing(vehicle,config);
  const { internal, ...safe }=p;
  return safe;
}
