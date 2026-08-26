const http = require('http'), fs = require('fs'), path = require('path');
const root = require('path').resolve(process.argv[2] || '.');
const MIME = { '.html':'text/html;charset=utf-8', '.js':'text/javascript;charset=utf-8',
  '.css':'text/css;charset=utf-8', '.json':'application/json', '.webmanifest':'application/manifest+json',
  '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.jpg':'image/jpeg' };
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(root, p);
  if (!f.startsWith(path.resolve(root))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e,d)=>{
    if (e) { res.writeHead(404, {'content-type':'text/plain'}); return res.end('404 '+p); }
    res.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream',
                        'service-worker-allowed':'/'});
    res.end(d);
  });
}).listen(8099, ()=>console.log('serving', path.resolve(root), 'on 8099'));
