// ======================================================================
//  Virtech Service Desk — simulador de fila de chamados
// ======================================================================

const CHAVE = 'virtech-estado-v1';
const SLA_MINUTOS = { 'Crítica': 60, 'Alta': 120, 'Média': 240, 'Baixa': 480 };
const PESO_PRIORIDADE = { 'Crítica': 0, 'Alta': 1, 'Média': 2, 'Baixa': 3 };
const STATUS = {
  novo: 'Novo',
  atendimento: 'Em atendimento',
  aguardando: 'Aguardando cliente',
  resolvido: 'Resolvido',
};
const FILAS = [
  ['todos', 'Todos abertos'],
  ['novo', 'Novos'],
  ['meus', 'Meus chamados'],
  ['atendimento', 'Em atendimento'],
  ['aguardando', 'Aguardando cliente'],
  ['resolvido', 'Resolvidos'],
];

const RESPOSTAS_CLIENTE = [
  'Mandei tudo que eu tinha no chamado. Acontece toda vez, dá pra reproduzir aí com certeza.',
  'Não sei te dizer mais detalhes técnicos, mas estou à disposição pra testar quando vocês arrumarem.',
  'Obrigado pelo retorno! Por favor priorizem, está impactando nossos clientes.',
  'Isso, é exatamente esse comportamento. Aguardo a correção.',
];
const CONFIRMACOES_CLIENTE = [
  'Testei aqui e agora está funcionando! Muito obrigado, pode encerrar. 🙌',
  'Confirmado, resolvido. Ótimo trabalho, equipe Virtech!',
  'Validei com a equipe e está ok. Obrigada pela agilidade!',
];

// ---------------------------------------------------------------- estado
let estado = carregarEstado();
let filtroNivel = 'todos';
let busca = '';

function carregarEstado() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && salvo.inicio) return salvo;
  } catch { /* estado corrompido: começa do zero */ }
  return { inicio: Date.now(), plantao: true, chamados: {}, vistos: [] };
}

function salvarEstado() {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch { /* sem storage */ }
}

function estadoDe(id) {
  if (!estado.chamados[id]) {
    estado.chamados[id] = { status: 'novo', responsavel: null, mensagens: [], resolucao: null, dica: false, escalado: false, aberto: false };
  }
  return estado.chamados[id];
}

// ---------------------------------------------------------------- tempo e SLA
const minutosDoTurno = () => (Date.now() - estado.inicio) / 60000;

function visivel(c) {
  return !estado.plantao || c.chegada <= minutosDoTurno();
}

function aberturaMs(c) {
  const chegada = estado.plantao ? c.chegada : Math.min(c.chegada, 0);
  return estado.inicio + chegada * 60000;
}

function slaRestanteMs(c) {
  const st = estadoDe(c.id);
  const fim = aberturaMs(c) + SLA_MINUTOS[c.prioridade] * 60000;
  const agora = st.status === 'resolvido' && st.resolucao ? st.resolucao.em : Date.now();
  return fim - agora;
}

