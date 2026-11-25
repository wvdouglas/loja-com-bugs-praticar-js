// ======================================================================
//  Base de chamados do Virtech Service Desk
//  Cliente atendido: TechLoja (e-commerce mantido pela Virtech)
//  Ambiente local da loja: http://localhost:3000
// ======================================================================

// ---------- Pequenos "construtores" de evidência ----------
const topoLoja = (usuario) => `
  <div class="mp-top"><b>🖥️ TechLoja</b>
    <span>Catálogo · Carrinho${usuario ? ` · Meus pedidos · <i>Olá, ${usuario}</i> · <u>Sair</u>` : ' · <u>Entrar</u>'}</span>
  </div>`;

const print = (titulo, url, html, opcoes = {}) => ({ tipo: 'print', titulo, url, html, ...opcoes });
const consoleLog = (titulo, linhas) => ({ tipo: 'console', titulo, linhas });
const rede = (titulo, dados) => ({ tipo: 'rede', titulo, ...dados });
const terminal = (titulo, linhas) => ({ tipo: 'terminal', titulo, linhas });
const storage = (titulo, chaves) => ({ tipo: 'storage', titulo, chaves });

// ---------- Chamados ----------
// chegada: minutos em relação ao início do seu turno (negativo = já estava na fila)
window.CHAMADOS = [
  {
    id: 'VT-1001',
    titulo: 'Clientes não conseguem entrar pelo celular',
    nivel: 'N1', prioridade: 'Alta', categoria: 'Login / Autenticação', chegada: -42,
    solicitante: { nome: 'Fernanda Rocha', cargo: 'Supervisora de SAC — TechLoja', canal: 'E-mail' },
    ambiente: 'Chrome Android / Safari iPhone',
    descricao: `Bom dia, pessoal da Virtech.

Desde ontem estamos recebendo MUITA reclamação no SAC de cliente que não consegue entrar pelo celular. Aparece "E-mail ou senha inválidos", mas o cliente jura que a senha está certa.

O mais estranho: eu peguei o login de um cliente que reclamou (joao@email.com / 123456, ele autorizou) e no computador entrou normal. No meu celular deu erro igual ao dele.

Já pedi pros clientes trocarem a senha e não resolveu. Estamos perdendo venda, por favor vejam com urgência.`,
    evidencias: [
      print('Print enviado pela cliente (celular)', 'localhost:3000/login.html', `
        ${topoLoja()}
        <div class="mp-form">
          <h4>Já sou cliente</h4>
          <label>E-mail</label><div class="mp-input">Joao@email.com</div>
          <label>Senha</label><div class="mp-input">••••••</div>
          <div class="mp-btn">Entrar</div>
          <p class="mp-erro">E-mail ou senha inválidos.</p>
        </div>`, { dispositivo: 'mobile' }),
    ],
    dica: 'Compare, caractere por caractere, o e-mail que chega no back-end com o que está salvo no banco. Teclado de celular tem um costume...',
  },
  {
    id: 'VT-1002',
    titulo: 'Preciso logar de novo toda vez que abro outra aba',
    nivel: 'N1', prioridade: 'Média', categoria: 'Login / Sessão', chegada: -35,
    solicitante: { nome: 'Ricardo Alves', cargo: 'Gerente Comercial — TechLoja', canal: 'Portal' },
    ambiente: 'Chrome Windows',
    descricao: `Olá.

Eu faço login na loja, aí clico com o botão do meio num produto pra abrir em outra aba (pra comparar) e na aba nova aparece "Entrar" como se eu não estivesse logado. Volto na aba antiga e lá continuo logado.

Os clientes também reclamam disso. Isso sempre foi assim? Em qualquer outro site eu fico logado em todas as abas.`,
    evidencias: [
      print('Aba 1 — logado', 'localhost:3000/index.html', `
        ${topoLoja('Administrador')}
        <div class="mp-grade"><div class="mp-card">⌨️<br>Teclado</div><div class="mp-card">🖱️<br>Mouse</div><div class="mp-card">🖥️<br>Monitor</div></div>`),
      print('Aba 2 — mesmo site, segundos depois', 'localhost:3000/produto.html?id=8', `
        ${topoLoja()}
        <div class="mp-form"><h4>SSD NVMe 1TB</h4><p>R$ 459,90</p><div class="mp-btn">Adicionar ao carrinho</div></div>`),
    ],
    dica: 'Abra o DevTools > Application e veja ONDE o token está guardado. Cada tipo de storage tem um escopo diferente.',
  },
  {
    id: 'VT-1003',
    titulo: 'Total do carrinho aparece "R$ NaN"',
    nivel: 'N1', prioridade: 'Crítica', categoria: 'Carrinho', chegada: -28,
    solicitante: { nome: 'Lucas Martins', cargo: 'Cliente final (via chat)', canal: 'Chat' },
    ambiente: 'Chrome Windows',
    descricao: `oi, quero comprar um teclado e um headset mas o total do carrinho ta aparecendo R$ NaN 😡

com 1 produto so aparece certinho, quando coloco o segundo fica NaN. tentei limpar o cache e nada

como vou pagar um valor que nem existe??`,
    evidencias: [
      print('Print do cliente', 'localhost:3000/carrinho.html', `
        ${topoLoja('Lucas')}
        <div class="mp-lista"><div>Teclado Mecânico RGB <span>R$ 299,90</span></div><div>Headset 7.1 Surround <span>R$ 249,90</span></div></div>
        <div class="mp-resumo">Subtotal: <b class="mp-erro">R$ NaN</b><br>Desconto: R$ 0,00<br><b>Total: <span class="mp-erro">R$ NaN</span></b></div>`),
      storage('localStorage da máquina do cliente (coletado no acesso remoto)', [
        ['carrinho', '[{"produtoId":1,"nome":"Teclado Mecânico RGB","preco":"299.9"},{"produtoId":4,"nome":"Headset 7.1 Surround","preco":"249.9"}]'],
      ]),
    ],
    dica: 'Olhe com atenção o tipo do campo "preco" dentro do carrinho. O que acontece com 0 + "299.9" em JavaScript?',
  },
  {
    id: 'VT-1004',
    titulo: 'Data do pedido aparece um dia antes',
    nivel: 'N1', prioridade: 'Média', categoria: 'Pedidos', chegada: -20,
    solicitante: { nome: 'Patrícia Gomes', cargo: 'Cliente final', canal: 'E-mail' },
    ambiente: 'Edge Windows — São Paulo',
    descricao: `Prezados,

Fiz um pedido hoje e em "Meus pedidos" está aparecendo a data de ontem. Preciso da data certa pra prestação de contas da minha empresa.

Meu marido comprou ontem à noite (umas 22h) e no dele apareceu certo... ou não, nem sei mais. Podem verificar?`,
    evidencias: [
      print('Tela "Meus pedidos"', 'localhost:3000/pedidos.html', `
        ${topoLoja('Patrícia')}
        <div class="mp-lista"><div><b>Pedido #1004</b> <span class="mp-erro">24/11/2026</span> <i>pago</i> <span>R$ 39,90</span></div></div>`),
      rede('Resposta da API (DevTools > Network)', {
        metodo: 'GET', url: '/api/pedidos', status: 200,
        resposta: [{ id: 1004, usuarioId: 4, data: '2026-11-25', status: 'pago', total: 39.9 }],
      }),
    ],
    dica: 'A API devolve "2026-11-25", mas a tela mostra 24/11. Pesquise como new Date("AAAA-MM-DD") interpreta o fuso horário.',
  },
  {
    id: 'VT-1005',
    titulo: 'Produtos sumiram do catálogo e a última página fica vazia',
    nivel: 'N2', prioridade: 'Alta', categoria: 'Catálogo / API', chegada: -12,
    solicitante: { nome: 'Camila Duarte', cargo: 'Analista de Marketing — TechLoja', canal: 'Portal' },
    ambiente: 'Qualquer navegador',
    descricao: `Pessoal, problema sério!

O "Teclado Mecânico RGB", que é o nosso produto MAIS VENDIDO, sumiu do catálogo. Se eu acesso pelo link direto (produto.html?id=1) ele abre normal, então ele existe. Só não aparece na listagem.

Contei e acho que estão faltando uns 6 produtos. E outra coisa: a página 3 do catálogo fica totalmente em branco.

Estamos com campanha rodando no Instagram apontando pro catálogo. Urgente!`,
    evidencias: [
      print('Página 3 do catálogo', 'localhost:3000/index.html', `
        ${topoLoja()}
        <h4 style="margin:10px">Catálogo</h4>
        <div class="mp-vazio">(nada aqui)</div>
        <div class="mp-pag"><span>1</span><span>2</span><span class="on">3</span></div>`),
      rede('Requisição da página 1', {
        metodo: 'GET', url: '/api/produtos?pagina=1&limite=6', status: 200,
        resposta: { itens: ['{ id: 7, ... }', '{ id: 8, ... }', '{ id: 9, ... }', '{ id: 10, ... }', '{ id: 11, ... }', '{ id: 12, ... }'], pagina: 1, totalPaginas: 3, total: 14 },
      }),
    ],
    dica: 'A página 1 começa no produto 7. Faça a conta de "inicio" no papel para pagina=1, 2 e 3.',
  },
  {
    id: 'VT-1006',
    titulo: 'Vendemos 3 microfones mas só tinha 1 no estoque',
    nivel: 'N2', prioridade: 'Crítica', categoria: 'Pedidos / Estoque', chegada: -6,
    solicitante: { nome: 'Paulo Henrique', cargo: 'Coordenador de Logística — TechLoja', canal: 'Telefone' },
    ambiente: 'Painel admin',
    descricao: `(Transcrição da ligação — atendente Virtech)

O Paulo ligou bem irritado. Um cliente comprou 3 unidades do "Microfone USB Condensador", mas só tinha 1 no galpão. O pedido foi aprovado e pago normalmente.

No painel admin o estoque do microfone está aparecendo NEGATIVO (-2). Ele quer saber como o sistema deixou vender o que não tem e precisa que isso não aconteça de novo, porque agora vai ter que cancelar e estornar.

Dá pra reproduzir: colocar o microfone 3x no carrinho e finalizar.`,
    evidencias: [
      print('Painel admin — tabela de produtos', 'localhost:3000/admin.html', `
        ${topoLoja('Administrador')}
        <table class="mp-tabela"><tr><th>ID</th><th>Nome</th><th>Preço</th><th>Estoque</th></tr>
        <tr><td>11</td><td>Mousepad XL</td><td>R$ 79,90</td><td>40</td></tr>
        <tr class="mp-destaque"><td>12</td><td>Microfone USB Condensador</td><td>R$ 349,90</td><td class="mp-erro">-2</td></tr>
        <tr><td>13</td><td>Cabo HDMI 2.1 2m</td><td>R$ 24,90</td><td>100</td></tr></table>`),
    ],
    dica: 'Veja a condição que o back-end usa para decidir se há estoque. Ela leva em conta a quantidade pedida?',
  },
  {
    id: 'VT-1007',
    titulo: 'Pedido saiu duplicado e fui cobrada duas vezes',
    nivel: 'N1', prioridade: 'Alta', categoria: 'Checkout', chegada: 0,
    solicitante: { nome: 'Maria Souza', cargo: 'Cliente final', canal: 'Reclame Aqui' },
    ambiente: 'Chrome Windows',
    descricao: `PÉSSIMO ATENDIMENTO!!!

Fui finalizar a compra de um pendrive, cliquei em "Finalizar compra", ficou carregando ("Processando pagamento...") e como demorou cliquei de novo. Resultado: DOIS pedidos e DUAS cobranças no meu cartão.

Quero meu dinheiro de volta e que arrumem esse site.`,
    evidencias: [
      print('Print anexado no Reclame Aqui', 'localhost:3000/pedidos.html', `
        ${topoLoja('Maria')}
        <div class="mp-lista">
          <div class="mp-destaque"><b>Pedido #1005</b> 25/11/2026 <i>pago</i> <span>R$ 39,90</span></div>
          <div class="mp-destaque"><b>Pedido #1004</b> 25/11/2026 <i>pago</i> <span>R$ 39,90</span></div>
        </div>`),
      rede('Network — duas requisições com 0,4s de diferença', {
        metodo: 'POST', url: '/api/pedidos  (x2)', status: 201,
        requisicao: { itens: [{ produtoId: 9, nome: 'Pendrive 64GB', preco: 39.9, quantidade: 1 }], desconto: 0 },
        resposta: '201 Created — #1004\n201 Created — #1005',
      }),
    ],
    dica: 'O que impede o usuário de clicar de novo enquanto o pagamento (1,5s) está sendo processado? Pense no front e no back.',
  },
  {
    id: 'VT-1008',
    titulo: '[LGPD] Senha do cliente aparece na resposta do login',
    nivel: 'N2', prioridade: 'Crítica', categoria: 'Segurança', chegada: 3,
    solicitante: { nome: 'Juliana Prado', cargo: 'Encarregada de Dados (DPO) — TechLoja', canal: 'E-mail' },
    ambiente: 'DevTools > Network',
    descricao: `Equipe Virtech,

Durante uma auditoria interna, nosso consultor abriu o DevTools no login e a resposta da API traz a SENHA do cliente em texto puro. Ela também fica salva no navegador (sessionStorage).

Isso é uma não conformidade grave com a LGPD. Precisamos de correção imediata e de um parecer de vocês sobre como as senhas estão sendo armazenadas no banco.`,
    evidencias: [
      rede('Resposta de POST /api/auth/login', {
        metodo: 'POST', url: '/api/auth/login', status: 200,
        requisicao: { email: 'joao@email.com', senha: '123456' },
        resposta: { token: '6f1c2a9e-...-b31d', usuario: { id: 2, nome: 'João Pereira', email: 'joao@email.com', senha: '123456', papel: 'cliente' } },
      }),
      storage('sessionStorage após o login', [
        ['token', '6f1c2a9e-...-b31d'],
        ['usuario', '{"id":2,"nome":"João Pereira","email":"joao@email.com","senha":"123456","papel":"cliente"}'],
      ]),
    ],
    dica: 'Nunca devolva o objeto inteiro do banco. Monte um objeto só com os campos públicos. Bônus: pesquise bcrypt.',
  },
  {
    id: 'VT-1009',
    titulo: 'Cliente entrou no painel admin e alterou preço',
    nivel: 'N2', prioridade: 'Crítica', categoria: 'Segurança / Permissões', chegada: 6,
    solicitante: { nome: 'Ricardo Alves', cargo: 'Gerente Comercial — TechLoja', canal: 'Telefone' },
    ambiente: 'Produção',
    descricao: `Gente, URGENTE.

Um cliente (João Pereira, joao@email.com) postou no Instagram um vídeo mostrando que entrou no nosso painel admin e mudou o preço do Cabo HDMI pra R$ 1,00. Ele disse que "só editou uma coisinha no navegador".

Como um cliente comum consegue acessar o admin?? Isso não deveria ser bloqueado no servidor?`,
    evidencias: [
      storage('Print do vídeo: cliente editando o sessionStorage', [
        ['usuario', '{"id":2,"nome":"João Pereira","email":"joao@email.com","papel":"admin"}  ← editado à mão'],
      ]),
      rede('Requisição feita pelo cliente', {
        metodo: 'PUT', url: '/api/admin/produtos/13', status: 200,
        requisicao: { nome: 'Cabo HDMI 2.1 2m', preco: '1', estoque: '100' },
        resposta: { id: 13, nome: 'Cabo HDMI 2.1 2m', preco: 1, estoque: 100 },
      }),
    ],
    dica: 'O front esconder o menu não é segurança. Leia com MUITA atenção a condição do middleware somenteAdmin (um caractere faz toda a diferença).',
  },
  {
    id: 'VT-1010',
    titulo: 'Erro 500 ao clicar em "Editar" produto',
    nivel: 'N2', prioridade: 'Alta', categoria: 'Painel Admin', chegada: 9,
    solicitante: { nome: 'Administrador TechLoja', cargo: 'Operador do e-commerce', canal: 'Portal' },
    ambiente: 'Painel admin — admin@loja.com / admin123',
    descricao: `Quando clico em "Editar" em QUALQUER produto aparece "Não foi possível abrir o produto: Erro 500".

Cadastrar produto novo e excluir funcionam. Só editar que não. Preciso atualizar preços da Black Friday hoje!`,
    evidencias: [
      print('Painel admin', 'localhost:3000/admin.html', `
        ${topoLoja('Administrador')}
        <table class="mp-tabela"><tr><th>ID</th><th>Nome</th><th></th></tr>
        <tr><td>1</td><td>Teclado Mecânico RGB</td><td><span class="mp-chip">Editar</span></td></tr></table>
        <div class="mp-toast">Não foi possível abrir o produto: Erro 500</div>`),
      terminal('Log do servidor (terminal do npm start)', [
        'TypeError: Cannot read properties of undefined (reading \'find\')',
        '    at D:\\treino-chamados-js\\server\\rotas\\admin.js:16:35',
        '    at Layer.handle [as handle_request] (node_modules\\express\\lib\\router\\layer.js:95:5)',
      ]),
    ],
    dica: 'Compare a rota de editar com as outras rotas do mesmo arquivo. db.ler() devolve o quê?',
  },
  {
    id: 'VT-1011',
    titulo: 'Fotos de alguns produtos não aparecem',
    nivel: 'N1', prioridade: 'Baixa', categoria: 'Catálogo / Conteúdo', chegada: 12,
    solicitante: { nome: 'Camila Duarte', cargo: 'Analista de Marketing — TechLoja', canal: 'Portal' },
    ambiente: 'Qualquer navegador',
    descricao: `Oi! O Mouse Gamer e a Webcam estão aparecendo sem foto (aquele ícone de imagem quebrada).

Mandamos e-mail marketing com o link direto deles: produto.html?id=2 e produto.html?id=5. As fotos foram enviadas pela agência na semana passada, juro que estão no servidor.`,
    evidencias: [
      print('Página do produto', 'localhost:3000/produto.html?id=2', `
        ${topoLoja()}
        <div class="mp-form"><div class="mp-img-quebrada">🖼️✖</div><h4>Mouse Gamer 16000 DPI</h4><p>R$ 149,90</p></div>`),
      consoleLog('Console do navegador', [
        { nivel: 'erro', texto: 'GET http://localhost:3000/imagens/mouse.png 404 (Not Found)' },
      ]),
    ],
    dica: 'Abra a pasta public/imagens e compare com o que está cadastrado no banco.',
  },
  {
    id: 'VT-1012',
    titulo: 'Aparece "Você foi hackeado" na página do SSD',
    nivel: 'N2', prioridade: 'Crítica', categoria: 'Segurança', chegada: 15,
    solicitante: { nome: 'Fernanda Rocha', cargo: 'Supervisora de SAC — TechLoja', canal: 'E-mail' },
    ambiente: 'Qualquer navegador',
    descricao: `Vários clientes mandaram print: quando abrem a página do "SSD NVMe 1TB" aparece um alerta dizendo "Você foi hackeado! Seus dados foram enviados."

Os clientes estão com medo de comprar. A gente foi invadido?? Por favor verifiquem e removam isso.`,
    evidencias: [
      print('Print de um cliente', 'localhost:3000/produto.html?id=8', `
        ${topoLoja()}
        <div class="mp-form"><h4>SSD NVMe 1TB</h4><p>R$ 459,90</p></div>
        <div class="mp-dialogo"><b>localhost:3000 diz</b><p>Você foi hackeado! Seus dados foram enviados.</p><span class="mp-btn">OK</span></div>`),
    ],
    dica: 'Veja como as avaliações são colocadas na tela. Conteúdo digitado por usuário + innerHTML = ?',
  },
  {
    id: 'VT-1013',
    titulo: 'Parceiro BuscaPreço não consegue consumir nossa API (CORS)',
    nivel: 'N2', prioridade: 'Média', categoria: 'Integração', chegada: 18,
    solicitante: { nome: 'Thiago Nunes', cargo: 'Dev — BuscaPreço (parceiro)', canal: 'E-mail' },
    ambiente: 'Rodar: npm run parceiro → http://localhost:5500',
    descricao: `Hi team,

Estamos integrando o comparador BuscaPreço com a API de produtos de vocês. Pelo Postman funciona, mas no navegador dá erro de CORS e não conseguimos listar nada.

Nosso site roda em http://localhost:5500. Podem liberar nossa origem? Segue o erro do console.`,
    evidencias: [
      consoleLog('Console do site parceiro', [
        { nivel: 'erro', texto: "Access to fetch at 'http://localhost:3000/api/produtos?pagina=1&limite=50' from origin 'http://localhost:5500' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource." },
        { nivel: 'erro', texto: 'GET http://localhost:3000/api/produtos?pagina=1&limite=50 net::ERR_FAILED 200 (OK)' },
      ]),
    ],
    dica: 'O erro diz exatamente qual cabeçalho falta. Libere só a origem do parceiro, não "*" para tudo.',
  },
  {
    id: 'VT-1014',
    titulo: '[QA] Cadastro aceita e-mail inválido, senha de 1 dígito e e-mail duplicado',
    nivel: 'N1', prioridade: 'Média', categoria: 'Cadastro / Validação', chegada: 21,
    solicitante: { nome: 'Beatriz Lopes', cargo: 'Analista de QA — Virtech', canal: 'Interno' },
    ambiente: 'Tela de cadastro e Postman',
    descricao: `Bug encontrado na regressão:

1. Consegui criar conta com e-mail "abc" e senha "1".
2. Consegui criar conta com nome vazio.
3. Consegui criar DUAS contas com o mesmo e-mail (maria@email.com).

Esperado: validação no back-end (formato de e-mail, senha com no mínimo 6 caracteres, nome obrigatório, e-mail único), retornando 400/409 com mensagem amigável.`,
    evidencias: [
      rede('Postman', {
        metodo: 'POST', url: '/api/auth/cadastro', status: 201,
        requisicao: { nome: '', email: 'abc', senha: '1' },
        resposta: { token: 'a81e...', usuario: { id: 4, nome: '', email: 'abc', senha: '1', papel: 'cliente' } },
      }),
    ],
    dica: 'A validação do HTML pode ser burlada. A regra precisa estar na rota /cadastro.',
  },
  {
    id: 'VT-1015',
    titulo: 'Site inteiro caiu, tivemos que reiniciar o servidor',
    nivel: 'N2', prioridade: 'Crítica', categoria: 'Disponibilidade', chegada: 24,
    solicitante: { nome: 'Marcos Vieira', cargo: 'Infraestrutura — Virtech', canal: 'Monitoramento' },
    ambiente: 'Servidor Node',
    descricao: `Alerta do monitoramento: o site ficou fora do ar às 14:07 até reiniciarmos manualmente às 14:19.

Pelo horário, coincide com o pedido da cliente Maria. Ela disse ao SAC que tinha deixado produtos no carrinho "desde a semana passada". Lembrando que ontem o admin EXCLUIU a Webcam do catálogo.

Precisamos da causa raiz. Um erro em um pedido não pode derrubar o site inteiro.`,
    evidencias: [
      terminal('Último log antes da queda', [
        'D:\\treino-chamados-js\\server\\rotas\\pedidos.js:44',
        '    if (produto.estoque > 0) {',
        '                ^',
        "TypeError: Cannot read properties of undefined (reading 'estoque')",
        '    at D:\\treino-chamados-js\\server\\rotas\\pedidos.js:44:17',
        '',
        'Node.js v26.13.0',
        '[processo encerrado com código 1]',
      ]),
    ],
    dica: 'São dois problemas: o produto pode não existir mais, e o Express 4 não captura erro lançado dentro de função async.',
  },
  {
    id: 'VT-1016',
    titulo: 'Cupom DESCONTO10 acumulando: pedido saiu de graça',
    nivel: 'N1', prioridade: 'Alta', categoria: 'Carrinho / Cupom', chegada: 27,
    solicitante: { nome: 'Cláudia Ferraz', cargo: 'Financeiro — TechLoja', canal: 'E-mail' },
    ambiente: 'Carrinho',
    descricao: `Olá,

Um cliente postou num grupo de promoções: "aperta APLICAR no cupom DESCONTO10 várias vezes que o desconto vai somando". Testamos e é verdade: com 10 cliques o total fica R$ 0,00.

Já tivemos 4 pedidos assim hoje. O cupom deveria dar 10% UMA vez só.`,
    evidencias: [
      print('Carrinho após 10 cliques em "Aplicar"', 'localhost:3000/carrinho.html', `
        ${topoLoja('Cliente')}
        <div class="mp-lista"><div>Headset 7.1 Surround <span>R$ 249,90</span></div></div>
        <div class="mp-resumo">Subtotal: R$ 249,90<br>Desconto: <b class="mp-erro">R$ 249,90</b><br><b>Total: <span class="mp-erro">R$ 0,00</span></b></div>`),
    ],
    dica: 'Olhe o operador usado no desconto. E pergunte-se: o back-end deveria aceitar o valor de desconto que vem do navegador?',
  },
  {
    id: 'VT-1017',
    titulo: '"Menor preço" não ordena direito',
    nivel: 'N1', prioridade: 'Baixa', categoria: 'Catálogo', chegada: 30,
    solicitante: { nome: 'Rafael Costa', cargo: 'Cliente final', canal: 'Chat' },
    ambiente: 'Chrome Windows',
    descricao: `boa tarde. quando escolho "ordenar por menor preço" fica tudo bagunçado. aparece R$ 129,90, depois R$ 349,90, depois R$ 39,90...

39 reais é menor que 129, não? 🤔`,
    evidencias: [
      print('Catálogo ordenado por "Menor preço"', 'localhost:3000/index.html', `
        ${topoLoja()}
        <div class="mp-grade">
          <div class="mp-card">Hub USB-C<br><b>R$ 129,90</b></div><div class="mp-card">Microfone<br><b>R$ 349,90</b></div><div class="mp-card">Pendrive<br><b>R$ 39,90</b></div>
          <div class="mp-card">Notebook<br><b>R$ 4.599,00</b></div><div class="mp-card">SSD<br><b>R$ 459,90</b></div><div class="mp-card">Mousepad<br><b>R$ 79,90</b></div>
        </div>`),
    ],
    dica: 'A ordenação está comparando textos ("R$ 129,90") ou números (129.9)?',
  },
  {
    id: 'VT-1018',
    titulo: '"Ver detalhes" do pedido sempre dá "Pedido não encontrado"',
    nivel: 'N1', prioridade: 'Média', categoria: 'Pedidos / API', chegada: 33,
    solicitante: { nome: 'João Pereira', cargo: 'Cliente final', canal: 'Portal' },
    ambiente: 'joao@email.com / 123456',
    descricao: `Em "Meus pedidos" meus pedidos aparecem na lista, mas quando clico em "Ver detalhes" aparece "Pedido não encontrado". Em todos.

Como assim não encontrado se ele está ali na lista??`,
    evidencias: [
      print('Meus pedidos', 'localhost:3000/pedidos.html', `
        ${topoLoja('João Pereira')}
        <div class="mp-lista"><div><b>Pedido #1001</b> 20/11/2026 <i>entregue</i> <span>R$ 79,80</span> <span class="mp-chip">Ver detalhes</span></div></div>
        <div class="mp-caixa"><p class="mp-erro">Pedido não encontrado.</p></div>`),
      rede('Network', { metodo: 'GET', url: '/api/pedidos/1001', status: 404, resposta: { erro: 'Pedido não encontrado.' } }),
    ],
    dica: 'req.params.id é sempre string. Como está a comparação com p.id?',
  },
  {
    id: 'VT-1019',
    titulo: 'Cliquei em "Sair" e o próximo cliente entrou na minha conta',
    nivel: 'N1', prioridade: 'Alta', categoria: 'Login / Sessão', chegada: 36,
    solicitante: { nome: 'Sandra Melo', cargo: 'Gerente da Loja Física — TechLoja', canal: 'Telefone' },
    ambiente: 'Computador de autoatendimento no balcão',
    descricao: `Temos um computador no balcão da loja física pra clientes comprarem pelo site.

Uma cliente fez a compra, clicou em "Sair" e foi embora. O próximo cliente clicou em "Catálogo" e apareceu "Olá, Maria Souza" lá em cima. Ele conseguiu ver os pedidos dela!

Ela fez reclamação formal. Precisamos que o "Sair" funcione de verdade.`,
    evidencias: [
      print('Após clicar em "Sair" e voltar ao catálogo', 'localhost:3000/index.html', `
        ${topoLoja('Maria Souza')}
        <div class="mp-grade"><div class="mp-card">⌨️<br>Teclado</div><div class="mp-card">🖱️<br>Mouse</div></div>`),
    ],
    dica: 'Leia a função sair(). Ela apaga alguma coisa? E no servidor, o token continua válido?',
  },
  {
    id: 'VT-1020',
    titulo: '[FRAUDE] Notebook vendido por R$ 0,01',
    nivel: 'N2', prioridade: 'Crítica', categoria: 'Segurança / Pedidos', chegada: 40,
    solicitante: { nome: 'Cláudia Ferraz', cargo: 'Financeiro — TechLoja', canal: 'E-mail' },
    ambiente: 'Pedido #1003 — cliente joao@email.com',
    descricao: `Equipe,

Na conciliação de hoje achamos o pedido #1003: um Notebook i7 16GB (R$ 4.599,00) pago por R$ 0,01. O pagamento foi aprovado e o pedido está como "pago".

O cliente é o mesmo João que já aprontou no painel admin. Como o sistema aceitou esse valor? Bloqueamos o envio, mas precisamos garantir que não aconteça de novo.`,
    evidencias: [
      storage('localStorage do cliente (reconstituído)', [
        ['carrinho', '[{"produtoId":7,"nome":"Notebook i7 16GB","preco":"0.01"}]  ← editado à mão'],
      ]),
      rede('Requisição recebida pelo servidor', {
        metodo: 'POST', url: '/api/pedidos', status: 201,
        requisicao: { itens: [{ produtoId: 7, nome: 'Notebook i7 16GB', preco: 0.01, quantidade: 1 }], desconto: 0 },
        resposta: { id: 1003, total: 0.01, status: 'pago' },
      }),
    ],
    dica: 'O back-end usa o preço que chega do navegador. De onde ele deveria tirar o preço?',
  },
];
