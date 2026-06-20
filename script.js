// ===== MAX STREAMING - Sistema Completo =====

// === CONTA DEV (Albert - acesso ilimitado) ===
const DEV_ACCOUNT = {
    email: 'killer@maxstreaming.dev',
    senha: 'admin123',
    nome: 'KILLER (DEV)',
    role: 'dev'
};

const TEST_ACCOUNT = {
    email: 'teste@maxstreaming.com',
    senha: 'teste123',
    nome: 'Albert Teste',
    role: 'user'
};

// === Banco de dados local (localStorage) ===
function getUsuarios() {
    const users = JSON.parse(localStorage.getItem('max_streaming_users') || '[]');
    // Garante que conta dev sempre existe
    if (!users.find(u => u.email === DEV_ACCOUNT.email)) {
        users.push(DEV_ACCOUNT);
        localStorage.setItem('max_streaming_users', JSON.stringify(users));
    }
    if (!users.find(u => u.email === TEST_ACCOUNT.email)) {
        users.push(TEST_ACCOUNT);
        localStorage.setItem('max_streaming_users', JSON.stringify(users));
    }
    return users;
}

function salvarUsuarios(users) {
    localStorage.setItem('max_streaming_users', JSON.stringify(users));
}

function getUsuarioLogado() {
    return JSON.parse(sessionStorage.getItem('max_streaming_logado') || 'null');
}

function setUsuarioLogado(user) {
    sessionStorage.setItem('max_streaming_logado', JSON.stringify(user));
}

function logout() {
    sessionStorage.removeItem('max_streaming_logado');
    location.reload();
}

// === Sistema de Login ===
function abrirLogin() {
    document.getElementById('modal-login').style.display = 'flex';
    document.getElementById('login-erro').textContent = '';
    document.getElementById('reg-erro').textContent = '';
}

function fecharModalLogin() {
    document.getElementById('modal-login').style.display = 'none';
}

function trocarTab(tab) {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));

    if (tab === 'login') {
        document.getElementById('form-login').style.display = 'grid';
        document.getElementById('form-registro').style.display = 'none';
        btns[0].classList.add('active');
    } else {
        document.getElementById('form-login').style.display = 'none';
        document.getElementById('form-registro').style.display = 'grid';
        btns[1].classList.add('active');
    }
}

function fazerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const usuarios = getUsuarios();
    const user = usuarios.find(u => u.email === email && u.senha === senha);

    if (user) {
        setUsuarioLogado(user);
        fecharModalLogin();
        atualizarInterface();
    } else {
        document.getElementById('login-erro').textContent = 'E-mail ou senha incorretos!';
    }
}

function criarConta(event) {
    event.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;
    const senha2 = document.getElementById('reg-senha2').value;

    if (senha !== senha2) {
        document.getElementById('reg-erro').textContent = 'As senhas nao coincidem!';
        return;
    }

    const usuarios = getUsuarios();
    if (usuarios.find(u => u.email === email)) {
        document.getElementById('reg-erro').textContent = 'Este e-mail ja esta cadastrado!';
        return;
    }

    const novoUser = { nome: nome, email: email, senha: senha, role: 'user' };
    usuarios.push(novoUser);
    salvarUsuarios(usuarios);
    setUsuarioLogado(novoUser);
    fecharModalLogin();
    atualizarInterface();
    alert('Conta criada com sucesso! Bem-vindo, ' + nome + '!');
}