function formatarDuracao(ms) {
  const total = Math.round(Math.abs(ms) / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

function htmlSla(c) {
  const st = estadoDe(c.id);
  const restante = slaRestanteMs(c);
  if (st.status === 'resolvido') {
    return restante >= 0
      ? '<span class="sla ok">✔ dentro do SLA</span>'
      : '<span class="sla estourado">✔ fora do SLA</span>';
  }
  if (restante < 0) return `<span class="sla estourado">⚠ -${formatarDuracao(restante)}</span>`;
  const classe = restante < 15 * 60000 ? 'perto' : 'ok';
  return `<span class="sla ${classe}">⏱ ${formatarDuracao(restante)}</span>`;
}

function horaCurta(ms) {
  return new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------- utilidades
function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function nivelAtual(c) {
  return estadoDe(c.id).escalado ? 'N2' : c.nivel;
}

function toast(titulo, texto, critico = false) {
  const caixa = document.createElement('div');
  caixa.className = `toast${critico ? ' critico' : ''}`;
  caixa.innerHTML = `<b>${esc(titulo)}</b>${esc(texto)}`;
  document.getElementById('toasts').appendChild(caixa);
  setTimeout(() => caixa.remove(), 6000);
}

function bip() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.frequency.value = 880;
    ganho.gain.setValueAtTime(0.08, ctx.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(ganho).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch { /* sem áudio, sem problema */ }
}

// ---------------------------------------------------------------- filtros
function chamadosVisiveis() {
  return window.CHAMADOS.filter(visivel);
}

function passaFiltros(c, fila) {
  const st = estadoDe(c.id);
  if (filtroNivel !== 'todos' && nivelAtual(c) !== filtroNivel) return false;
  if (busca) {
    const alvo = `${c.id} ${c.titulo} ${c.solicitante.nome} ${c.categoria}`.toLowerCase();
    if (!alvo.includes(busca)) return false;
  }
  if (fila === 'todos') return st.status !== 'resolvido';
  if (fila === 'meus') return st.responsavel === 'Você' && st.status !== 'resolvido';
  return st.status === fila;
}

function ordenarFila(lista) {
  return [...lista].sort((a, b) => {
    const ra = estadoDe(a.id).status === 'resolvido';
    const rb = estadoDe(b.id).status === 'resolvido';
    if (ra !== rb) return ra ? 1 : -1;
    const p = PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade];
    if (p !== 0) return p;
    return slaRestanteMs(a) - slaRestanteMs(b);
  });
}

// ---------------------------------------------------------------- lateral
function renderizarLateral(filaAtiva) {
  const vis = chamadosVisiveis();
  const contar = (fila) => vis.filter((c) => {
    const salvaNivel = filtroNivel;
    const salvaBusca = busca;
    filtroNivel = 'todos';
    busca = '';
    const ok = passaFiltros(c, fila);
    filtroNivel = salvaNivel;
    busca = salvaBusca;
    return ok;
  }).length;

  document.getElementById('filas').innerHTML = FILAS.map(([chave, nome]) => `
    <a href="#/fila/${chave}" class="${chave === filaAtiva ? 'ativo' : ''}">${nome}<span>${contar(chave)}</span></a>
  `).join('');

  document.getElementById('niveis').innerHTML = ['todos', 'N1', 'N2'].map((n) => `
    <a href="#" data-nivel="${n}" class="${n === filtroNivel ? 'ativo' : ''}">${n === 'todos' ? 'Todos os níveis' : n}</a>
  `).join('');
  document.querySelectorAll('[data-nivel]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    filtroNivel = a.dataset.nivel;
    rotear();
  }));

  const novos = vis.filter((c) => estadoDe(c.id).status === 'novo').length;
  document.title = novos > 0 ? `(${novos}) Virtech Service Desk` : 'Virtech Service Desk';
}

