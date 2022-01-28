import React from 'react';
import ReactDOM from 'react-dom';
import {createApp} from '@backstage/app-defaults';
import {FlatRoutes} from '@backstage/core-app-api';
import {Route,Navigate,Link} from 'react-router-dom';
import {CatalogIndexPage,CatalogEntityPage,EntityLayout,EntityAboutCard,EntityDependsOnComponentsCard,EntityHasComponentsCard} from '@backstage/plugin-catalog';
import './style.css';
import {Documents} from './Documents';
const app=createApp({configLoader:async()=>[{context:'platform',data:{app:{title:'Platform Kit',baseUrl:window.location.origin},backend:{baseUrl:window.location.origin},organization:{name:'Platform engineering'}}}]});
const Provider=app.getProvider(),Router=app.getRouter();
function Layout({children}:{children:React.ReactNode}) {return <div className="workspace"><aside className="rail"><Link to="/catalog" className="brand">P<span>PLATFORM<br/>KIT</span></Link><p className="rail-label">YOUR WORKSPACE</p><nav aria-label="Main navigation"><Link to="/catalog">Service catalog</Link><Link to="/docs">Documentation</Link></nav><p className="rail-note">Know the owner.<br/>Ship with confidence.</p></aside><main>{children}</main></div>}
ReactDOM.render(<Provider><Router><Layout><FlatRoutes><Route path="/" element={<Navigate to="/catalog"/>}/><Route path="/docs" element={<Documents/>}/><Route path="/catalog" element={<CatalogIndexPage/>}/><Route path="/catalog/:namespace/:kind/:name" element={<CatalogEntityPage/>}><EntityLayout><EntityLayout.Route path="/" title="Overview"><div className="entity-grid"><EntityAboutCard/><EntityDependsOnComponentsCard/><EntityHasComponentsCard/></div></EntityLayout.Route></EntityLayout></Route></FlatRoutes></Layout></Router></Provider>,document.getElementById('root'));
