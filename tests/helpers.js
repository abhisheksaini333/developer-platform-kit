const http=require('http');
function request(port,path,method='GET',body,headers={}){return new Promise((resolve,reject)=>{const req=http.request({host:'127.0.0.1',port,path,method,headers:{'Content-Type':'application/json',...headers}},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>{try{resolve({status:res.statusCode,headers:res.headers,body:JSON.parse(body)})}catch{resolve({status:res.statusCode,headers:res.headers,body})}})});req.on('error',reject);req.end(body===undefined?undefined:JSON.stringify(body));});}
module.exports={request};
