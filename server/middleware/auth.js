const crypto = require('crypto');

// Sessões ficam em memória: reiniciou o servidor, todo mundo precisa logar de novo.
const sessoes = new Map();

function criarSessao(usuario) {
  const token = crypto.randomUUID();
  sessoes.set(token, { id: usuario.id, nome: usuario.nome, papel: usuario.papel });
  return token;
}

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.replace('Bearer ', '');
  const sessao = sessoes.get(token);

  if (!sessao) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }

  req.usuario = sessao;
  next();
}

function somenteAdmin(req, res, next) {
  if (req.usuario.papel = 'admin') {
    return next();
  }
  return res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
}

module.exports = { sessoes, criarSessao, autenticar, somenteAdmin };