// ---------------------------------------------------------------- tela: fila
function telaFila(fila) {
  renderizarLateral(fila);
  const vis = chamadosVisiveis();
  const abertos = vis.filter((c) => estadoDe(c.id).status !== 'resolvido');
  const estourados = abertos.filter((c) => slaRestanteMs(c) < 0).length;
  const resolvidos = vis.length - abertos.length;
  const pendentesChegada = window.CHAMADOS.length - vis.length;

  const lista = ordenarFila(vis.filter((c) => passaFiltros(c, fila)));
  const nomeFila = (FILAS.find(([k]) => k === fila) || FILAS[0])[1];

  document.getElementById('conteudo').innerHTML = `
    <section class="kpis">
      <div class="kpi"><small>Abertos</small><b>${abertos.length}</b></div>
      <div class="kpi"><small>Novos (sem dono)</small><b>${abertos.filter((c) => estadoDe(c.id).status === 'novo').length}</b></div>
      <div class="kpi ${estourados ? 'alerta' : ''}"><small>SLA estourado</small><b>${estourados}</b></div>
      <div class="kpi verde"><small>Resolvidos</small><b>${resolvidos} / ${window.CHAMADOS.length}</b></div>
      ${estado.plantao ? `<div class="kpi"><small>Ainda vão chegar</small><b>${pendentesChegada}</b></div>` : ''}
    </section>

    <div class="cabeca-fila">
      <h2>${nomeFila}</h2>
      <small style="color:var(--suave)">${lista.length} chamado(s) · clique para abrir</small>
    </div>

    <div class="tabela-wrap">
      <table class="fila">
        <thead><tr>
          <th>Chamado</th><th>Assunto</th><th>Solicitante</th><th>Nível</th>
          <th>Prioridade</th><th>Status</th><th>SLA</th><th>Aberto</th>
        </tr></thead>
        <tbody>
          ${lista.map((c) => {
            const st = estadoDe(c.id);
            return `
            <tr class="linha ${!st.aberto ? 'nova' : ''}" data-id="${c.id}">
              <td class="id">${c.id}</td>
              <td class="assunto"><b>${esc(c.titulo)}</b><small>${esc(c.categoria)}</small></td>
              <td>${esc(c.solicitante.nome)}<br><small style="color:var(--suave)">${esc(c.solicitante.canal)}</small></td>
              <td><span class="tag n-${nivelAtual(c)}">${nivelAtual(c)}</span></td>
              <td><span class="tag p-${c.prioridade}">${c.prioridade}</span></td>
              <td><span class="tag s-${st.status}">${STATUS[st.status]}</span></td>
              <td>${htmlSla(c)}</td>
              <td style="color:var(--suave);white-space:nowrap">${horaCurta(aberturaMs(c))}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      ${lista.length === 0 ? '<div class="vazio-fila">Nenhum chamado nesta fila. ☕</div>' : ''}
    </div>
  `;

  document.querySelectorAll('tr.linha').forEach((tr) => tr.addEventListener('click', () => {
    location.hash = `#/chamado/${tr.dataset.id}`;
  }));
}

// ---------------------------------------------------------------- evidências
const ICONES = { print: '🖼️', console: '🧪', rede: '🌐', terminal: '🖥️', storage: '🗄️' };
const EXTENSOES = { print: 'png', console: 'png', rede: 'har', terminal: 'log', storage: 'png' };

function htmlEvidencia(e) {
  if (e.tipo === 'print') {
    return `
      <div class="navegador ${e.dispositivo === 'mobile' ? 'mobile' : ''}">
        <div class="barra"><span class="bolinhas"><i></i><i></i><i></i></span><span class="url">🔒 ${esc(e.url)}</span></div>
        <div class="tela">${e.html}</div>
      </div>`;
  }
  if (e.tipo === 'console') {
    return `<div class="devtools"><div class="aba">DevTools › Console</div>
      ${e.linhas.map((l) => `<div class="linha ${l.nivel}">${l.nivel === 'erro' ? '⛔ ' : ''}${esc(l.texto)}</div>`).join('')}
    </div>`;
  }
  if (e.tipo === 'terminal') {
    return `<div class="devtools terminal"><div class="aba">Terminal — node server/index.js</div>
      ${e.linhas.map((l) => `<div class="linha">${esc(l) || '&nbsp;'}</div>`).join('')}
    </div>`;
  }
  if (e.tipo === 'rede') {
    const corpo = (v) => esc(typeof v === 'string' ? v : JSON.stringify(v, null, 2));
    const classe = e.status >= 400 ? 'status-erro' : 'status-ok';
    return `<div class="devtools"><div class="aba">DevTools › Network</div>
      <div class="linha"><span class="rotulo">${esc(e.metodo)}</span> ${esc(e.url)} — <span class="${classe}">${e.status}</span></div>
      ${e.requisicao ? `<div class="linha"><span class="rotulo">Request payload</span></div><pre>${corpo(e.requisicao)}</pre>` : ''}
      ${e.resposta !== undefined ? `<div class="linha"><span class="rotulo">Response</span></div><pre>${corpo(e.resposta)}</pre>` : ''}
    </div>`;
  }
  if (e.tipo === 'storage') {
    return `<div class="devtools"><div class="aba">DevTools › Application › Storage</div>
      <table>${e.chaves.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
    </div>`;
  }
  return '';
}