// === Interface do usuario logado ===
function atualizarInterface() {
    const user = getUsuarioLogado();
    const btnLogin = document.getElementById('btn-login-nav');
    const userBadge = document.getElementById('usuario-logado');
    const painelDev = document.getElementById('painel-dev');

    if (user) {
        btnLogin.style.display = 'none';
        userBadge.style.display = 'inline-flex';
        if (user.role === 'dev') {
            userBadge.innerHTML = '&#128736; ' + user.nome + ' <a href="#" onclick="logout()" style="color:#cc0000;margin-left:10px;">Sair</a>';
            painelDev.style.display = 'block';
            atualizarPainelDev();
        } else {
            userBadge.innerHTML = '&#128100; ' + user.nome + ' <a href="#" onclick="logout()" style="color:#cc0000;margin-left:10px;">Sair</a>';
            painelDev.style.display = 'none';
        }
    } else {
        btnLogin.style.display = 'inline';
        userBadge.style.display = 'none';
        painelDev.style.display = 'none';
    }
}

function atualizarPainelDev() {
    const usuarios = getUsuarios();
    const compras = JSON.parse(localStorage.getItem('max_streaming_compras') || '[]');
    document.getElementById('dev-total-users').textContent = usuarios.length;
    document.getElementById('dev-total-compras').textContent = compras.length;
}

function resetarDados() {
    if (confirm('Tem certeza? Isso vai apagar todos os dados de usuarios e compras!')) {
        localStorage.removeItem('max_streaming_compras');
        localStorage.removeItem('max_streaming_fps');
        localStorage.removeItem('max_streaming_users');
        document.cookie = 'max_streaming_purchased=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        alert('Dados resetados!');
        location.reload();
    }
}

function verUsuarios() {
    const lista = document.getElementById('dev-lista-usuarios');
    const usuarios = getUsuarios();
    if (lista.style.display === 'none') {
        let html = '<h4>Lista de Usuarios:</h4><table><tr><th>Nome</th><th>Email</th><th>Role</th></tr>';
        usuarios.forEach(u => {
            html += '<tr><td>' + u.nome + '</td><td>' + u.email + '</td><td>' + u.role + '</td></tr>';
        });
        html += '</table>';
        lista.innerHTML = html;
        lista.style.display = 'block';
    } else {
        lista.style.display = 'none';
    }
}

// === Fingerprint e deteccao ===
function gerarFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('MAX STREAMING fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();
    const dados = [navigator.userAgent, navigator.language, screen.width + 'x' + screen.height, screen.colorDepth, new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 'unknown', navigator.platform, canvasData].join('|');
    let hash = 0;
    for (let i = 0; i < dados.length; i++) { const char = dados.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash; }
    return Math.abs(hash).toString(36);
}

function verificarCompraAnterior() {
    const user = getUsuarioLogado();
    if (user && user.role === 'dev') return false; // Dev nunca tem restricao
    const comprasRegistradas = JSON.parse(localStorage.getItem('max_streaming_compras') || '[]');
    if (comprasRegistradas.length > 0) return true;
    if (document.cookie.includes('max_streaming_purchased=true')) return true;
    const fingerprint = gerarFingerprint();
    const fps = JSON.parse(localStorage.getItem('max_streaming_fps') || '[]');
    if (fps.includes(fingerprint)) return true;
    return false;
}

function registrarCompra(dados) {
    const fingerprint = gerarFingerprint();
    const compras = JSON.parse(localStorage.getItem('max_streaming_compras') || '[]');
    compras.push({ data: new Date().toISOString(), pacote: dados.pacote, fingerprint: fingerprint, usuario: getUsuarioLogado() ? getUsuarioLogado().email : 'anonimo' });
    localStorage.setItem('max_streaming_compras', JSON.stringify(compras));
    const fps = JSON.parse(localStorage.getItem('max_streaming_fps') || '[]');
    if (!fps.includes(fingerprint)) fps.push(fingerprint);
    localStorage.setItem('max_streaming_fps', JSON.stringify(fps));
    const expDate = new Date(); expDate.setFullYear(expDate.getFullYear() + 10);
    document.cookie = 'max_streaming_purchased=true; expires=' + expDate.toUTCString() + '; path=/';
}

function ehPrimeiraCompra() {
    return !verificarCompraAnterior();
}

// === Compra ===
let pacoteSelecionado = 0;

