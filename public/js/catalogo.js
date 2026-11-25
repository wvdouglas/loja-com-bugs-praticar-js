let produtosDaPagina = [];
let paginaAtual = 1;

async function carregar(pagina = 1) {
  try {
    const dados = await api(`/produtos?pagina=${pagina}&limite=6`);
    paginaAtual = pagina;
    produtosDaPagina = dados.itens;
    renderizar();
    renderizarPaginacao(dados.totalPaginas);
  } catch (erro) {
    document.getElementById('grade').innerHTML = `<p class="erro">Não foi possível carregar: ${erro.message}</p>`;
  }
}

function ordenar(lista) {
  const modo = document.getElementById('ordenar').value;
  const copia = [...lista];

  if (modo === 'menor') {
    copia.sort((a, b) => a.preco - b.preco);
  } else if (modo === 'maior') {
    copia.sort((a, b) => b.preco - a.preco)
  } else if (modo === 'nome') {
    copia.sort((a, b) => a.nome.localeCompare(b.nome));
  }
  return copia;
}

function renderizar() {
  const grade = document.getElementById('grade');
  const lista = ordenar(produtosDaPagina);

  grade.innerHTML = lista.map((p) => `
    <article class="card">
      <a href="produto.html?id=${p.id}"><img src="${p.imagem}" alt="${p.nome}"></a>
      <h3><a href="produto.html?id=${p.id}">${p.nome}</a></h3>
      <p class="preco">${formatarPreco(p.preco)}</p>
      <p class="estoque">${p.estoque > 0 ? `${p.estoque} em estoque` : 'Esgotado'}</p>
      <button class="btn" data-id="${p.id}" data-nome="${p.nome}" data-preco="${p.preco}"
        ${p.estoque > 0 ? '' : 'disabled'}>Adicionar ao carrinho</button>
    </article>
  `).join('');

  grade.querySelectorAll('button[data-id]').forEach((botao) => {
    botao.addEventListener('click', () => adicionarAoCarrinho(botao));
  });
}

function renderizarPaginacao(totalPaginas) {
  const caixa = document.getElementById('paginacao');
  let html = '';
  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="${i === paginaAtual ? 'ativa' : ''}" data-pagina="${i}">${i}</button>`;
  }
  caixa.innerHTML = html;
  caixa.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => carregar(Number(b.dataset.pagina)));
  });
}

document.getElementById('ordenar').addEventListener('change', renderizar);
carregar(1);