function abrirEvidencia(c, indice) {
  const e = c.evidencias[indice];
  abrirModal(`
    <div class="modal-caixa">
      <h2>${ICONES[e.tipo]} ${esc(e.titulo)}</h2>
      <div class="evidencia-grande">${htmlEvidencia(e)}</div>
      <div class="modal-rodape"><button class="btn-fantasma" data-fechar>Fechar</button></div>
    </div>`);
}

// ---------------------------------------------------------------- tela: chamado
function telaChamado(id) {
  const c = window.CHAMADOS.find((x) => x.id === id);
  if (!c || !visivel(c)) {
    location.hash = '#/fila/todos';
    return;
  }
  const st = estadoDe(id);
  if (!st.aberto) {
    st.aberto = true;
    salvarEstado();
  }
  renderizarLateral(null);

  const mensagens = st.mensagens.map((m) => {
    const tipos = {
      agente: ['VC', '', 'Você', 'respondeu ao cliente'],
      nota: ['VC', 'interna', 'Você', 'nota interna (cliente não vê)'],
      cliente: [c.solicitante.nome.split(' ').map((p) => p[0]).slice(0, 2).join(''), 'cliente', c.solicitante.nome, 'respondeu'],
      sistema: ['⚙', 'sistema', 'Sistema', ''],
    };
    const [sigla, classe, quem, acao] = tipos[m.tipo];
    return `
      <div class="mensagem ${m.tipo === 'nota' ? 'nota' : ''}">
        <span class="avatar ${classe}">${esc(sigla)}</span>
        <div class="corpo">
          <div class="quem"><b>${esc(quem)}</b> ${acao} · ${horaCurta(m.em)}</div>
          <div class="texto">${esc(m.texto)}</div>
        </div>
      </div>`;
  }).join('');

  const iniciais = c.solicitante.nome.split(' ').map((p) => p[0]).slice(0, 2).join('');

  document.getElementById('conteudo').innerHTML = `
    <button class="voltar" id="btn-voltar">← Voltar para a fila</button>
    <div class="chamado-topo">
      <div class="meta"><span class="id" style="color:var(--marca);font-family:Consolas,monospace">${c.id}</span>
        <span class="tag n-${nivelAtual(c)}">${nivelAtual(c)}</span>
        <span class="tag p-${c.prioridade}">${c.prioridade}</span>
        <span class="tag s-${st.status}">${STATUS[st.status]}</span>
        ${htmlSla(c)}
      </div>
      <h1>${esc(c.titulo)}</h1>
    </div>

    <div class="chamado-grid">
      <div>
        <section class="bloco">
          <h3>Abertura do chamado</h3>
          <div class="mensagem">
            <span class="avatar cliente">${esc(iniciais)}</span>
            <div class="corpo">
              <div class="quem"><b>${esc(c.solicitante.nome)}</b> abriu via ${esc(c.solicitante.canal)} · ${horaCurta(aberturaMs(c))}</div>
              <div class="texto">${esc(c.descricao)}</div>
            </div>
          </div>
        </section>

        <section class="bloco">
          <h3>Evidências anexadas (${c.evidencias.length})</h3>
          <div class="evidencias">
            ${c.evidencias.map((e, i) => `
              <div class="evidencia" data-evidencia="${i}" title="Clique para ampliar">
                <div class="previa">${htmlEvidencia(e)}</div>
                <div class="legenda"><span>${ICONES[e.tipo]} ${esc(e.titulo)}</span><span>anexo_${i + 1}.${EXTENSOES[e.tipo]}</span></div>
              </div>`).join('')}
          </div>
        </section>

        <section class="bloco">
          <h3>Histórico</h3>
          ${mensagens || '<p style="color:var(--suave);margin:0">Nenhuma interação ainda. Assuma o chamado e dê um retorno ao cliente.</p>'}
        </section>

        ${st.status !== 'resolvido' ? `
        <section class="bloco resposta">
          <div class="abas-resposta">
            <button class="ativa" data-aba="agente">💬 Responder cliente</button>
            <button data-aba="nota">📝 Nota interna</button>
          </div>
          <textarea id="texto-resposta" rows="4" placeholder="Escreva sua resposta ao cliente..."></textarea>
          <div class="rodape"><button class="btn" id="btn-enviar">Enviar</button></div>
        </section>` : ''}
      </div>

      <aside>
        <section class="bloco detalhes">
          <h3>Detalhes</h3>
          <dl>
            <dt>Solicitante</dt><dd>${esc(c.solicitante.nome)}<br><small style="color:var(--suave)">${esc(c.solicitante.cargo)}</small></dd>
            <dt>Canal</dt><dd>${esc(c.solicitante.canal)}</dd>
            <dt>Categoria</dt><dd>${esc(c.categoria)}</dd>
            <dt>Ambiente</dt><dd>${esc(c.ambiente)}</dd>
            <dt>Responsável</dt><dd>${st.responsavel ? esc(st.responsavel) : '<i style="color:var(--suave)">ninguém</i>'}</dd>
            <dt>SLA</dt><dd>${SLA_MINUTOS[c.prioridade] / 60}h para ${c.prioridade.toLowerCase()}</dd>
          </dl>
        </section>

        <section class="bloco acoes">
          <h3>Ações</h3>
          ${!st.responsavel ? '<button class="btn" id="btn-assumir">🙋 Assumir chamado</button>' : ''}
          <select id="sel-status" ${st.status === 'resolvido' ? 'disabled' : ''}>
            ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === st.status ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
          ${st.status !== 'resolvido' ? '<button class="btn-ok" id="btn-resolver">✅ Resolver chamado</button>' : '<button class="btn-fantasma" id="btn-reabrir">↩ Reabrir chamado</button>'}
          ${c.nivel === 'N1' && !st.escalado && st.status !== 'resolvido' ? '<button class="btn-fantasma" id="btn-escalar">⬆ Escalar para N2</button>' : ''}
          ${!st.dica ? '<button class="btn-fantasma" id="btn-dica">💡 Pedir dica ao N3</button>' : `<div class="dica-box">💡 <b>Dica do N3:</b><br>${esc(c.dica)}</div>`}
        </section>

        ${st.resolucao ? `
        <section class="bloco">
          <h3>Resolução</h3>
          <p><b>Causa raiz:</b><br>${esc(st.resolucao.causa)}</p>
          <p><b>Solução:</b><br>${esc(st.resolucao.solucao)}</p>
          ${st.resolucao.arquivos ? `<p><b>Arquivos:</b><br><code>${esc(st.resolucao.arquivos)}</code></p>` : ''}
          <p style="color:var(--suave);margin:0">Resolvido às ${horaCurta(st.resolucao.em)}</p>
        </section>` : ''}
      </aside>
    </div>
  `;

  ligarEventosChamado(c);
}