function assinar(qtd) {
    const user = getUsuarioLogado();
    if (!user) {
        alert('Voce precisa estar logado para comprar! Faca login ou crie uma conta.');
        abrirLogin();
        return;
    }
    pacoteSelecionado = qtd;
    const precos = { 1: 12, 2: 24, 3: 36, 4: 48 };
    const nomes = { 1: 'Basico (1 Streaming)', 2: 'Duplo (2 Streamings)', 3: 'Trio (3 Streamings)', 4: 'Premium (4 Streamings)' };

    const resumo = document.getElementById('modal-resumo');
    if (user.role === 'dev') {
        resumo.innerHTML = '<p><strong>Pacote:</strong> ' + nomes[qtd] + '</p><p><strong>Valor:</strong> GRATIS (Conta DEV)</p><p class="dev-free-msg">Voce tem acesso ilimitado!</p>';
    } else {
        let preco = precos[qtd];
        let htmlResumo = '<p><strong>Pacote:</strong> ' + nomes[qtd] + '</p>';
        if (preco >= 90) {
            const desconto = preco * 0.10;
            const precoFinal = preco - desconto;
            htmlResumo += '<p><strong>Valor original:</strong> <s>R$ ' + preco + '</s></p>';
            htmlResumo += '<p style="color:#00cc00;font-size:1.1rem;"><strong>10% OFF! Valor final: R$ ' + precoFinal.toFixed(2) + '</strong></p>';
            htmlResumo += '<p style="color:#ffaa00;font-size:0.9rem;">Voce economizou R$ ' + desconto.toFixed(2) + '!</p>';
        } else {
            htmlResumo += '<p><strong>Valor:</strong> R$ ' + preco + ' (compra unica)</p>';
            if (preco < 90) {
                const falta = 90 - preco;
                htmlResumo += '<p style="color:#aaa;font-size:0.85rem;">Faltam R$ ' + falta + ' para ganhar 10% de desconto!</p>';
            }
        }
        resumo.innerHTML = htmlResumo;
    }

    const brindeSection = document.getElementById('brinde-section');
    if (ehPrimeiraCompra()) {
        brindeSection.style.display = 'block';
    } else {
        brindeSection.style.display = 'none';
    }
    // Popular checkboxes de escolha de streamings
    popularEscolhaStreamings(qtd);

    document.getElementById('modal-assinatura').style.display = 'flex';
}

function popularEscolhaStreamings(qtd) {
    const streamings = getStreamingsDisponiveis();
    const container = document.getElementById('streamings-escolha');
    let html = '';
    streamings.forEach(s => {
        html += '<label><input type="checkbox" name="streaming-escolha" value="' + s + '" onchange="limitarEscolha(' + qtd + ')"> ' + s + '</label>';
    });
    html += '<p id="escolha-contador" style="color:#0066ff;margin-top:10px;font-size:0.9rem;">Selecione ' + qtd + ' streaming(s)</p>';
    container.innerHTML = html;
}

function limitarEscolha(max) {
    const checks = document.querySelectorAll('input[name="streaming-escolha"]');
    const selecionados = document.querySelectorAll('input[name="streaming-escolha"]:checked');
    const contador = document.getElementById('escolha-contador');

    if (selecionados.length >= max) {
        checks.forEach(c => { if (!c.checked) c.disabled = true; });
        contador.textContent = 'Pronto! ' + max + ' streaming(s) selecionado(s).';
        contador.style.color = '#00cc00';
    } else {
        checks.forEach(c => c.disabled = false);
        const falta = max - selecionados.length;
        contador.textContent = 'Selecione mais ' + falta + ' streaming(s)';
        contador.style.color = '#0066ff';
    }

    // Atualizar opcoes de brinde (excluir os ja selecionados)
    atualizarBrindeExcluindo();
}

