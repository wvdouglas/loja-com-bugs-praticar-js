const express = require('express');
const path = require('path');

const rotasAuth = require('./rotas/auth');
const rotasProdutos = require('./rotas/produtos');
const rotasPedidos = require('./rotas/pedidos');
const rotasAdmin = require('./rotas/admin');

const app = express();
const PORTA = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', rotasAuth);
app.use('/api/produtos', rotasProdutos);
app.use('/api/pedidos', rotasPedidos);
app.use('/api/admin', rotasAdmin);

app.listen(PORTA, () => {
  console.log(`🛒 HelpDesk Loja rodando em http://localhost:${PORTA}`);
});
