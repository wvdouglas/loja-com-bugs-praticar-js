// Funções compartilhadas por todas as páginas da loja.
const API = '/api';

function obterToken() {
  return sessionStorage.getItem('token');
}

function obterUsuario() {
  const bruto = sessionStorage.getItem('usuario');
  return bruto ? JSON.parse(bruto) : null;
}

function salvarSessao(token, usuario) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
}

function limparSessao() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
}

function sair() {
  window.location.href = 'login.html';
}

async function api(caminho, opcoes = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
  const token = obterToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const resposta = await fetch(API + caminho, {
    ...opcoes,
    headers,
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });

  let dados = null;
  const tipo = resposta.headers.get('content-type') || '';
  if (tipo.includes('application/json')) {
    dados = await resposta.json();
  }

  if (!resposta.ok) {
    if (resposta.status === 401) limparSessao();
    const erro = new Error((dados && dados.erro) || `Erro ${resposta.status}`);
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

function obterCarrinho() {
  try {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function avisar(texto, tipo = 'ok') {
  const caixa = document.createElement('div');
  caixa.className = `aviso aviso-${tipo}`;
  caixa.textContent = texto;
  document.body.appendChild(caixa);
  setTimeout(() => caixa.remove(), 3000);
}

function montarCabecalho() {
  const cabecalho = document.getElementById('cabecalho');
  if (!cabecalho) return;

  const usuario = obterUsuario();
  const qtd = obterCarrinho().length;

  cabecalho.innerHTML = `
    <a class="logo" href="index.html">🖥️ TechLoja</a>
    <nav>
      <a href="index.html">Catálogo</a>
      <a href="carrinho.html">Carrinho (${qtd})</a>
      ${usuario ? '<a href="pedidos.html">Meus pedidos</a>' : ''}
      ${usuario && usuario.papel === 'admin' ? '<a href="admin.html">Admin</a>' : ''}
      ${usuario
        ? `<span class="ola">Olá, ${usuario.nome}</span> <button id="btn-sair" class="btn-sec">Sair</button>`
        : '<a href="login.html" class="btn">Entrar</a>'}
    </nav>
  `;

  const botaoSair = document.getElementById('btn-sair');
  if (botaoSair) botaoSair.addEventListener('click', sair);
}

function adicionarAoCarrinho(botao) {
  const carrinho = obterCarrinho();
  carrinho.push({
    produtoId: Number(botao.dataset.id),
    nome: botao.dataset.nome,
    preco: botao.dataset.preco,
  });
  salvarCarrinho(carrinho);
  montarCabecalho();
  avisar(`"${botao.dataset.nome}" adicionado ao carrinho`);
}

document.addEventListener('DOMContentLoaded', montarCabecalho);
