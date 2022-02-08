'use strict';
const path=require('path'),fs=require('fs'),esbuild=require('esbuild');
const root=path.join(__dirname,'..');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
esbuild.buildSync({entryPoints:[path.join(root,'packages/app/index.tsx')],bundle:true,minify:true,sourcemap:true,outdir:path.join(root,'dist'),platform:'browser',target:['chrome90','firefox88','safari14'],define:{global:'globalThis','process.env.NODE_ENV':'"production"'},loader:{'.svg':'dataurl','.png':'dataurl','.woff':'dataurl','.woff2':'dataurl'},logLevel:'info'});
fs.copyFileSync(path.join(root,'packages/app/index.html'),path.join(root,'dist/index.html'));
