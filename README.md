# 🎧 Laboratório de Sustentação JavaScript — TechLoja + Virtech Service Desk

> 🧪 **Este projeto contém 20 bugs intencionais.**
> Ele simula o dia a dia de um analista de sustentação N1/N2: uma fila de chamados reais
> (reclamações de clientes, com prints, logs e requisições como evidência) sobre um e-commerce
> em Node.js. Cada chamado é corrigido em uma **branch própria**, com **Pull Request**
> documentando **causa raiz, solução e como testar**.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)

---

## 💡 O que este projeto demonstra

- **Diagnóstico de problemas reais** a partir da visão do usuário ("o total aparece R$ NaN",
  "o site caiu", "fui cobrada duas vezes").
- **Investigação com DevTools** (Console, Network, Application), leitura de **stack trace** e logs do servidor.
- **Correções em front-end e back-end**: tipos e coerção em JS, `async/await`, datas e fuso horário,
  paginação, concorrência (duplo clique), validação, tratamento de erros no Express.
- **Segurança de aplicações web**: XSS, controle de acesso, vazamento de dados (LGPD), CORS e
  a regra de ouro de **nunca confiar no que vem do navegador**.
- **Fluxo profissional com Git**: uma branch por chamado, Conventional Commits, Pull Request com
  causa raiz, code review e merge.
- **Documentação**: cada resolução registra causa raiz e solução, como numa base de conhecimento.

---

## 🎫 Fila de chamados

| Chamado | Reclamação do cliente | Nível | Prioridade | Status |
|---|---|:-:|:-:|:-:|
| VT-1001 | Clientes não conseguem entrar pelo celular | N1 | Alta | ⏳ Aberto |
| VT-1002 | Preciso logar de novo toda vez que abro outra aba | N1 | Média | ⏳ Aberto |
| VT-1003 | Total do carrinho aparece "R$ NaN" | N1 | Crítica | ⏳ Aberto |
| VT-1004 | Data do pedido aparece um dia antes | N1 | Média | ⏳ Aberto |
| VT-1005 | Produtos sumiram do catálogo e a última página fica vazia | N2 | Alta | ⏳ Aberto |
| VT-1006 | Vendemos 3 microfones mas só tinha 1 no estoque | N2 | Crítica | ✅ [PR #1](https://github.com/wvdouglas/loja-com-bugs-praticar-js/pull/1) |
| VT-1007 | Pedido saiu duplicado e fui cobrada duas vezes | N1 | Alta | ⏳ Aberto |
| VT-1008 | [LGPD] Senha do cliente aparece na resposta do login | N2 | Crítica | ⏳ Aberto |
| VT-1009 | Cliente entrou no painel admin e alterou preço | N2 | Crítica | ⏳ Aberto |
| VT-1010 | Erro 500 ao clicar em "Editar" produto | N2 | Alta | ⏳ Aberto |
| VT-1011 | Fotos de alguns produtos não aparecem | N1 | Baixa | ⏳ Aberto |
| VT-1012 | Aparece "Você foi hackeado" na página do SSD | N2 | Crítica | ⏳ Aberto |
| VT-1013 | Parceiro não consegue consumir nossa API (CORS) | N2 | Média | ⏳ Aberto |
| VT-1014 | Cadastro aceita e-mail inválido, senha de 1 dígito e e-mail duplicado | N1 | Média | ⏳ Aberto |
| VT-1015 | Site inteiro caiu, tivemos que reiniciar o servidor | N2 | Crítica | ⏳ Aberto |
| VT-1016 | Cupom DESCONTO10 acumulando: pedido saiu de graça | N1 | Alta | ⏳ Aberto |
| VT-1017 | "Menor preço" não ordena direito | N1 | Baixa | ✅ [Resolvido](https://github.com/wvdouglas/loja-com-bugs-praticar-js/commit/5711fe57bb2933ca3b46e0f26ed4959c0c802df5) |
| VT-1018 | "Ver detalhes" do pedido sempre dá "Pedido não encontrado" | N1 | Média | ⏳ Aberto |
| VT-1019 | Cliquei em "Sair" e o próximo cliente entrou na minha conta | N1 | Alta | ⏳ Aberto |
| VT-1020 | [FRAUDE] Notebook vendido por R$ 0,01 | N2 | Crítica | ⏳ Aberto |

**Progresso:** 2 de 20 resolvidos. Os PRs de cada correção ficam na aba
[Pull requests](https://github.com/wvdouglas/loja-com-bugs-praticar-js/pulls?q=is%3Apr).

---

## 🏗️ Arquitetura

São 3 sistemas independentes:

| Sistema | O que é | Endereço local |
|---|---|---|
| **TechLoja** (`server/` + `public/`) | E-commerce com os bugs: API REST em Node + Express, front em HTML/CSS/JS puro, banco em JSON | http://localhost:3000 |
| **Virtech Service Desk** (`virtech-helpdesk/`) | Fila de chamados: SLA em tempo real, evidências, histórico, respostas do cliente, resolução com causa raiz | http://localhost:4000 |
| **Site parceiro** (`parceiro/`) | Outra empresa consumindo a API (cenário de CORS) | http://localhost:5500 |

A documentação técnica completa (fluxos, endpoints, modelo de dados, onde fica cada coisa) está em
**[DOCUMENTACAO.md](DOCUMENTACAO.md)**.

---

## 🚀 Como rodar

Requisito: **Node.js 18+**.

```bash
git clone https://github.com/wvdouglas/loja-com-bugs-praticar-js.git
cd loja-com-bugs-praticar-js
npm install
npm run reset      # cria o banco data/db.json a partir do seed
```

Em dois terminais:

```bash
npm run dev        # loja (reinicia sozinha ao salvar arquivos do server/)
npm run helpdesk   # fila de chamados
```

Para o chamado de CORS: `npm run parceiro`.

### Contas de teste (fictícias)

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@loja.com | admin123 |
| Cliente | joao@email.com | 123456 |
| Cliente | maria@email.com | maria123 |

Cupom: `DESCONTO10`

---

## 🔁 Fluxo de atendimento de um chamado

1. **Assumir** o chamado no Service Desk e analisar a reclamação e as evidências.
2. **Reproduzir** o problema na loja.
3. **Investigar** com DevTools, terminal do servidor e leitura do código.
4. **Corrigir** em uma branch própria e testar.
5. Abrir **Pull Request** com causa raiz, solução e como testar → **merge** na `main`.
6. **Resolver** o chamado no Service Desk com o link do PR.

```bash
git checkout main
git pull
git checkout -b fix/VT-1003-total-carrinho-nan
# ...corrige e testa...
git add public/js/carrinho.js
git commit -m "fix(carrinho): resumo da correção" -m "Causa raiz: ... Refs: VT-1003"
git push -u origin fix/VT-1003-total-carrinho-nan
# abre o PR no GitHub → revisa → Merge → Delete branch
git checkout main
git pull
git branch -d fix/VT-1003-total-carrinho-nan
```

O estado original, com os 20 bugs, fica preservado no primeiro commit do histórico. Para refazer o
laboratório do zero: `git checkout -b treino-2 f643aae`.

---

---

<sub>Esse projeto foi feito com foco de adquirir experiencia na área como junior, com problemas de nivel 1,2 que acontece no dia a dia. Utilizei da IA CLAUDE para geração dos bugs intencionais para aprender como seria trabalhar na área no dia a dia, com esse contato n1/n2.</sub>
