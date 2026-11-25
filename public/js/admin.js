const usuarioAtual = obterUsuario();
const form = document.getElementById('form-produto');

if (!usuarioAtual || usuarioAtual.papel !== 'admin') {
  document.getElementById('restrito').hidden = false;
} else {
  document.getElementById('painel').hidden = false;
  carregarTabela();
}

async function carregarTabela() {
  try {
    const produtos = await api('/admin/produtos');
    const corpo = document.getElementById('tabela-produtos');
    corpo.innerHTML = produtos.map((p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.nome}</td>
        <td>${formatarPreco(p.preco)}</td>
        <td>${p.estoque}</td>
        <td>
          <button class="btn-sec" data-editar="${p.id}">Editar</button>
          <button class="btn-perigo" data-excluir="${p.id}">Excluir</button>
        </td>
      </tr>
    `).join('');

    corpo.querySelectorAll('[data-editar]').forEach((b) =>
      b.addEventListener('click', () => editar(b.dataset.editar)));
    corpo.querySelectorAll('[data-excluir]').forEach((b) =>
      b.addEventListener('click', () => excluir(b.dataset.excluir)));
  } catch (erro) {
    avisar(erro.message, 'erro');
  }
}

async function editar(id) {
  try {
    const p = await api(`/admin/produtos/${id}`);
    form.id.value = p.id;
    form.nome.value = p.nome;
    form.preco.value = p.preco;
    form.estoque.value = p.estoque;
    form.imagem.value = p.imagem;
    document.getElementById('btn-salvar').textContent = 'Salvar alterações';
    document.getElementById('btn-cancelar').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    avisar(`Não foi possível abrir o produto: ${erro.message}`, 'erro');
  }
}

async function excluir(id) {
  if (!confirm(`Excluir o produto #${id}?`)) return;
  try {
    await api(`/admin/produtos/${id}`, { method: 'DELETE' });
    avisar('Produto excluído.');
    carregarTabela();
  } catch (erro) {
    avisar(erro.message, 'erro');
  }
}

function limparFormulario() {
  form.reset();
  form.id.value = '';
  document.getElementById('btn-salvar').textContent = 'Cadastrar produto';
  document.getElementById('btn-cancelar').hidden = true;
}

document.getElementById('btn-cancelar').addEventListener('click', limparFormulario);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const corpo = {
    nome: form.nome.value,
    preco: form.preco.value,
    estoque: form.estoque.value,
    imagem: form.imagem.value,
  };

  try {
    if (form.id.value) {
      await api(`/admin/produtos/${form.id.value}`, { method: 'PUT', body: corpo });
      avisar('Produto atualizado.');
    } else {
      await api('/admin/produtos', { method: 'POST', body: corpo });
      avisar('Produto cadastrado.');
    }
    limparFormulario();
    carregarTabela();
  } catch (erro) {
    avisar(erro.message, 'erro');
  }
});
