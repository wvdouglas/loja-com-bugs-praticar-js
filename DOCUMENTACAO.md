# 📘 Documentação técnica — TechLoja + Virtech Service Desk

Este documento explica **de onde vem cada coisa**: quem chama quem, onde os dados ficam e qual
arquivo faz o quê. Ele descreve como o sistema **foi pensado para funcionar**. Os bugs dos chamados
estão escondidos no código, e encontrá-los é o seu trabalho. 😉

> Dica: no VS Code, abra este arquivo e aperte **Ctrl + Shift + V** para ver formatado.
> **Ctrl + clique** no nome de um arquivo (ou **Ctrl + P** e digite o nome) para abri-lo.

---

## 1. Visão geral: são 3 sistemas separados

```
┌──────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│  VIRTECH SERVICE DESK    │      │   TECHLOJA (o sistema    │      │   SITE PARCEIRO          │
│  (sua fila de chamados)  │      │   com bugs)              │      │   BuscaPreço             │
│                          │      │                          │      │                          │
│  http://localhost:4000   │      │  http://localhost:3000   │◄─────│  http://localhost:5500   │
│  npm run helpdesk        │      │  npm run dev             │ API  │  npm run parceiro        │
│                          │      │                          │      │                          │
│  Só HTML/CSS/JS.         │      │  Front: public/          │      │  Só consome a API        │
│  Não conversa com a loja.│      │  Back:  server/          │      │  da loja (chamado CORS). │
│  Salva no localStorage.  │      │  Banco: data/db.json     │      │                          │
└──────────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
```

- O **Service Desk** é só o "Jira/GLPI" do treino. Ele **não** é ligado à loja: os chamados são
  textos fixos em `virtech-helpdesk/js/chamados-dados.js`.
- A **TechLoja** é onde você trabalha de verdade: reproduz, investiga e corrige.
- O **Parceiro** existe só para o chamado de CORS.

---

## 2. Arquitetura da TechLoja

```
 NAVEGADOR (public/)                                SERVIDOR NODE (server/)
 ─────────────────────                              ─────────────────────────────────────────
 index.html ── js/catalogo.js ─┐                    index.js  (Express, porta 3000)
 produto.html ─ js/produto.js ─┤                       │
 login.html ── js/login.js ────┤   fetch('/api/...')   ├── express.static('public')  → entrega HTML/CSS/JS
 carrinho.html  js/carrinho.js ┼──────────────────────►├── /api/auth     → rotas/auth.js
 pedidos.html ─ js/pedidos.js ─┤   JSON  ◄─────────────├── /api/produtos → rotas/produtos.js
 admin.html ── js/admin.js ────┘                       ├── /api/pedidos  → rotas/pedidos.js
        │                                              └── /api/admin    → rotas/admin.js
        │  todos usam                                          │
        ▼                                                      │ usam
 js/comum.js  (api(), sessão, carrinho,               middleware/auth.js (sessões, autenticar, somenteAdmin)
               cabeçalho, formatação)                 db.js (ler/salvar o arquivo JSON)
        │                                                      │
        ▼                                                      ▼
 sessionStorage / localStorage                         data/db.json
 (token, usuário, carrinho)                            (usuarios, produtos, avaliacoes, pedidos)
```

**Resumo:** a página HTML carrega `comum.js` + o JS dela. O JS chama a API com `fetch`. O Express
recebe, passa pelo middleware (se a rota exigir login), a rota lê/grava o `db.json` e devolve JSON.
O JS do front desenha o resultado na tela.

---

## 3. Estrutura de pastas, arquivo por arquivo

