'use strict';
const path=require('path');
const {ConfigReader}=require('@backstage/config');
const {DatabaseManager,UrlReaders,getRootLogger,SingleHostDiscovery}=require('@backstage/backend-common');
const {PermissionClient}=require('@backstage/plugin-permission-common');
const {CatalogBuilder}=require('@backstage/plugin-catalog-backend');
async function createCatalog() {
 const logger=getRootLogger();
 const config=new ConfigReader({
  app:{baseUrl:'http://localhost:4600'},
  backend:{listen:{host:'127.0.0.1',port:4600},baseUrl:'http://localhost:4600',database:{client:'pg',connection:{host:process.env.PGHOST||'127.0.0.1',port:Number(process.env.PGPORT||4612),user:process.env.PGUSER||'platform',password:process.env.PGPASSWORD||'platform-local-only',database:'platform'}}},
  catalog:{locations:[{type:'file',target:path.join(__dirname,'../catalog/entities.yaml')}],rules:[{allow:['Component','API','System','Group','User','Resource','Location']}]}
 });
 const database=DatabaseManager.fromConfig(config).forPlugin('catalog');
 const builder=await CatalogBuilder.create({config,database,logger,permissions:new PermissionClient({config,discovery:SingleHostDiscovery.fromConfig(config)}),reader:UrlReaders.default({config,logger})});
 const {processingEngine,router}=await builder.build();
 await processingEngine.start();
 return {router,stop:async()=>{await processingEngine.stop();const client=await database.getClient();await client.destroy();}};
}
module.exports={createCatalog};
