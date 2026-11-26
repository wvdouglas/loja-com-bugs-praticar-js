const express = require('express');
const db = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.get('/', autenticar, async (req, res) => {
  const dados = await db.ler();
  const meus = dados.pedidos
    .filter((p) => p.usuarioId === req.usuario.id)
    .sort((a, b) => b.id - a.id);
  res.json(meus);
});

router.get('/:id', autenticar, async (req, res) => {
  const dados = await db.ler();
  const pedido = dados.pedidos.find(
    (p) => p.id === req.params.id && p.usuarioId === req.usuario.id
  );

  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido não encontrado.' });
  }
  res.json(pedido);
});

router.post('/', autenticar, async (req, res) => {
  const { itens, desconto = 0 } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Carrinho vazio.' });
  }

  // Simula a chamada ao gateway de pagamento (demora ~1,5s)
  await esperar(1500);

  const dados = await db.ler();

  // for (const item of itens) {
  //   const produto = dados.produtos.find((p) => p.id === item.produtoId);

  //   if (produto.estoque > 0) {
  //     produto.estoque >= item.quantidade;
  //   } else {
  //     return res.status(409).json({ erro: `Produto "${produto.nome}" sem estoque.` });
  //   }
  // }
//VT-1006
    for (const item of itens) {
    const produto = dados.produtos.find((p) => p.id === item.produtoId);

    if (produto.estoque < item.quantidade) {
      return res.status(409).json({
        erro: `Produto "${produto.nome}" sem estoque suficiente. Disponível: ${produto.estoque}.`,
      });
    }
  }

  const subtotal = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
  const total = Math.max(subtotal - desconto, 0);

  const pedido = {
    id: db.proximoId(dados.pedidos, 1001),
    usuarioId: req.usuario.id,
    data: new Date().toISOString().slice(0, 10),
    status: 'pago',
    itens: itens.map((i) => ({
      produtoId: i.produtoId,
      nome: i.nome,
      preco: i.preco,
      quantidade: i.quantidade,
    })),
    desconto,
    total: Number(total.toFixed(2)),
  };

  dados.pedidos.push(pedido);
  await db.salvar(dados);
  res.status(201).json(pedido);
});

module.exports = router;
