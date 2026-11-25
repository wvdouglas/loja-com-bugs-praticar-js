# 🎧 Treino de Chamados N1/N2 — JavaScript

Você acabou de entrar como **analista de sustentação na Virtech**. A Virtech mantém o e-commerce
da **TechLoja**, e a fila de chamados está cheia. Sua missão é atender os 20 chamados: reproduzir,
investigar, corrigir o código e documentar a solução.

## O que tem aqui

| Pasta | O que é | Endereço |
|---|---|---|
| `server/` | Back-end da loja (Node + Express) | API em http://localhost:3000/api |
| `public/` | Front-end da loja (HTML/CSS/JS puro) | http://localhost:3000 |
| `data/` | "Banco de dados" em JSON (`db.json`) e o original (`db.seed.json`) | — |
| `virtech-helpdesk/` | **Sistema de chamados da Virtech** (a sua fila de trabalho) | http://localhost:4000 |
| `parceiro/` | Site de um parceiro que consome a API (usado em 1 chamado) | http://localhost:5500 |
| `.gabarito/` | Respostas. **Só abra depois de tentar!** | — |

## Como rodar

Abra **dois terminais** na pasta `D:\treino-chamados-js`:

```powershell
npm run dev        # terminal 1: loja (reinicia sozinho quando você salva um arquivo)
```

```powershell
npm run helpdesk   # terminal 2: fila de chamados
```

Depois abra http://localhost:4000 (chamados) e http://localhost:3000 (loja).

Para o chamado do parceiro (CORS), rode também `npm run parceiro` e abra http://localhost:5500.

Para voltar o banco ao estado original (produtos, estoque, pedidos):

```powershell
npm run reset
```

## Contas de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@loja.com | admin123 |
| Cliente | joao@email.com | 123456 |
| Cliente | maria@email.com | maria123 |

Cupom de desconto: `DESCONTO10`

## Como trabalhar como um analista de verdade

1. No HelpDesk, **assuma** o chamado e leia a reclamação e as evidências (clique para ampliar).
2. **Reproduza** o problema na loja. Se não reproduziu, você ainda não entendeu o problema.
3. Investigue com **DevTools** (Console, Network, Application) e com o **terminal do servidor**.
4. Ache a causa no código, **corrija** e teste de novo.
5. Escreva uma **nota interna** com o que investigou e **resolva** com causa raiz + solução.
6. Travou? Use **"💡 Pedir dica ao N3"** antes de ir no gabarito.

**Modo plantão** (ligado por padrão): os chamados chegam aos poucos, com aviso e som, e o SLA
corre de verdade. Desligue no topo para ver todos de uma vez. "Resetar fila" zera o progresso.

> Dica: rode `git init` e faça um commit antes de começar. Assim você vê com `git diff`
> exatamente o que mudou em cada correção (e pode desfazer).

Alguns chamados se cruzam (ex.: produtos que não aparecem no catálogo por causa de outro bug).
No mundo real também é assim. Use os links diretos `produto.html?id=N` quando precisar.