```
D:\treino-chamados-js
│
├── package.json            ← dependências (só o Express 4) e os scripts npm
├── README.md               ← como rodar e contas de teste
├── DOCUMENTACAO.md         ← este arquivo
│
├── server/                 ← BACK-END (Node.js + Express)
│   ├── index.js            ← ponto de entrada: cria o app, liga JSON, arquivos estáticos e as rotas
│   ├── db.js               ← "banco": ler() e salvar() o data/db.json; proximoId()
│   ├── middleware/
│   │   └── auth.js         ← sessões em memória; autenticar (exige login); somenteAdmin (exige admin)
│   └── rotas/
│       ├── auth.js         ← login, cadastro, "quem sou eu" (/me)
│       ├── produtos.js     ← listagem paginada, detalhe do produto, avaliações
│       ├── pedidos.js      ← listar meus pedidos, detalhe, criar pedido (checkout)
│       └── admin.js        ← CRUD de produtos (só admin)
│
├── public/                 ← FRONT-END (servido pelo próprio Express)
│   ├── index.html          ← catálogo
│   ├── produto.html        ← página de um produto + avaliações
│   ├── login.html          ← login e cadastro
│   ├── carrinho.html       ← carrinho, cupom, finalizar compra
│   ├── pedidos.html        ← histórico de pedidos
│   ├── admin.html          ← painel do administrador
│   ├── css/estilo.css      ← visual da loja inteira
│   ├── imagens/            ← fotos (SVG) dos produtos
│   └── js/
│       ├── comum.js        ← funções compartilhadas (carregado em TODAS as páginas)
│       ├── catalogo.js     ← busca a página de produtos, ordena, desenha cards e paginação
│       ├── produto.js      ← carrega um produto, mostra/envia avaliações
│       ├── login.js        ← envia login/cadastro e salva a sessão
│       ├── carrinho.js     ← mostra itens, calcula totais, cupom, envia o pedido
│       ├── pedidos.js      ← lista pedidos e mostra detalhes
│       └── admin.js        ← tabela de produtos, editar, excluir, cadastrar
│
├── data/
│   ├── db.json             ← banco ATUAL (muda conforme você usa a loja)
│   └── db.seed.json        ← banco ORIGINAL (nunca muda; usado pelo reset)
│
├── scripts/
│   └── resetar-banco.js    ← copia db.seed.json por cima de db.json (npm run reset)
│
├── virtech-helpdesk/       ← SISTEMA DE CHAMADOS (independente da loja)
│   ├── index.html          ← estrutura: topo, menu lateral, área de conteúdo, modal, toasts
│   ├── servidor.js         ← servidor estático simples na porta 4000
│   ├── css/helpdesk.css    ← visual do service desk
│   └── js/
│       ├── chamados-dados.js ← OS 20 CHAMADOS (texto, evidências, dicas)
│       └── app.js          ← toda a lógica: fila, SLA, tela do chamado, respostas, modo plantão
│
├── parceiro/               ← site de outra empresa que consome a API (chamado de CORS)
│   ├── index.html
│   └── servidor.js         ← porta 5500
│
├── .gabarito/GABARITO.md   ← respostas (evite!)
├── .claude/launch.json     ← atalhos de servidor usados pelo Claude
└── node_modules/           ← bibliotecas instaladas pelo npm (não mexa)
```

---

## 4. Back-end em detalhe

### 4.1 `server/index.js`: o ponto de partida
Quando você roda `npm run dev`, o Node executa este arquivo. Ele:
1. cria o app Express;
2. `express.json()` transforma o corpo das requisições (JSON) em `req.body`;
3. `express.static('public')` entrega os arquivos da pasta `public/` (é por isso que
   `http://localhost:3000/carrinho.html` funciona);
4. "pendura" cada grupo de rotas num prefixo (`/api/auth`, `/api/produtos`...);
5. começa a escutar na porta 3000.

> `npm run dev` usa `node --watch`: salvou um arquivo do `server/`, o servidor reinicia sozinho.
> Se o servidor **cair**, o terminal mostra o erro e para. Leia a mensagem: ela diz arquivo e linha.

### 4.2 `server/db.js`: o "banco de dados"
Não existe MySQL nem Mongo: tudo fica em **`data/db.json`**.
- `ler()` é **assíncrona** (retorna uma Promise): lê o arquivo e devolve o objeto.
- `salvar(dados)` é **assíncrona**: grava o objeto inteiro de volta no arquivo.
- `proximoId(lista, inicial)` calcula o próximo id (maior id + 1).

Padrão usado nas rotas:
```js
const dados = await db.ler();   // lê tudo
dados.pedidos.push(novo);       // altera em memória
await db.salvar(dados);         // grava tudo
```

### 4.3 `server/middleware/auth.js`: login e permissões
A autenticação é **por token**, sem JWT:

```
 1. POST /api/auth/login com e-mail e senha
 2. servidor confere no db.json → criarSessao() gera um token aleatório (UUID)
 3. o token fica guardado num Map em MEMÓRIA:  token → { id, nome, papel }
 4. o front guarda o token e manda em toda requisição:
        Authorization: Bearer <token>
 5. middleware autenticar: lê o cabeçalho, procura no Map
        achou  → coloca a sessão em req.usuario e segue (next())
        não achou → 401 "Sessão expirada"
 6. middleware somenteAdmin: deixa passar só se req.usuario.papel for admin, senão 403
```

