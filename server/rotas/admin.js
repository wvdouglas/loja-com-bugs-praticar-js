const express = require('express');
const db = require('../db');
const { autenticar, somenteAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(autenticar, somenteAdmin);

router.get('/produtos', async (req, res) => {
  const dados = await db.ler();
  res.json(dados.produtos);
});

router.get('/produtos/:id', (req, res) => {
  const dados = db.ler();
  const produto = dados.produtos.find((p) => p.id === Number(req.params.id));

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }
  res.json(produto);
});

router.post('/produtos', async (req, res) => {
  const { nome, preco, estoque, imagem } = req.body;
  const dados = await db.ler();

  const produto = {
    id: db.proximoId(dados.produtos),
    nome,
    preco: Number(preco),
    estoque: Number(estoque),
    imagem: imagem || 'imagens/sem-foto.svg',
  };

  dados.produtos.push(produto);
  await db.salvar(dados);
  res.status(201).json(produto);
});

router.put('/produtos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const dados = await db.ler();
  const produto = dados.produtos.find((p) => p.id === id);

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  const { nome, preco, estoque, imagem } = req.body;
  if (nome !== undefined) produto.nome = nome;
  if (preco !== undefined) produto.preco = Number(preco);
  if (estoque !== undefined) produto.estoque = Number(estoque);
  if (imagem !== undefined) produto.imagem = imagem;

  await db.salvar(dados);
  res.json(produto);
});

router.delete('/produtos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const dados = await db.ler();
  const antes = dados.produtos.length;

  dados.produtos = dados.produtos.filter((p) => p.id !== id);
  if (dados.produtos.length === antes) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  await db.salvar(dados);
  res.status(204).end();
});

module.exports = router;
