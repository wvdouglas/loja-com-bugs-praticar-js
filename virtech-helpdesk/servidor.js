// Servidor estático do Virtech Service Desk (porta 4000).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTA = 4000;
const RAIZ = __dirname;
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };

http.createServer((req, res) => {
  const caminho = decodeURIComponent(req.url.split('?')[0]);
  const arquivo = path.normalize(path.join(RAIZ, caminho === '/' ? 'index.html' : caminho));

  if (!arquivo.startsWith(RAIZ) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
    res.writeHead(404);
    return res.end('Não encontrado');
  }
  res.writeHead(200, { 'Content-Type': `${TIPOS[path.extname(arquivo)] || 'text/plain'}; charset=utf-8` });
  fs.createReadStream(arquivo).pipe(res);
}).listen(PORTA, () => {
  console.log(`🎧 Virtech Service Desk em http://localhost:${PORTA}`);
});