> ⚠️ Como as sessões ficam em memória, **reiniciar o servidor desloga todo mundo**. Isso é
> esperado no treino. Se aparecer "Sessão expirada" depois de salvar um arquivo, faça login de novo.

### 4.4 Tabela de endpoints da API

| Método | Rota | Login? | Arquivo | O que faz |
|---|---|---|---|---|
| POST | `/api/auth/login` | — | rotas/auth.js | Confere e-mail/senha, devolve `{ token, usuario }` |
| POST | `/api/auth/cadastro` | — | rotas/auth.js | Cria usuário cliente e já loga |
| GET | `/api/auth/me` | ✅ | rotas/auth.js | Devolve a sessão atual |
| GET | `/api/produtos?pagina=1&limite=6` | — | rotas/produtos.js | Lista paginada `{ itens, pagina, totalPaginas, total }` |
| GET | `/api/produtos/:id` | — | rotas/produtos.js | Produto + suas avaliações |
| POST | `/api/produtos/:id/avaliacoes` | ✅ | rotas/produtos.js | Cria avaliação `{ texto, nota }` |
| GET | `/api/pedidos` | ✅ | rotas/pedidos.js | Pedidos do usuário logado (mais novo primeiro) |
| GET | `/api/pedidos/:id` | ✅ | rotas/pedidos.js | Detalhe de um pedido do usuário |
| POST | `/api/pedidos` | ✅ | rotas/pedidos.js | Checkout: valida estoque, baixa estoque, grava pedido |
| GET | `/api/admin/produtos` | 👑 | rotas/admin.js | Todos os produtos (sem paginação) |
| GET | `/api/admin/produtos/:id` | 👑 | rotas/admin.js | Um produto, para o formulário de edição |
| POST | `/api/admin/produtos` | 👑 | rotas/admin.js | Cadastra produto |
| PUT | `/api/admin/produtos/:id` | 👑 | rotas/admin.js | Atualiza campos enviados |
| DELETE | `/api/admin/produtos/:id` | 👑 | rotas/admin.js | Exclui produto |

✅ = precisa estar logado (`autenticar`) · 👑 = precisa ser admin (`autenticar` + `somenteAdmin`)

> Você pode testar qualquer GET direto no navegador, por exemplo
> http://localhost:3000/api/produtos?pagina=1&limite=6. Para POST/PUT use o DevTools, o
> Postman, o Insomnia ou a extensão **Thunder Client** do VS Code.

### 4.5 O checkout passo a passo (`POST /api/pedidos`)
É a rota mais importante da loja:
```
 recebe { itens: [{ produtoId, nome, preco, quantidade }], desconto }
   │
   ├─ carrinho vazio? → 400
   ├─ espera 1,5s  (simula o gateway de pagamento aprovando o cartão)
   ├─ lê o banco
   ├─ para cada item: acha o produto, confere estoque e dá baixa
   ├─ calcula subtotal, aplica desconto, calcula total
   ├─ monta o pedido (id a partir de 1001, data, status "pago")
   └─ salva e devolve 201 com o pedido
```

---

## 5. Front-end em detalhe

### 5.1 Como cada página é montada
Toda página HTML segue o mesmo molde:
```html
<header id="cabecalho"></header>   <!-- preenchido pelo comum.js -->
<main> ... elementos com id ... </main>
<script src="js/comum.js"></script> <!-- SEMPRE primeiro -->
<script src="js/<pagina>.js"></script>
```
O JS da página busca dados com `api(...)` e monta o HTML com template strings
(`` `...${variavel}...` ``) colocando em `elemento.innerHTML`.

