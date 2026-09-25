// Adapt the existing dealer discovery database to ROVIQ Core's private ingest API.
export function coreInventoryBatches(database,pricingConfig){
  const sources=new Map((database.sources||[]).map(s=>[s.id,s]));
  const groups=new Map();
  for(const v of database.vehicles||[]){
    if(!v?.id || !v?.sourceId || !v?.make || !v?.model || ['sold','unavailable','filtered'].includes(v.status)) continue;
    if(!groups.has(v.sourceId)) groups.set(v.sourceId,[]);
    const askingPrice=Number(v.askingPrice);
    const margin=Number.isFinite(askingPrice)&&askingPrice>0
      ? Math.round(Math.max(Number(pricingConfig.minimumMargin)||0,askingPrice*(Number(pricingConfig.marginPercent)||0)/100)*100):0;
    groups.get(v.sourceId).push({
      id:String(v.id),vin:v.vin||undefined,year:v.year||undefined,
      make:v.make,model:v.model,trim:v.trim||undefined,
      mileage:v.mileageMi==null?undefined:Number(v.mileageMi),
      exteriorColor:v.exterior||undefined,drivetrain:v.drivetrain||undefined,
      fuelType:v.fuel||undefined,bodyStyle:v.bodyStyle||undefined,
      images:v.directImage?[v.directImage]:[],
      priceCents:Number.isFinite(askingPrice) && askingPrice>0
        ? Math.round(askingPrice*100):undefined,
      marginCents:margin,
      dealerName:v.sourceNameInternal||undefined,dealerUrl:v.sourceUrl||undefined
    });
  }
  return [...groups].map(([sourceId,payload])=>{
    const health=sources.get(sourceId);
    return {
      sourceKey:`roviq-site:${sourceId}`,payload,
      // Never retire unseen rows after a partial or failed dealer crawl.
      completeSnapshot:Boolean(health && Number(health.inventoryPagesOk)>0 && Number(health.inventoryPagesFailed)===0)
    };
  });
}

export async function publishCoreInventory(database,{baseUrl,email,password,pricingConfig,fetcher=fetch}){
  if(!baseUrl || !email || !password) throw new Error('core_inventory_credentials_missing');
  const login=await fetcher(new URL('/api/auth/login',baseUrl),{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({email,password})
  });
  if(!login.ok) throw new Error(`core_inventory_login_failed:${login.status}`);
  const {accessToken}=await login.json();
  if(!accessToken) throw new Error('core_inventory_token_missing');
  const batches=coreInventoryBatches(database,pricingConfig||{});
  if(!batches.length) throw new Error('core_inventory_feed_empty');
  const results=[];
  for(const batch of batches){
    const response=await fetcher(new URL('/api/admin/inventory/sync',baseUrl),{
      method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${accessToken}`},
      body:JSON.stringify({...batch,marginCents:0})
    });
    if(!response.ok) throw new Error(`core_inventory_sync_failed:${batch.sourceKey}:${response.status}`);
    results.push({sourceKey:batch.sourceKey,count:batch.payload.length,completeSnapshot:batch.completeSnapshot});
  }
  return results;
}