function atualizarBrindeExcluindo() {
    const selecionados = Array.from(document.querySelectorAll('input[name="streaming-escolha"]:checked')).map(c => c.value);
    const streamings = getStreamingsDisponiveis();
    const container = document.getElementById('brinde-opcoes-container');
    if (!container) return;
    let html = '';
    streamings.forEach(s => {
        if (!selecionados.includes(s)) {
            html += '<label><input type="radio" name="brinde" value="' + s + '"> ' + s + '</label>';
        }
    });
    container.innerHTML = html;
}

function fecharModal() { document.getElementById('modal-assinatura').style.display = 'none'; }
function fecharAviso() { document.getElementById('aviso-compra-anterior').style.display = 'none'; }

function finalizarCompra(event) {
    event.preventDefault();
    const user = getUsuarioLogado();
    const brindeSelecionado = document.querySelector('input[name="brinde"]:checked');
    const primeiraCompra = ehPrimeiraCompra();
    const streamingsSelecionados = Array.from(document.querySelectorAll('input[name="streaming-escolha"]:checked')).map(c => c.value);

    const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked');
    if (!pagamentoSelecionado && user.role !== 'dev') {
        alert('Selecione uma forma de pagamento!');
        return;
    }

    if (streamingsSelecionados.length < pacoteSelecionado) {
        alert('Selecione ' + pacoteSelecionado + ' streaming(s) para continuar!');
        return;
    }

    if (primeiraCompra && !brindeSelecionado) {
        alert('Selecione seu brinde de primeira compra!');
        return;
    }

    if (user.role !== 'dev') {
        registrarCompra({ pacote: pacoteSelecionado, brinde: brindeSelecionado ? brindeSelecionado.value : null });
    }

    let msg = 'Compra realizada com sucesso!\n\nPacote: ' + pacoteSelecionado + ' streaming(s)\nStreamings: ' + streamingsSelecionados.join(', ');
    if (user.role === 'dev') msg = 'Acesso liberado (DEV)!\n\nPacote: ' + pacoteSelecionado + ' streaming(s)\nStreamings: ' + streamingsSelecionados.join(', ');
    if (primeiraCompra && brindeSelecionado) msg += '\nBrinde: +1 ' + brindeSelecionado.value + ' GRATIS!';

    fecharModal();
    mostrarObrigado(msg);
}

function mostrarObrigado(msg) {
    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.id = 'modal-obrigado';
    overlay.innerHTML = '<div class="modal-content" style="text-align:center;"><h2 style="color:#00cc00;font-size:2rem;">&#9989; Compra Realizada!</h2><p style="font-size:1.2rem;margin:20px 0;">Obrigado por comprar na <strong>MAX STREAMING</strong>!</p><p style="color:#aaa;">Seu acesso sera liberado em instantes.</p><div style="background:rgba(0,100,255,0.1);border:1px solid rgba(0,100,255,0.3);border-radius:10px;padding:15px;margin:20px 0;text-align:left;white-space:pre-line;color:#ccc;">' + msg + '</div><p style="color:#0066ff;">Qualquer duvida, use nosso chat de suporte!</p><button onclick="fecharObrigado()" class="btn-finalizar" style="margin-top:20px;">Fechar</button></div>';
    document.body.appendChild(overlay);
}

function fecharObrigado() {
    const modal = document.getElementById('modal-obrigado');
    if (modal) modal.remove();
    verificarEExibirAviso();
    if (user.role === 'dev') atualizarPainelDev();
}

function verificarEExibirAviso() {
    const user = getUsuarioLogado();
    if (user && user.role === 'dev') return; // Dev nunca ve aviso
    if (verificarCompraAnterior()) {
        document.getElementById('aviso-compra-anterior').style.display = 'block';
        document.getElementById('brinde-destaque').style.display = 'none';
    }
}


// === Gerenciar Streamings (DEV) ===
const STREAMINGS_PADRAO = ['Netflix', 'Disney+', 'HBO Max', 'Amazon Prime', 'Spotify', 'Crunchyroll', 'Paramount+', 'Apple TV+', 'Globoplay', 'Star+'];

