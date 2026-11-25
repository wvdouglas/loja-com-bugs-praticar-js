async function carregarPedidos() {
  const caixa = document.getElementById('lista-pedidos');

  if (!obterToken()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const pedidos = await api('/pedidos');
    if (pedidos.length === 0) {
      caixa.innerHTML = '<p class="vazio">Você ainda não fez nenhum pedido.</p>';
      return;
    }

    caixa.innerHTML = pedidos.map((p) => `
      <div class="pedido">
        <div>
          <strong>Pedido #${p.id}</strong>
          <span class="data">${formatarData(p.data)}</span>
          <span class="status status-${p.status}">${p.status}</span>
        </div>
        <div>
          <span class="preco">${formatarPreco(p.total)}</span>
          <button class="btn-sec" data-id="${p.id}">Ver detalhes</button>
        </div>
      </div>
    `).join('');

    caixa.querySelectorAll('button[data-id]').forEach((b) => {
      b.addEventListener('click', () => verDetalhes(b.dataset.id));
    });
  } catch (erro) {
    caixa.innerHTML = `<p class="erro">${erro.message}</p>`;
  }
}

async function verDetalhes(id) {
  const caixa = document.getElementById('detalhe-pedido');
  caixa.hidden = false;
  caixa.innerHTML = 'Carregando...';

  try {
    const p = await api(`/pedidos/${id}`);
    caixa.innerHTML = `
      <h2>Pedido #${p.id}</h2>
      <ul>
        ${p.itens.map((i) => `<li>${i.quantidade}x ${i.nome} — ${formatarPreco(i.preco)}</li>`).join('')}
      </ul>
      <p>Desconto: ${formatarPreco(p.desconto)}</p>
      <p><strong>Total: ${formatarPreco(p.total)}</strong></p>
    `;
  } catch (erro) {
    caixa.innerHTML = `<p class="erro">${erro.message}</p>`;
  }
}

carregarPedidos();