function ligarEventosChamado(c) {
  const st = estadoDe(c.id);
  const $ = (sel) => document.querySelector(sel);

  $('#btn-voltar').addEventListener('click', () => history.length > 1 ? history.back() : (location.hash = '#/fila/todos'));

  document.querySelectorAll('[data-evidencia]').forEach((el) =>
    el.addEventListener('click', () => abrirEvidencia(c, Number(el.dataset.evidencia))));

  let abaAtual = 'agente';
  document.querySelectorAll('[data-aba]').forEach((b) => b.addEventListener('click', () => {
    abaAtual = b.dataset.aba;
    document.querySelectorAll('[data-aba]').forEach((x) => x.classList.toggle('ativa', x === b));
    $('#texto-resposta').placeholder = abaAtual === 'nota'
      ? 'Anote sua investigação (só a equipe vê): o que testou, o que descobriu...'
      : 'Escreva sua resposta ao cliente...';
  }));

  const enviar = $('#btn-enviar');
  if (enviar) enviar.addEventListener('click', () => {
    const texto = $('#texto-resposta').value.trim();
    if (!texto) return;
    st.mensagens.push({ tipo: abaAtual, texto, em: Date.now() });
    if (!st.responsavel) st.responsavel = 'Você';
    if (st.status === 'novo') st.status = 'atendimento';
    if (abaAtual === 'agente' && texto.includes('?')) {
      st.status = 'aguardando';
      agendarRespostaCliente(c, RESPOSTAS_CLIENTE[Math.floor(Math.random() * RESPOSTAS_CLIENTE.length)]);
    }
    salvarEstado();
    rotear();
  });

  const assumir = $('#btn-assumir');
  if (assumir) assumir.addEventListener('click', () => {
    st.responsavel = 'Você';
    if (st.status === 'novo') st.status = 'atendimento';
    st.mensagens.push({ tipo: 'sistema', texto: 'Chamado assumido por Você.', em: Date.now() });
    salvarEstado();
    rotear();
  });

  const sel = $('#sel-status');
  if (sel) sel.addEventListener('change', () => {
    if (sel.value === 'resolvido') {
      sel.value = st.status;
      abrirResolucao(c);
      return;
    }
    st.status = sel.value;
    if (!st.responsavel && sel.value !== 'novo') st.responsavel = 'Você';
    st.mensagens.push({ tipo: 'sistema', texto: `Status alterado para "${STATUS[sel.value]}".`, em: Date.now() });
    salvarEstado();
    rotear();
  });

  const resolver = $('#btn-resolver');
  if (resolver) resolver.addEventListener('click', () => abrirResolucao(c));

  const reabrir = $('#btn-reabrir');
  if (reabrir) reabrir.addEventListener('click', () => {
    st.status = 'atendimento';
    st.resolucao = null;
    st.mensagens.push({ tipo: 'sistema', texto: 'Chamado reaberto.', em: Date.now() });
    salvarEstado();
    rotear();
  });

  const escalar = $('#btn-escalar');
  if (escalar) escalar.addEventListener('click', () => {
    st.escalado = true;
    st.mensagens.push({ tipo: 'sistema', texto: 'Chamado escalado de N1 para N2. (No treino, continua com você 😉)', em: Date.now() });
    salvarEstado();
    rotear();
  });

  const dica = $('#btn-dica');
  if (dica) dica.addEventListener('click', () => {
    st.dica = true;
    st.mensagens.push({ tipo: 'sistema', texto: 'Dica solicitada ao N3.', em: Date.now() });
    salvarEstado();
    rotear();
  });
}