function getStreamingsDisponiveis() {
    const salvos = localStorage.getItem('max_streaming_opcoes');
    if (salvos) return JSON.parse(salvos);
    localStorage.setItem('max_streaming_opcoes', JSON.stringify(STREAMINGS_PADRAO));
    return STREAMINGS_PADRAO;
}

function salvarStreamings(lista) {
    localStorage.setItem('max_streaming_opcoes', JSON.stringify(lista));
}

function adicionarStreaming() {
    const nome = document.getElementById('novo-streaming-nome').value.trim();
    if (!nome) { alert('Digite o nome do streaming!'); return; }
    const lista = getStreamingsDisponiveis();
    if (lista.find(s => s.toLowerCase() === nome.toLowerCase())) { alert('Esse streaming ja existe!'); return; }
    lista.push(nome);
    salvarStreamings(lista);
    document.getElementById('novo-streaming-nome').value = '';
    document.getElementById('novo-streaming-logo').value = '';
    renderizarStreamingsDev();
    atualizarBrindeOpcoes();
    alert(nome + ' adicionado com sucesso!');
}

function removerStreaming(nome) {
    if (!confirm('Remover ' + nome + ' da lista?')) return;
    let lista = getStreamingsDisponiveis();
    lista = lista.filter(s => s !== nome);
    salvarStreamings(lista);
    renderizarStreamingsDev();
    atualizarBrindeOpcoes();
}

