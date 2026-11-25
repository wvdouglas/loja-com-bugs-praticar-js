let desconto = 0;

function calcularSubtotal() {
  return obterCarrinho().reduce((soma, item) => soma + Number(item.preco), 0);
}

function renderizar() {
  const carrinho = obterCarrinho();
  const lista = document.getElementById("itens");

  if (carrinho.length === 0) {
    lista.innerHTML =
      '<li class="vazio">Seu carrinho está vazio. <a href="index.html">Ver produtos</a></li>';
  } else {
    lista.innerHTML = carrinho
      .map(
        (item, indice) => `
      <li>
        <span>${item.nome}</span>
        <span>${formatarPreco(item.preco)}</span>
        <button class="btn-sec" data-indice="${indice}">Remover</button>
      </li>
    `,
      )
      .join("");
  }

  lista.querySelectorAll("button[data-indice]").forEach((b) => {
    b.addEventListener("click", () => {
      const atual = obterCarrinho();
      atual.splice(Number(b.dataset.indice), 1);
      salvarCarrinho(atual);
      montarCabecalho();
      renderizar();
    });
  });

  const subtotal = calcularSubtotal();
  const total = Math.max(subtotal - desconto, 0);

  document.getElementById("subtotal").textContent = formatarPreco(subtotal);
  document.getElementById("desconto").textContent = formatarPreco(desconto);
  document.getElementById("total").textContent = formatarPreco(total);
}

document.getElementById("btn-cupom").addEventListener("click", () => {
  const codigo = document.getElementById("cupom").value.trim().toUpperCase();
  if (codigo === "DESCONTO10") {
    desconto += Number(calcularSubtotal()) * 0.1;
    avisar("Cupom aplicado: 10% de desconto!");
  } else {
    avisar("Cupom inválido", "erro");
  }
  renderizar();
});

document.getElementById("btn-finalizar").addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  msg.textContent = "";

  if (!obterToken()) {
    window.location.href = "login.html";
    return;
  }

  const carrinho = obterCarrinho();
  if (carrinho.length === 0) {
    msg.textContent = "Seu carrinho está vazio.";
    return;
  }

  // Agrupa itens repetidos em um só, com quantidade
  const agrupados = {};
  for (const item of carrinho) {
    if (!agrupados[item.produtoId]) {
      agrupados[item.produtoId] = {
        produtoId: item.produtoId,
        nome: item.nome,
        preco: Number(item.preco),
        quantidade: 0,
      };
    }
    agrupados[item.produtoId].quantidade++;
  }

  const botao = document.getElementById("btn-finalizar");
  botao.textContent = "Processando pagamento...";

  try {
    const pedido = await api("/pedidos", {
      method: "POST",
      body: { itens: Object.values(agrupados), desconto },
    });
    salvarCarrinho([]);
    desconto = 0;
    montarCabecalho();
    renderizar();
    avisar(`Pedido #${pedido.id} realizado com sucesso!`);
    setTimeout(() => (window.location.href = "pedidos.html"), 1500);
  } catch (erro) {
    msg.textContent = erro.message;
  } finally {
    botao.textContent = "Finalizar compra";
  }
});

renderizar();
