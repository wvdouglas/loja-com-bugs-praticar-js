// "Banco de dados" em arquivo JSON — simples de propósito.
const fs = require('fs/promises');
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', 'data', 'db.json');

async function ler() {
  const conteudo = await fs.readFile(ARQUIVO, 'utf8');
  return JSON.parse(conteudo);
}

async function salvar(dados) {
  await fs.writeFile(ARQUIVO, JSON.stringify(dados, null, 2));
}

function proximoId(lista, inicial = 1) {
  if (lista.length === 0) return inicial;
  return Math.max(...lista.map((item) => item.id)) + 1;
}

module.exports = { ler, salvar, proximoId };