### 5.2 `public/js/comum.js`: a caixa de ferramentas
| Função | Para que serve |
|---|---|
| `api(caminho, opcoes)` | Wrapper do `fetch`: põe `/api` na frente, cabeçalho JSON, token `Bearer`, transforma erro HTTP em exceção (`throw`). No 401, limpa a sessão |
| `obterToken()`, `obterUsuario()` | Leem a sessão salva no navegador |
| `salvarSessao(token, usuario)` | Grava a sessão depois do login/cadastro |
| `limparSessao()` | Apaga a sessão do navegador |
| `sair()` | Ação do botão "Sair" |
| `obterCarrinho()`, `salvarCarrinho()` | Leem/gravam o carrinho no `localStorage` (chave `carrinho`) |
| `adicionarAoCarrinho(botao)` | Lê `data-id`, `data-nome` e `data-preco` do botão e põe no carrinho |
| `formatarPreco(valor)` | `299.9` → `R$ 299,90` |
| `formatarData(data)` | Data → `dd/mm/aaaa` |
| `montarCabecalho()` | Desenha o topo (links, "Olá, nome", Sair, contador do carrinho) |
| `avisar(texto, tipo)` | Mensagenzinha verde/vermelha no canto da tela |

### 5.3 Onde cada dado fica guardado no navegador
Abra **F12 → aba Application → Storage** para ver ao vivo:

| Onde | Chave | Conteúdo | Quem grava |
|---|---|---|---|
| sessionStorage | `token` | token da sessão | `salvarSessao()` |
| sessionStorage | `usuario` | dados do usuário logado (JSON) | `salvarSessao()` |
| localStorage | `carrinho` | lista de itens `{ produtoId, nome, preco }` | `adicionarAoCarrinho()` / `carrinho.js` |

### 5.4 Página → JS → API

| Página | JS | Chama na API | Observações |
|---|---|---|---|
| `index.html` | catalogo.js | `GET /produtos?pagina=N&limite=6` | ordenação feita **no navegador**, só na página atual |
| `produto.html?id=N` | produto.js | `GET /produtos/:id`, `POST /produtos/:id/avaliacoes` | id vem da URL (`URLSearchParams`) |
| `login.html` | login.js | `POST /auth/login`, `POST /auth/cadastro` | sucesso → `salvarSessao()` → vai para o catálogo |
| `carrinho.html` | carrinho.js | `POST /pedidos` | agrupa itens repetidos em `quantidade` antes de enviar; cupom `DESCONTO10` |
| `pedidos.html` | pedidos.js | `GET /pedidos`, `GET /pedidos/:id` | exige login |
| `admin.html` | admin.js | `/admin/produtos` (GET, POST, PUT, DELETE) | o front esconde a tela de quem não é admin |

---

## 6. Fluxos completos (do clique até o banco)

### 6.1 Login
```
login.html → login.js (submit)
  → api('/auth/login', POST {email, senha})
    → server/rotas/auth.js: procura usuário no db.json
      → middleware/auth.js criarSessao() → token
    ← { token, usuario }
  → comum.js salvarSessao() → sessionStorage
  → redireciona para index.html → montarCabecalho() mostra "Olá, nome"
```

### 6.2 Comprar um produto
```
index.html: clique "Adicionar ao carrinho"
  → comum.js adicionarAoCarrinho() → localStorage['carrinho'].push(...)
carrinho.html: carrinho.js renderizar() → calcula subtotal/desconto/total
  clique "Finalizar compra"
  → agrupa itens → api('/pedidos', POST { itens, desconto })
    → middleware autenticar → rotas/pedidos.js (fluxo da seção 4.5) → db.json
  ← pedido criado → limpa carrinho → vai para pedidos.html
```

### 6.3 Admin editando um produto
```
admin.html: admin.js confere se o usuário salvo é admin
  → api('/admin/produtos') → tabela
  clique "Editar" → api('/admin/produtos/:id') → preenche o formulário
  "Salvar" → api('/admin/produtos/:id', PUT {...}) → rotas/admin.js → db.json
```

---

## 7. O banco: `data/db.json`

```jsonc
{
  "usuarios":   [{ "id": 1, "nome": "...", "email": "...", "senha": "...", "papel": "admin" | "cliente" }],
  "produtos":   [{ "id": 1, "nome": "...", "preco": 299.9, "estoque": 12, "imagem": "imagens/x.svg" }],
  "avaliacoes": [{ "id": 1, "produtoId": 8, "autor": "...", "texto": "...", "nota": 5 }],
  "pedidos":    [{ "id": 1001, "usuarioId": 2, "data": "AAAA-MM-DD", "status": "pago" | "entregue",
                   "itens": [{ "produtoId", "nome", "preco", "quantidade" }], "desconto": 0, "total": 79.8 }]
}
```
- Relações: `pedidos.usuarioId → usuarios.id`, `avaliacoes.produtoId → produtos.id`,
  `pedidos.itens[].produtoId → produtos.id`.
