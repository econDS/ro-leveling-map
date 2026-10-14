const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
test('v2 release integrity, stable identity and preserved worker catalog exclusion',()=>{
 const dir='assets/ro-suite/2.0.0/',lock=JSON.parse(fs.readFileSync(dir+'nav.lock.json'));
 assert.equal(lock.bundleVersion,'2.0.0');
 for(const [name,meta] of Object.entries(lock.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+name)).digest('hex'),meta.sha256,name);
 const html=fs.readFileSync('index.html','utf8');
 assert.match(html,/<ro-suite-nav tool-id="leveling-map"/);
 assert.equal(html.split('./assets/ro-suite/2.0.0/nav.js').length,2);
 assert.match(fs.readFileSync('service-worker.js','utf8'),/!url.pathname.startsWith\(APP_ROOT.pathname\)/);
});
