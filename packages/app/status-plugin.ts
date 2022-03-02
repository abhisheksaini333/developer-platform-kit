import {createPlugin,createRouteRef,createRoutableExtension} from '@backstage/core-plugin-api';
const rootRouteRef=createRouteRef({id:'platform-status'});
export const platformStatusPlugin=createPlugin({id:'platform-status',routes:{root:rootRouteRef}});
export const PlatformStatusPage=platformStatusPlugin.provide(createRoutableExtension({name:'PlatformStatusPage',component:()=>import('./Status').then(m=>m.Status),mountPoint:rootRouteRef}));