- Pode abrir e editar o `db.json` no VS Code à vontade (com o servidor rodando, inclusive).
  Estragou? `npm run reset`.
- Algumas correções de chamado envolvem **dados**, não código. Lembre de corrigir também no
  `db.seed.json`, senão o problema volta no próximo reset.

---

## 8. Virtech Service Desk por dentro

| Arquivo | Papel |
|---|---|
| `js/chamados-dados.js` | Define `window.CHAMADOS`: cada chamado tem `id`, `titulo`, `nivel`, `prioridade`, `categoria`, `chegada` (minutos após o início do turno), `solicitante`, `ambiente`, `descricao`, `evidencias[]` e `dica` |
| `js/app.js` | Lê `CHAMADOS` e monta tudo. Rotas por **hash** na URL: `#/fila/todos`, `#/fila/novo`, `#/chamado/VT-1003`... |

**Evidências** são desenhadas em HTML/CSS (não são imagens). Tipos: `print` (janela de navegador
simulada), `console`, `rede` (Network), `terminal` (log do servidor) e `storage`.

**Seu progresso** (status, respostas, resoluções, dicas usadas) fica no `localStorage` do navegador,
na chave `virtech-estado-v1`. Fechar o navegador não perde nada; o botão **Resetar fila** apaga.

**SLA:** Crítica 1h · Alta 2h · Média 4h · Baixa 8h, contando a partir da chegada do chamado.

**Modo plantão:** os chamados com `chegada` no futuro ficam escondidos e aparecem com aviso e som
conforme o tempo passa. A tela se atualiza a cada 20s (menos quando você está digitando).

**Cliente simulado:** se você responder o cliente com uma **pergunta** (texto com `?`), o chamado vai
para "Aguardando cliente" e ele responde sozinho em alguns segundos. Ao resolver, ele confirma.

---

## 9. Onde começar a procurar, por área

Isto **não** diz qual é o bug, só quais arquivos fazem parte de cada assunto:

| Assunto do chamado | Comece por |
|---|---|
| Login, sessão, "Sair" | `public/js/comum.js`, `public/js/login.js`, `server/rotas/auth.js`, `server/middleware/auth.js` |
| Cadastro | `public/login.html`, `server/rotas/auth.js` |
| Catálogo, paginação, ordenação, fotos | `public/js/catalogo.js`, `server/rotas/produtos.js`, `public/imagens/`, `data/db.json` |
| Página do produto, avaliações | `public/js/produto.js`, `server/rotas/produtos.js` |
| Carrinho, cupom, totais | `public/js/carrinho.js`, `public/js/comum.js` |
| Checkout, estoque, valores do pedido | `public/js/carrinho.js`, `server/rotas/pedidos.js` |
| Meus pedidos, datas | `public/js/pedidos.js`, `public/js/comum.js`, `server/rotas/pedidos.js` |
| Painel admin, permissões | `public/js/admin.js`, `server/rotas/admin.js`, `server/middleware/auth.js` |
| Servidor caindo, erro 500 | **terminal do `npm run dev`** (leia o stack trace) + o arquivo/linha que ele aponta |
| Integração / CORS | `server/index.js`, `parceiro/index.html` |

---

## 10. Ferramentas de investigação (o kit do analista)

| Ferramenta | Use para |
|---|---|
| **F12 → Console** | erros de JavaScript, testar código (`obterCarrinho()`, `typeof x`...) |
| **F12 → Network** | ver cada requisição: URL, status, payload enviado e resposta recebida |
| **F12 → Application** | ver/editar sessionStorage e localStorage |
| **F12 → Sources** | colocar breakpoint no JS do front e ir linha a linha |
| **Terminal do `npm run dev`** | erros do back-end (stack trace com arquivo:linha) |
| `console.log(...)` no `server/` | inspecionar `req.body`, `req.params`, variáveis (aparece no terminal) |
| **Ctrl + Shift + F** no VS Code | buscar um texto em todo o projeto (ex.: a mensagem de erro que o usuário viu) |
| `git diff` | ver exatamente o que você alterou (se fez `git init`) |

> Truque de ouro: pegue a **mensagem exata** que aparece para o usuário (ex.: "Pedido não
> encontrado"), busque com **Ctrl + Shift + F** e você cai direto na linha que gera o erro.
