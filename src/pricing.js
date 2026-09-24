const PRICING_KEY = "vehicle_pricing_config:v1";

export const DEFAULT_PRICING = {
  processingFee: 3500,
  shippingLow: 5000,
  shippingHigh: 7000,
  configVersion: 5
};

function money(n){ return Math.round(Number(n)||0); }

export async function getPricingConfig(env){
  if(!env.CONTENT) return {...DEFAULT_PRICING};
  const raw=await env.CONTENT.get(PRICING_KEY);
  if(!raw) return {...DEFAULT_PRICING};
  try {
    const saved=JSON.parse(raw);
    if(Number(saved.configVersion||0)<5 || saved.processingFee==null){
      const migrated={
        processingFee:Number(saved.processingFee ?? saved.minimumMargin ?? DEFAULT_PRICING.processingFee)||DEFAULT_PRICING.processingFee,
        shippingLow:Number(saved.shippingLow ?? DEFAULT_PRICING.shippingLow)||DEFAULT_PRICING.shippingLow,
        shippingHigh:Number(saved.shippingHigh ?? DEFAULT_PRICING.shippingHigh)||DEFAULT_PRICING.shippingHigh,
        configVersion:5
      };
      await env.CONTENT.put(PRICING_KEY,JSON.stringify(migrated));
      return migrated;
    }
    return {...DEFAULT_PRICING,...saved,configVersion:5};
  } catch {
    return {...DEFAULT_PRICING};
  }
}

export async function savePricingConfig(env, input){
  const current=await getPricingConfig(env);
  const next={...current,configVersion:5};
  for(const key of ["processingFee","shippingLow","shippingHigh"]){
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
  const processingFee=money(config.processingFee);
  const shippingLow=money(config.shippingLow);
  const shippingHigh=money(config.shippingHigh);

  if(!dealerPrice) return {
    hasPrice:false,
    dealerPrice:null,
    vehiclePrice:null,
    processingFee,
    subtotal:null,
    shippingLow,
    shippingHigh,
    totalLow:null,
    totalHigh:null
  };

  const subtotal=dealerPrice+processingFee;
  return {
    hasPrice:true,
    dealerPrice,
    vehiclePrice:dealerPrice,
    processingFee,
    subtotal,
    shippingLow,
    shippingHigh,
    totalLow:subtotal+shippingLow,
    totalHigh:subtotal+shippingHigh,
    internal:{acquisitionBaseline:dealerPrice}
  };
}

export function publicPricing(vehicle, config){
  const p=calculateVehiclePricing(vehicle,config);
  const { internal, ...safe }=p;
  return safe;
}
