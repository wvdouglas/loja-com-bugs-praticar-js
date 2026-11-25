const express = require('express');
const db = require('../db');
const { criarSessao, autenticar } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const dados = await db.ler();

  const usuario = dados.usuarios.find((u) => u.email === email && u.senha === senha);
  if (!usuario) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  const token = criarSessao(usuario);
  res.json({ token, usuario });
});

router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  const dados = await db.ler();

  const novo = {
    id: db.proximoId(dados.usuarios),
    nome,
    email,
    senha,
    papel: 'cliente',
  };

  dados.usuarios.push(novo);
  await db.salvar(dados);

  const token = criarSessao(novo);
  res.status(201).json({ token, usuario: novo });
});

router.get('/me', autenticar, (req, res) => {
  res.json(req.usuario);
});

module.exports = router;
