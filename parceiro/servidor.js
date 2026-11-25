// Servidor do "site parceiro" — simula outra empresa consumindo a API da loja.
// Não mexa aqui: o problema do chamado está na API da loja.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTA = 5500;

http.createServer((req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(PORTA, () => {
  console.log(`🤝 Site parceiro rodando em http://localhost:${PORTA}`);
});
