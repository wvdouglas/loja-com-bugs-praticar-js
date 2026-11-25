const idProduto = new URLSearchParams(window.location.search).get('id');

async function carregarProduto() {
  try {
    const p = await api(`/produtos/${idProduto}`);
    document.title = `TechLoja — ${p.nome}`;

    document.getElementById('detalhe').innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <div>
        <h1>${p.nome}</h1>
        <p class="preco grande">${formatarPreco(p.preco)}</p>
        <p class="estoque">${p.estoque > 0 ? `${p.estoque} em estoque` : 'Esgotado'}</p>
        <button class="btn" id="btn-add" data-id="${p.id}" data-nome="${p.nome}" data-preco="${p.preco}"
          ${p.estoque > 0 ? '' : 'disabled'}>Adicionar ao carrinho</button>
      </div>
    `;
    document.getElementById('btn-add').addEventListener('click', (e) => adicionarAoCarrinho(e.target));

    renderizarAvaliacoes(p.avaliacoes);
  } catch (erro) {
    document.getElementById('detalhe').innerHTML = `<p class="erro">${erro.message}</p>`;
  }
}

function renderizarAvaliacoes(avaliacoes) {
  const lista = document.getElementById('lista-avaliacoes');
  if (avaliacoes.length === 0) {
    lista.innerHTML = '<li class="vazio">Nenhuma avaliação ainda.</li>';
    return;
  }
  lista.innerHTML = avaliacoes.map((a) => `
    <li>
      <strong>${a.autor}</strong> <span class="estrelas">${'★'.repeat(a.nota)}</span>
      <p>${a.texto}</p>
    </li>
  `).join('');
}

document.getElementById('form-avaliacao').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!obterToken()) {
    window.location.href = 'login.html';
    return;
  }
  const form = e.target;
  try {
    await api(`/produtos/${idProduto}/avaliacoes`, {
      method: 'POST',
      body: { texto: form.texto.value, nota: form.nota.value },
    });
    form.reset();
    avisar('Avaliação enviada. Obrigado!');
    carregarProduto();
  } catch (erro) {
    avisar(erro.message, 'erro');
  }
});

carregarProduto();
