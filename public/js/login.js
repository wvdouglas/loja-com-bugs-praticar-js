document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('msg-login');
  msg.textContent = '';

  try {
    const { token, usuario } = await api('/auth/login', {
      method: 'POST',
      body: { email: form.email.value, senha: form.senha.value },
    });
    salvarSessao(token, usuario);
    window.location.href = 'index.html';
  } catch (erro) {
    msg.textContent = erro.message;
  }
});

document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('msg-cadastro');
  msg.textContent = '';

  try {
    const { token, usuario } = await api('/auth/cadastro', {
      method: 'POST',
      body: { nome: form.nome.value, email: form.email.value, senha: form.senha.value },
    });
    salvarSessao(token, usuario);
    window.location.href = 'index.html';
  } catch (erro) {
    msg.textContent = erro.message;
  }
});
