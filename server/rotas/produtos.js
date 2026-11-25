const express = require('express');
const db = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

// GET /api/produtos?pagina=1&limite=6
router.get('/', async (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 6;
  const dados = await db.ler();

  const total = dados.produtos.length;
  const inicio = pagina * limite;
  const itens = dados.produtos.slice(inicio, inicio + limite);

  res.json({
    itens,
    pagina,
    totalPaginas: Math.ceil(total / limite),
    total,
  });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const dados = await db.ler();

  const produto = dados.produtos.find((p) => p.id === id);
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  const avaliacoes = dados.avaliacoes.filter((a) => a.produtoId === id);
  res.json({ ...produto, avaliacoes });
});

router.post('/:id/avaliacoes', autenticar, async (req, res) => {
  const id = Number(req.params.id);
  const { texto, nota } = req.body;
  const dados = await db.ler();

  const avaliacao = {
    id: db.proximoId(dados.avaliacoes),
    produtoId: id,
    autor: req.usuario.nome,
    texto,
    nota: Number(nota) || 5,
  };

  dados.avaliacoes.push(avaliacao);
  await db.salvar(dados);
  res.status(201).json(avaliacao);
});

module.exports = router;