function renderizarStreamingsDev() {
    const lista = getStreamingsDisponiveis();
    const container = document.getElementById('lista-streamings-dev');
    if (!container) return;
    let html = '<h4>Streamings ativos (' + lista.length + '):</h4><div class="streamings-chips">';
    lista.forEach(s => {
        html += '<div class="streaming-chip"><span>' + s + '</span><button onclick="removerStreaming(\'' + s.replace(/'/g, "\\'") + '\')" class="chip-remove">&times;</button></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function atualizarBrindeOpcoes() {
    const lista = getStreamingsDisponiveis();
    const container = document.querySelector('.brinde-opcoes');
    if (!container) return;
    let html = '';
    lista.forEach(s => {
        html += '<label><input type="radio" name="brinde" value="' + s + '"> ' + s + '</label>';
    });
    container.innerHTML = html;
}


// === Controle de Estoque (GGMax) ===
function getEstoque() {
    return JSON.parse(localStorage.getItem('max_streaming_estoque') || '{}');
}

function salvarEstoque(estoque) {
    localStorage.setItem('max_streaming_estoque', JSON.stringify(estoque));
}

function getHistoricoEstoque() {
    return JSON.parse(localStorage.getItem('max_streaming_estoque_historico') || '[]');
}

function salvarHistoricoEstoque(hist) {
    localStorage.setItem('max_streaming_estoque_historico', JSON.stringify(hist));
}

function popularSelectEstoque() {
    const select = document.getElementById('estoque-streaming-select');
    if (!select) return;
    const streamings = getStreamingsDisponiveis();
    select.innerHTML = '<option value="">Selecione o streaming</option>';
    streamings.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        select.appendChild(opt);
    });
}

function adicionarEstoque() {
    const select = document.getElementById('estoque-streaming-select');
    const qtdInput = document.getElementById('estoque-qtd');
    const obsInput = document.getElementById('estoque-obs');
    const streaming = select.value;
    const qtd = parseInt(qtdInput.value) || 0;
    const obs = obsInput.value.trim();

    if (!streaming) { alert('Selecione um streaming!'); return; }
    if (qtd <= 0) { alert('Quantidade deve ser maior que 0!'); return; }

    const estoque = getEstoque();
    if (!estoque[streaming]) estoque[streaming] = 0;
    estoque[streaming] += qtd;
    salvarEstoque(estoque);

    // Historico
    const hist = getHistoricoEstoque();
    hist.push({
        data: new Date().toLocaleString('pt-BR'),
        streaming: streaming,
        qtd: qtd,
        tipo: 'entrada',
        obs: obs || 'Reposicao via GGMax'
    });
    salvarHistoricoEstoque(hist);

    qtdInput.value = '1';
    obsInput.value = '';
    renderizarEstoque();
    alert('+' + qtd + ' ' + streaming + ' adicionado ao estoque!');
}

function removerDoEstoque(streaming, qtd) {
    const estoque = getEstoque();
    if (!estoque[streaming] || estoque[streaming] < qtd) return false;
    estoque[streaming] -= qtd;
    salvarEstoque(estoque);

    const hist = getHistoricoEstoque();
    hist.push({
        data: new Date().toLocaleString('pt-BR'),
        streaming: streaming,
        qtd: qtd,
        tipo: 'saida',
        obs: 'Venda realizada'
    });
    salvarHistoricoEstoque(hist);
    return true;
}

function renderizarEstoque() {
    const container = document.getElementById('tabela-estoque');
    if (!container) return;
    const estoque = getEstoque();
    const streamings = getStreamingsDisponiveis();
    let html = '<table><tr><th>Streaming</th><th>Estoque</th><th>Status</th><th>Acao</th></tr>';
    streamings.forEach(s => {
        const qtd = estoque[s] || 0;
        let status = '';
        if (qtd === 0) status = '<span style="color:#cc0000;">SEM ESTOQUE</span>';
        else if (qtd <= 3) status = '<span style="color:#ffaa00;">BAIXO</span>';
        else status = '<span style="color:#00cc00;">OK</span>';
        html += '<tr><td>' + s + '</td><td><strong>' + qtd + '</strong></td><td>' + status + '</td>';
        html += '<td><button onclick="ajustarEstoque(\'' + s.replace(/'/g, "\\'") + '\')" class="btn-dev" style="padding:5px 10px;font-size:0.8rem;">Ajustar</button></td></tr>';
    });
    html += '</table>';

    // Ultimas movimentacoes
    const hist = getHistoricoEstoque();
    if (hist.length > 0) {
        html += '<h4 style="margin-top:20px;">Ultimas movimentacoes:</h4><table><tr><th>Data</th><th>Streaming</th><th>Tipo</th><th>Qtd</th><th>Obs</th></tr>';
        const ultimas = hist.slice(-10).reverse();
        ultimas.forEach(h => {
            const cor = h.tipo === 'entrada' ? '#00cc00' : '#cc0000';
            const sinal = h.tipo === 'entrada' ? '+' : '-';
            html += '<tr><td>' + h.data + '</td><td>' + h.streaming + '</td><td style="color:' + cor + ';">' + h.tipo.toUpperCase() + '</td><td style="color:' + cor + ';">' + sinal + h.qtd + '</td><td>' + h.obs + '</td></tr>';
        });
        html += '</table>';
    }
    container.innerHTML = html;
}

function ajustarEstoque(streaming) {
    const estoque = getEstoque();
    const atual = estoque[streaming] || 0;
    const novoValor = prompt('Estoque atual de ' + streaming + ': ' + atual + '\nDigite o novo valor:');
    if (novoValor === null) return;
    const novo = parseInt(novoValor);
    if (isNaN(novo) || novo < 0) { alert('Valor invalido!'); return; }
    const diff = novo - atual;
    estoque[streaming] = novo;
    salvarEstoque(estoque);

    const hist = getHistoricoEstoque();
    hist.push({
        data: new Date().toLocaleString('pt-BR'),
        streaming: streaming,
        qtd: Math.abs(diff),
        tipo: diff >= 0 ? 'entrada' : 'saida',
        obs: 'Ajuste manual (de ' + atual + ' para ' + novo + ')'
    });
    salvarHistoricoEstoque(hist);
    renderizarEstoque();
}

function exportarEstoque() {
    const estoque = getEstoque();
    const hist = getHistoricoEstoque();
    let texto = '=== RELATORIO DE ESTOQUE - MAX STREAMING ===\n';
    texto += 'Data: ' + new Date().toLocaleString('pt-BR') + '\n\n';
    texto += '--- ESTOQUE ATUAL ---\n';
    const streamings = getStreamingsDisponiveis();
    streamings.forEach(s => {
        texto += s + ': ' + (estoque[s] || 0) + ' unidades\n';
    });
    texto += '\n--- HISTORICO ---\n';
    hist.forEach(h => {
        texto += h.data + ' | ' + h.streaming + ' | ' + h.tipo + ' | ' + h.qtd + ' | ' + h.obs + '\n';
    });
    const blob = new Blob([texto], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'estoque_maxstreaming_' + new Date().toISOString().slice(0,10) + '.txt';
    a.click();
}

// === Inicializacao ===
document.addEventListener('DOMContentLoaded', function() {
    getUsuarios(); // Garante conta dev existe
    atualizarInterface();
    verificarEExibirAviso();
    atualizarBrindeOpcoes();
    renderizarStreamingsDev();
    popularSelectEstoque();
    renderizarEstoque();
});






// === Pagamento ===
function mostrarDetalhesPagamento() {
    const selecionado = document.querySelector('input[name="pagamento"]:checked');
    const container = document.getElementById('pagamento-detalhes');
    if (!selecionado) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    const tipo = selecionado.value;

    if (tipo === 'pix') {
        container.innerHTML = '<div class="pag-detalhe-box pix-box"><p><strong>Chave PIX:</strong></p><p class="pix-chave">maxstreaming@pix.com</p><button type="button" onclick="copiarPix()" class="btn-dev" style="margin-top:10px;">Copiar Chave</button><p style="color:#aaa;font-size:0.85rem;margin-top:10px;">Apos o pagamento, envie o comprovante para confirmarmos sua compra.</p></div>';
    } else if (tipo === 'credito') {
        container.innerHTML = '<div class="pag-detalhe-box"><input type="text" id="card-numero" placeholder="Numero do cartao" maxlength="19" oninput="formatarCartao(this)"><div style="display:flex;gap:10px;"><input type="text" id="card-validade" placeholder="MM/AA" maxlength="5" oninput="formatarValidade(this)"><input type="text" id="card-cvv" placeholder="CVV" maxlength="3"></div><input type="text" id="card-nome" placeholder="Nome no cartao"><select id="card-parcelas"><option value="1">1x sem juros</option><option value="2">2x sem juros</option><option value="3">3x sem juros</option></select></div>';
    } else if (tipo === 'debito') {
        container.innerHTML = '<div class="pag-detalhe-box"><input type="text" id="card-numero" placeholder="Numero do cartao" maxlength="19" oninput="formatarCartao(this)"><div style="display:flex;gap:10px;"><input type="text" id="card-validade" placeholder="MM/AA" maxlength="5" oninput="formatarValidade(this)"><input type="text" id="card-cvv" placeholder="CVV" maxlength="3"></div><input type="text" id="card-nome" placeholder="Nome no cartao"><p style="color:#aaa;font-size:0.85rem;">Debito: pagamento a vista.</p></div>';
    }
}

function copiarPix() {
    navigator.clipboard.writeText('maxstreaming@pix.com');
    alert('Chave PIX copiada!');
}

function formatarCartao(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/(\d{4})(?=\d)/g, ' ');
    input.value = v.substring(0, 19);
}

function formatarValidade(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2);
    input.value = v.substring(0, 5);
}

// === Chatbot ===
function toggleChat() {
    const win = document.getElementById('chatbot-window');
    const btn = document.getElementById('chatbot-btn');
    if (win.style.display === 'none') {
        win.style.display = 'flex';
        btn.style.display = 'none';
        document.getElementById('chatbot-input').focus();
    } else {
        win.style.display = 'none';
        btn.style.display = 'flex';
    }
}

function enviarMsgChat() {
    const input = document.getElementById('chatbot-input');
    const msg = input.value.trim();
    if (!msg) return;
    adicionarMsg('user', msg);
    input.value = '';
    setTimeout(() => {
        const resposta = gerarResposta(msg);
        adicionarMsg('bot', resposta);
    }, 600);
}

function adicionarMsg(tipo, texto) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'msg ' + tipo;
    div.textContent = texto;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function gerarResposta(pergunta) {
    const p = pergunta.toLowerCase();

    // Saudacoes
    if (p.match(/oi|ola|hey|eai|fala/)) return 'Ola! Bem-vindo a MAX STREAMING! Como posso ajudar?';
    if (p.match(/tudo bem|como vai/)) return 'Estou otimo! Pronto pra te ajudar. O que precisa saber?';

    // Precos e pacotes
    if (p.match(/pre[cç]o|quanto custa|valor/)) return 'Nossos pacotes: 1 streaming = R, 2 streamings = R, 3 streamings = R, 4 streamings = R. Tudo compra unica!';
    if (p.match(/pacote|plano/)) return 'Temos 4 pacotes: Basico (1 streaming - R), Duplo (2 - R), Trio (3 - R) e Premium (4 - R). Todos sao compra unica!';
    if (p.match(/desconto|promo/)) return 'Compras a partir de R ganham 10% de desconto automaticamente!';

    // Brinde
    if (p.match(/brinde|gratis|primeira compra|gift/)) return 'Na sua primeira compra voce ganha +1 assinatura de brinde! Voce pode escolher entre varias plataformas disponiveis.';

    // Pagamento
    if (p.match(/pagar|pagamento|pix|cartao|boleto/)) return 'Aceitamos diversas formas de pagamento. Basta escolher seu pacote e finalizar a compra!';

    // Conta
    if (p.match(/conta|cadastro|login|entrar|registrar/)) return 'Clique em "Entrar" no menu superior. Voce pode criar uma conta nova ou fazer login se ja tiver uma!';

    // Streaming especifico
    if (p.match(/netflix|disney|hbo|amazon|spotify|crunchyroll|paramount|apple|globoplay/)) return 'Sim, temos essa plataforma disponivel! Escolha um pacote e selecione os streamings que deseja.';

    // Como funciona
    if (p.match(/como funciona|como comprar|como faz/)) return '1) Crie sua conta ou faca login. 2) Escolha o pacote com a quantidade de streamings. 3) Finalize a compra. Simples assim!';

    // Suporte
    if (p.match(/problema|erro|bug|nao funciona|ajuda/)) return 'Sinto muito pelo inconveniente! Descreva melhor o problema e vou tentar te ajudar. Se precisar, entre em contato pelo nosso suporte.';

    // Cancelar
    if (p.match(/cancelar|cancelamento|reembolso|devolver/)) return 'Como a compra e unica, nao ha cancelamento de assinatura. Se tiver algum problema com sua conta, entre em contato conosco!';

    // Tempo de entrega
    if (p.match(/tempo|demora|quando recebo|entrega/)) return 'O acesso e liberado imediatamente apos a confirmacao da compra!';

    // Seguranca
    if (p.match(/seguro|confiavel|golpe/)) return 'A MAX STREAMING e 100% confiavel! Todos os dados sao protegidos e suas assinaturas sao garantidas.';

    // Obrigado
    if (p.match(/obrigado|valeu|thanks|brigadao/)) return 'De nada! Qualquer outra duvida e so perguntar. Boas streams!';

    // Tchau
    if (p.match(/tchau|bye|ate mais|falou/)) return 'Ate mais! Volte quando precisar. Boas streams!';

    // Resposta padrao
    return 'Nao entendi muito bem. Posso te ajudar com: precos, pacotes, brinde, como funciona, pagamento, ou problemas com sua conta. Sobre o que voce quer saber?';
}





