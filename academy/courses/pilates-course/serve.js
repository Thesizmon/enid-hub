const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const ext2ct = {'.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.js':'text/javascript','.css':'text/css','.ico':'image/x-icon'};
http.createServer((req,res) => {
  const pathname = req.url === '/' ? '/home.html' : req.url.split('?')[0];
  const fp = path.join(root, decodeURIComponent(pathname));
  try {
    const data = fs.readFileSync(fp);
    res.writeHead(200,{'Content-Type':ext2ct[path.extname(fp).toLowerCase()]||'application/octet-stream','Access-Control-Allow-Origin':'*'});
    res.end(data);
  } catch(e) { res.writeHead(404); res.end(); }
}).listen(5500, () => console.log('Serving on http://localhost:5500'));