function agendarRespostaCliente(c, texto, depois) {
  const atraso = 4000 + Math.random() * 4000;
  setTimeout(() => {
    const st = estadoDe(c.id);
    st.mensagens.push({ tipo: 'cliente', texto, em: Date.now() });
    if (st.status === 'aguardando') st.status = 'atendimento';
    if (depois) depois(st);
    salvarEstado();
    toast(`${c.id} — ${c.solicitante.nome} respondeu`, texto.length > 80 ? `${texto.slice(0, 80)}...` : texto);
    bip();
    rotear();
  }, atraso);
}

function abrirResolucao(c) {
  abrirModal(`
    <div class="modal-caixa pequena">
      <h2>✅ Resolver ${c.id}</h2>
      <p style="color:var(--suave)">Documente como um analista de verdade: isso vira base de conhecimento.</p>
      <label>Causa raiz *</label>
      <textarea id="res-causa" rows="3" placeholder="Ex.: o back-end comparava o id como string com um número..."></textarea>
      <label>Solução aplicada *</label>
      <textarea id="res-solucao" rows="3" placeholder="Ex.: converti req.params.id com Number() antes do find..."></textarea>
      <label>Arquivos alterados</label>
      <input id="res-arquivos" placeholder="server/rotas/pedidos.js">
      <label style="display:flex;gap:8px;align-items:center;color:var(--texto)">
        <input type="checkbox" id="res-testei" style="width:auto"> Reproduzi o erro, corrigi e testei na loja
      </label>
      <div class="modal-rodape">
        <button class="btn-fantasma" data-fechar>Cancelar</button>
        <button class="btn-ok" id="res-confirmar" disabled>Resolver chamado</button>
      </div>
    </div>`);

  const causa = document.getElementById('res-causa');
  const solucao = document.getElementById('res-solucao');
  const testei = document.getElementById('res-testei');
  const confirmar = document.getElementById('res-confirmar');
  const validar = () => {
    confirmar.disabled = !(causa.value.trim() && solucao.value.trim() && testei.checked);
  };
  [causa, solucao].forEach((el) => el.addEventListener('input', validar));
  testei.addEventListener('change', validar);

  confirmar.addEventListener('click', () => {
    const st = estadoDe(c.id);
    st.status = 'resolvido';
    st.responsavel = st.responsavel || 'Você';
    st.resolucao = {
      causa: causa.value.trim(),
      solucao: solucao.value.trim(),
      arquivos: document.getElementById('res-arquivos').value.trim(),
      em: Date.now(),
    };
    st.mensagens.push({ tipo: 'sistema', texto: 'Chamado resolvido. Aguardando confirmação do cliente.', em: Date.now() });
    salvarEstado();
    fecharModal();
    toast('Chamado resolvido 🎉', `${c.id} foi para "Resolvidos".`);
    agendarRespostaCliente(c, CONFIRMACOES_CLIENTE[Math.floor(Math.random() * CONFIRMACOES_CLIENTE.length)], (s) => {
      s.status = 'resolvido';
    });
    rotear();
  });
}

