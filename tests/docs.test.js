const assert=require('assert');
exports['documentation resolves known articles and rejects arbitrary files'] = () => {
 const {readDocument,listDocuments}=require('../src/docs');
 assert(readDocument('onboarding').body.includes('owner'));
 assert(listDocuments().some(d=>d.id==='api'));
 assert.throws(()=>readDocument('../package.json'),/Unknown/);
};