// ---------------------------------------------------------------- modal
function abrirModal(html) {
  const modal = document.getElementById('modal');
  modal.innerHTML = html;
  modal.hidden = false;
  modal.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', fecharModal));
}

function fecharModal() {
  const modal = document.getElementById('modal');
  modal.hidden = true;
  modal.innerHTML = '';
}

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') fecharModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fecharModal();
});

// ---------------------------------------------------------------- roteamento
function rotear() {
  const hash = location.hash || '#/fila/todos';
  const [, tela, param] = hash.split('/');
  if (tela === 'chamado') telaChamado(param);
  else telaFila(param || 'todos');
}

window.addEventListener('hashchange', rotear);

document.getElementById('busca').addEventListener('input', (e) => {
  busca = e.target.value.trim().toLowerCase();
  if (location.hash.startsWith('#/chamado')) location.hash = '#/fila/todos';
  else rotear();
});

const caixaPlantao = document.getElementById('modo-plantao');
caixaPlantao.checked = estado.plantao;
caixaPlantao.addEventListener('change', () => {
  estado.plantao = caixaPlantao.checked;
  marcarVistos(false);
  salvarEstado();
  rotear();
});

document.getElementById('btn-resetar').addEventListener('click', () => {
  if (!confirm('Resetar a fila? Todo o progresso (status, respostas, resoluções) será perdido.')) return;
  try { localStorage.removeItem(CHAVE); } catch { /* ignore */ }
  location.hash = '#/fila/todos';
  location.reload();
});

// ---------------------------------------------------------------- chegada de chamados (modo plantão)
function marcarVistos(avisar) {
  for (const c of chamadosVisiveis()) {
    if (!estado.vistos.includes(c.id)) {
      estado.vistos.push(c.id);
      if (avisar) {
        toast(`📥 Novo chamado ${c.id} — ${c.prioridade}`, c.titulo, c.prioridade === 'Crítica');
        bip();
      }
    }
  }
}

marcarVistos(false);
salvarEstado();
rotear();

setInterval(() => {
  const antes = estado.vistos.length;
  marcarVistos(true);
  if (estado.vistos.length !== antes) salvarEstado();
  // Atualiza SLA na tela sem atrapalhar quem está digitando
  const digitando = document.activeElement && ['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName);
  if (!digitando && document.getElementById('modal').hidden) rotear();
}, 20000);
