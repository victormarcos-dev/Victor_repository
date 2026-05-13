/**
 * ===========================================================================
 * LOJA EXEMPLO — SCRIPT PRINCIPAL
 * Arquitetura: IIFE com módulos internos, delegação de eventos,
 * gerenciamento de estado centralizado, localStorage para persistência.
 * ===========================================================================
 */
(function () {
    'use strict';

    /* ======================================================================
       CONFIGURAÇÃO E ESTADO GLOBAL
       ====================================================================== */
    const CONFIG = {
        ITENS_POR_PAGINA: 6,
        CUPOM_VALIDO: 'PETROLEO10', // Cupom fictício para teste
        DESCONTO_CUPOM: 0.10,        // 10% de desconto
    };

    // Estado reativo da aplicação
    const estado = {
        carrinho: [],
        wishlist: [],
        filtroCategoria: 'todos',
        ordenacao: 'relevancia',
        busca: '',
        paginaAtual: 1,
        cupomAplicado: false,
        descontoAtual: 0,
    };

    /* ======================================================================
       DADOS DOS PRODUTOS (FICTÍCIOS)
       Cada produto possui: id, nome, preco, precoOriginal (para desconto),
       categoria, avaliacao (estrelas), descricao, desconto (porcentagem).
       ====================================================================== */
    const produtos = [
        { id: 1, nome: 'Produto 1', preco: 29.90, precoOriginal: 39.90, categoria: 'eletronicos', avaliacao: 4.5, descricao: 'Descrição breve do Produto 1.', desconto: 25 },
        { id: 2, nome: 'Produto 2', preco: 49.90, precoOriginal: null, categoria: 'roupas', avaliacao: 5, descricao: 'Descrição breve do Produto 2.', desconto: 0 },
        { id: 3, nome: 'Produto 3', preco: 19.90, precoOriginal: 29.90, categoria: 'acessorios', avaliacao: 4, descricao: 'Descrição breve do Produto 3.', desconto: 33 },
        { id: 4, nome: 'Produto 4', preco: 89.90, precoOriginal: null, categoria: 'eletronicos', avaliacao: 4.8, descricao: 'Descrição breve do Produto 4.', desconto: 0 },
        { id: 5, nome: 'Produto 5', preco: 59.90, precoOriginal: 79.90, categoria: 'roupas', avaliacao: 3.5, descricao: 'Descrição breve do Produto 5.', desconto: 25 },
        { id: 6, nome: 'Produto 6', preco: 109.90, precoOriginal: null, categoria: 'acessorios', avaliacao: 5, descricao: 'Descrição breve do Produto 6.', desconto: 0 },
        { id: 7, nome: 'Produto 7', preco: 39.90, precoOriginal: 49.90, categoria: 'eletronicos', avaliacao: 4.2, descricao: 'Descrição breve do Produto 7.', desconto: 20 },
        { id: 8, nome: 'Produto 8', preco: 79.90, precoOriginal: null, categoria: 'roupas', avaliacao: 4.7, descricao: 'Descrição breve do Produto 8.', desconto: 0 },
        { id: 9, nome: 'Produto 9', preco: 149.90, precoOriginal: 179.90, categoria: 'acessorios', avaliacao: 4.9, descricao: 'Descrição breve do Produto 9.', desconto: 17 },
        { id: 10, nome: 'Produto 10', preco: 64.90, precoOriginal: null, categoria: 'eletronicos', avaliacao: 3.8, descricao: 'Descrição breve do Produto 10.', desconto: 0 },
        { id: 11, nome: 'Produto 11', preco: 22.90, precoOriginal: 32.90, categoria: 'roupas', avaliacao: 4.1, descricao: 'Descrição breve do Produto 11.', desconto: 30 },
        { id: 12, nome: 'Produto 12', preco: 199.90, precoOriginal: null, categoria: 'acessorios', avaliacao: 5, descricao: 'Descrição breve do Produto 12.', desconto: 0 },
    ];

    /* ======================================================================
       UTILITÁRIOS
       ====================================================================== */
    // Formata preço para Real brasileiro
    const formatarPreco = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

    // Gera estrelas HTML baseado na nota
    const gerarEstrelas = (nota) => {
        const cheias = Math.floor(nota);
        const meia = nota % 1 >= 0.5 ? 1 : 0;
        return '★'.repeat(cheias) + (meia ? '½' : '') + '☆'.repeat(5 - cheias - meia);
    };

    // Debounce para busca (evita chamadas excessivas)
    const debounce = (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    // Persistência no localStorage
    const persistirEstado = () => {
        localStorage.setItem('loja_carrinho', JSON.stringify(estado.carrinho));
        localStorage.setItem('loja_wishlist', JSON.stringify(estado.wishlist));
    };

    const carregarEstado = () => {
        try {
            const carrinhoSalvo = localStorage.getItem('loja_carrinho');
            const wishlistSalva = localStorage.getItem('loja_wishlist');
            if (carrinhoSalvo) estado.carrinho = JSON.parse(carrinhoSalvo);
            if (wishlistSalva) estado.wishlist = JSON.parse(wishlistSalva);
        } catch (e) { /* Ignora erros de parsing */ }
    };

    /* ======================================================================
       REFERÊNCIAS AOS ELEMENTOS DO DOM (CACHE PARA PERFORMANCE)
       ====================================================================== */
    const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
    const $$ = (seletor, contexto = document) => [...contexto.querySelectorAll(seletor)];

    const DOM = {
        gradeProdutos: $('[data-grade-produtos]'),
        carrinhoItens: $('[data-carrinho-itens]'),
        carrinhoContador: $('[data-carrinho-contador]'),
        carrinhoSubtotal: $('[data-carrinho-subtotal]'),
        carrinhoTotal: $('[data-carrinho-total]'),
        carrinhoDesconto: $('[data-carrinho-desconto]'),
        linhaDesconto: $('[data-linha-desconto]'),
        overlay: $('[data-overlay]'),
        carrinho: $('[data-carrinho]'),
        carrinhoToggle: $('[data-carrinho-toggle]'),
        carrinhoFechar: $('[data-carrinho-fechar]'),
        btnLimparCarrinho: $('[data-btn-limpar-carrinho]'),
        btnCheckout: $('[data-btn-checkout]'),
        modalCheckout: $('[data-modal-checkout]'),
        formCheckout: $('[data-form-checkout]'),
        checkoutFechar: $('[data-checkout-fechar]'),
        checkoutTotal: $('[data-checkout-total]'),
        checkoutSucesso: $('[data-checkout-sucesso]'),
        checkoutEtapas: $('[data-checkout-etapas]'),
        btnNovaCompra: $('[data-nova-compra]'),
        modalWishlist: $('[data-modal-wishlist]'),
        wishlistToggle: $('[data-wishlist-toggle]'),
        wishlistFechar: $('[data-wishlist-fechar]'),
        wishlistItens: $('[data-wishlist-itens]'),
        wishlistContador: $('[data-wishlist-contador]'),
        buscaInput: $('[data-busca-input]'),
        buscaForm: $('[data-busca-form]'),
        categoriasFiltro: $('[data-categorias-filtro]'),
        selectTrigger: $('[data-select-trigger]'),
        selectTexto: $('[data-select-texto]'),
        selectOpcoes: $('[data-select-opcoes]'),
        paginacao: $('[data-paginacao]'),
        paginaNumeros: $('[data-pagina-numeros]'),
        btnPaginaAnterior: $('[data-pagina-anterior]'),
        btnPaginaProxima: $('[data-pagina-proxima]'),
        produtosVazio: $('[data-produtos-vazio]'),
        cupomInput: $('[data-cupom-input]'),
        cupomAplicar: $('[data-cupom-aplicar]'),
        toastContainer: $('[data-toast-container]'),
        modalProduto: $('[data-modal-produto]'),
        modalConteudo: $('[data-modal-conteudo]'),
        modalFechar: $('[data-modal-fechar]'),
        carrosselSlides: $$('[data-carrossel-slide]'),
        carrosselIndicadores: $('[data-carrossel-indicadores]'),
        navLinks: $$('[data-nav-link]'),
        secoes: $$('[data-secao]'),
        hamburger: $('[data-hamburger]'),
        navegacao: $('[data-navegacao]'),
    };

    /* ======================================================================
       GERENCIAMENTO DE NOTIFICAÇÕES (TOAST)
       ====================================================================== */
    const mostrarToast = (mensagem, tipo = 'info') => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = mensagem;
        DOM.toastContainer.appendChild(toast);
        // Remove após animação
        setTimeout(() => toast.remove(), 3000);
    };

    /* ======================================================================
       FILTRAGEM E ORDENAÇÃO DE PRODUTOS
       ====================================================================== */
    const filtrarProdutos = () => {
        let resultado = [...produtos];

        // Filtro por categoria
        if (estado.filtroCategoria !== 'todos') {
            resultado = resultado.filter(p => p.categoria === estado.filtroCategoria);
        }

        // Filtro por busca textual
        if (estado.busca.trim()) {
            const termo = estado.busca.toLowerCase();
            resultado = resultado.filter(p =>
                p.nome.toLowerCase().includes(termo) ||
                p.descricao.toLowerCase().includes(termo) ||
                p.categoria.toLowerCase().includes(termo)
            );
        }

        // Ordenação
        switch (estado.ordenacao) {
            case 'preco-asc': resultado.sort((a, b) => a.preco - b.preco); break;
            case 'preco-desc': resultado.sort((a, b) => b.preco - a.preco); break;
            case 'nome-asc': resultado.sort((a, b) => a.nome.localeCompare(b.nome)); break;
            default: /* relevancia — mantém ordem original */ break;
        }

        return resultado;
    };

    /* ======================================================================
       RENDERIZAÇÃO DA GRADE DE PRODUTOS COM PAGINAÇÃO
       ====================================================================== */
    const renderizarProdutos = () => {
        const produtosFiltrados = filtrarProdutos();
        const totalPaginas = Math.ceil(produtosFiltrados.length / CONFIG.ITENS_POR_PAGINA);
        
        // Ajusta página atual se necessário
        if (estado.paginaAtual > totalPaginas) estado.paginaAtual = Math.max(1, totalPaginas);

        const inicio = (estado.paginaAtual - 1) * CONFIG.ITENS_POR_PAGINA;
        const fim = inicio + CONFIG.ITENS_POR_PAGINA;
        const paginaProdutos = produtosFiltrados.slice(inicio, fim);

        // Atualiza estado vazio
        DOM.produtosVazio.style.display = produtosFiltrados.length === 0 ? 'block' : 'none';
        DOM.paginacao.style.display = totalPaginas <= 1 ? 'none' : 'flex';

        // Limpa grade
        DOM.gradeProdutos.innerHTML = '';

        // Renderiza cada produto
        paginaProdutos.forEach((produto, index) => {
            const card = document.createElement('article');
            card.className = 'card-produto';
            card.style.animationDelay = `${index * 0.08}s`;
            card.setAttribute('data-produto-id', produto.id);

            const temDesconto = produto.desconto > 0;

            card.innerHTML = `
                <div class="card-produto__imagem" data-abrir-modal="${produto.id}">
                    LUGAR DA IMAGEM
                    ${temDesconto ? `<span class="card-produto__badge">-${produto.desconto}%</span>` : ''}
                </div>
                <button class="card-produto__wishlist ${estado.wishlist.includes(produto.id) ? 'card-produto__wishlist--ativo' : ''}" 
                        data-wishlist-btn="${produto.id}" 
                        aria-label="${estado.wishlist.includes(produto.id) ? 'Remover dos desejos' : 'Adicionar aos desejos'}">
                    ${estado.wishlist.includes(produto.id) ? '♥' : '♡'}
                </button>
                <div class="card-produto__info">
                    <span class="card-produto__categoria">${produto.categoria}</span>
                    <h3 class="card-produto__nome">${produto.nome}</h3>
                    <div class="card-produto__estrelas">${gerarEstrelas(produto.avaliacao)}</div>
                    <div>
                        <span class="card-produto__preco">${formatarPreco(produto.preco)}</span>
                        ${temDesconto ? `<span class="card-produto__preco-original">${formatarPreco(produto.precoOriginal)}</span>` : ''}
                    </div>
                    <div class="card-produto__acoes">
                        <div class="card-produto__qtd">
                            <button class="card-produto__qtd-btn" data-qtd-menos="${produto.id}">−</button>
                            <span class="card-produto__qtd-valor" data-qtd-valor="${produto.id}">1</span>
                            <button class="card-produto__qtd-btn" data-qtd-mais="${produto.id}">+</button>
                        </div>
                        <button class="card-produto__add" data-add-carrinho="${produto.id}">
                            Adicionar
                        </button>
                    </div>
                </div>
            `;

            DOM.gradeProdutos.appendChild(card);
        });

        // Renderiza paginação
        renderizarPaginacao(totalPaginas);
    };

    /* ======================================================================
       PAGINAÇÃO
       ====================================================================== */
    const renderizarPaginacao = (totalPaginas) => {
        DOM.paginaNumeros.innerHTML = '';
        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('button');
            btn.className = `paginacao__numero ${i === estado.paginaAtual ? 'paginacao__numero--ativo' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                estado.paginaAtual = i;
                renderizarProdutos();
                // Scroll suave para o topo da seção de produtos
                document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
            });
            DOM.paginaNumeros.appendChild(btn);
        }
        DOM.btnPaginaAnterior.disabled = estado.paginaAtual <= 1;
        DOM.btnPaginaProxima.disabled = estado.paginaAtual >= totalPaginas;
    };

    /* ======================================================================
       CARRINHO DE COMPRAS (GESTÃO DE ESTADO + RENDER)
       ====================================================================== */
    const adicionarAoCarrinho = (idProduto, quantidade = 1) => {
        const produto = produtos.find(p => p.id === idProduto);
        if (!produto) return;

        const existente = estado.carrinho.find(item => item.id === idProduto);
        if (existente) {
            existente.quantidade += quantidade;
        } else {
            estado.carrinho.push({ id: idProduto, quantidade, preco: produto.preco });
        }
        atualizarCarrinho();
        persistirEstado();
        mostrarToast(`"${produto.nome}" adicionado ao carrinho!`);
    };

    const removerDoCarrinho = (idProduto) => {
        estado.carrinho = estado.carrinho.filter(item => item.id !== idProduto);
        atualizarCarrinho();
        persistirEstado();
    };

    const alterarQuantidade = (idProduto, delta) => {
        const item = estado.carrinho.find(i => i.id === idProduto);
        if (!item) return;
        item.quantidade += delta;
        if (item.quantidade <= 0) {
            removerDoCarrinho(idProduto);
        } else {
            atualizarCarrinho();
            persistirEstado();
        }
    };

    const limparCarrinho = () => {
        estado.carrinho = [];
        estado.cupomAplicado = false;
        estado.descontoAtual = 0;
        atualizarCarrinho();
        persistirEstado();
        mostrarToast('Carrinho limpo.');
    };

    const calcularTotal = () => {
        const subtotal = estado.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        const desconto = estado.cupomAplicado ? subtotal * CONFIG.DESCONTO_CUPOM : 0;
        return { subtotal, desconto, total: subtotal - desconto };
    };

    const atualizarCarrinho = () => {
        const { subtotal, desconto, total } = calcularTotal();
        const qtdTotal = estado.carrinho.reduce((acc, item) => acc + item.quantidade, 0);

        // Atualiza contador no ícone
        DOM.carrinhoContador.textContent = qtdTotal;

        // Renderiza itens
        DOM.carrinhoItens.innerHTML = '';
        if (estado.carrinho.length === 0) {
            DOM.carrinhoItens.innerHTML = '<p style="text-align:center; color:var(--cor-texto-suave); padding:20px;">Seu carrinho está vazio.</p>';
        } else {
            estado.carrinho.forEach(item => {
                const produto = produtos.find(p => p.id === item.id);
                const div = document.createElement('div');
                div.className = 'item-carrinho';
                div.innerHTML = `
                    <div class="item-carrinho__imagem">IMG</div>
                    <div class="item-carrinho__info">
                        <p class="item-carrinho__nome">${produto ? produto.nome : 'Produto ' + item.id}</p>
                        <p class="item-carrinho__preco">${formatarPreco(item.preco)} cada</p>
                        <div class="item-carrinho__acoes">
                            <button class="item-carrinho__qtd-btn" data-carrinho-menos="${item.id}">−</button>
                            <span>${item.quantidade}</span>
                            <button class="item-carrinho__qtd-btn" data-carrinho-mais="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="item-carrinho__remover" data-carrinho-remover="${item.id}">🗑</button>
                `;
                DOM.carrinhoItens.appendChild(div);
            });
        }

        // Atualiza totais
        DOM.carrinhoSubtotal.textContent = formatarPreco(subtotal);
        DOM.carrinhoTotal.textContent = formatarPreco(total);
        
        if (estado.cupomAplicado && desconto > 0) {
            DOM.linhaDesconto.style.display = 'flex';
            DOM.carrinhoDesconto.textContent = `-${formatarPreco(desconto)}`;
        } else {
            DOM.linhaDesconto.style.display = 'none';
        }
    };

    /* ======================================================================
       ABRIR / FECHAR CARRINHO
       ====================================================================== */
    const abrirCarrinho = () => {
        DOM.overlay.classList.add('overlay--ativo');
        DOM.carrinho.classList.add('carrinho--aberto');
    };
    const fecharCarrinho = () => {
        DOM.overlay.classList.remove('overlay--ativo');
        DOM.carrinho.classList.remove('carrinho--aberto');
    };

    /* ======================================================================
       CUPOM DE DESCONTO
       ====================================================================== */
    const aplicarCupom = () => {
        const codigo = DOM.cupomInput.value.trim().toUpperCase();
        if (codigo === CONFIG.CUPOM_VALIDO && !estado.cupomAplicado) {
            estado.cupomAplicado = true;
            estado.descontoAtual = CONFIG.DESCONTO_CUPOM;
            atualizarCarrinho();
            persistirEstado();
            mostrarToast('Cupom aplicado! 10% de desconto.');
        } else if (estado.cupomAplicado) {
            mostrarToast('Cupom já foi aplicado.');
        } else {
            mostrarToast('Cupom inválido.', 'erro');
        }
        DOM.cupomInput.value = '';
    };

    /* ======================================================================
       WISHLIST
       ====================================================================== */
    const alternarWishlist = (idProduto) => {
        const index = estado.wishlist.indexOf(idProduto);
        if (index > -1) {
            estado.wishlist.splice(index, 1);
            mostrarToast('Removido da lista de desejos.');
        } else {
            estado.wishlist.push(idProduto);
            mostrarToast('Adicionado à lista de desejos!');
        }
        DOM.wishlistContador.textContent = estado.wishlist.length;
        persistirEstado();
        renderizarProdutos(); // Re-renderiza para atualizar ícones do coração
    };

    const renderizarWishlist = () => {
        DOM.wishlistItens.innerHTML = '';
        if (estado.wishlist.length === 0) {
            DOM.wishlistItens.innerHTML = '<p style="text-align:center; color:var(--cor-texto-suave);">Sua lista de desejos está vazia.</p>';
            return;
        }
        estado.wishlist.forEach(id => {
            const produto = produtos.find(p => p.id === id);
            if (!produto) return;
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid var(--cor-borda);';
            div.innerHTML = `
                <span>${produto.nome}</span>
                <span style="margin-left:auto;">${formatarPreco(produto.preco)}</span>
                <button data-add-carrinho="${produto.id}" style="background:var(--cor-primaria); color:white; border:none; padding:4px 10px; border-radius:6px; cursor:pointer;">+ Carrinho</button>
                <button data-wishlist-remover="${produto.id}" style="background:none; border:none; cursor:pointer;">✕</button>
            `;
            DOM.wishlistItens.appendChild(div);
        });
    };

    /* ======================================================================
       CHECKOUT
       ====================================================================== */
    const abrirCheckout = () => {
        if (estado.carrinho.length === 0) {
            mostrarToast('Carrinho vazio. Adicione produtos primeiro.');
            return;
        }
        fecharCarrinho();
        const { total } = calcularTotal();
        DOM.checkoutTotal.textContent = formatarPreco(total);
        DOM.modalCheckout.classList.add('modal--ativo');
        DOM.formCheckout.reset();
        // Reseta etapas
        DOM.formCheckout.style.display = 'block';
        DOM.checkoutSucesso.style.display = 'none';
        $$('[data-etapa-form]').forEach(el => el.classList.remove('form-checkout__etapa--ativa'));
        $('[data-etapa-form="1"]').classList.add('form-checkout__etapa--ativa');
        $$('[data-etapa]').forEach(el => el.classList.remove('checkout-etapas__item--ativo'));
        $('[data-etapa="1"]').classList.add('checkout-etapas__item--ativo');
    };

    const processarCheckout = (e) => {
        e.preventDefault();
        DOM.formCheckout.style.display = 'none';
        DOM.checkoutSucesso.style.display = 'block';
        $$('[data-etapa]').forEach(el => el.classList.remove('checkout-etapas__item--ativo'));
        $('[data-etapa="3"]').classList.add('checkout-etapas__item--ativo');
        // Limpa carrinho após compra simulada
        estado.carrinho = [];
        estado.cupomAplicado = false;
        estado.descontoAtual = 0;
        atualizarCarrinho();
        persistirEstado();
        mostrarToast('Pedido realizado com sucesso! (Simulação)');
    };

    /* ======================================================================
       CARROSSEL HERO
       ====================================================================== */
    let slideAtual = 0;
    const totalSlides = DOM.carrosselSlides.length;
    let carrosselInterval;

    const atualizarCarrossel = (index) => {
        DOM.carrosselSlides.forEach((slide, i) => {
            slide.classList.toggle('hero__slide--ativo', i === index);
        });
        DOM.carrosselIndicadores.querySelectorAll('button').forEach((btn, i) => {
            btn.classList.toggle('hero__indicador--ativo', i === index);
        });
    };

    const proximoSlide = () => {
        slideAtual = (slideAtual + 1) % totalSlides;
        atualizarCarrossel(slideAtual);
    };

    const slideAnterior = () => {
        slideAtual = (slideAtual - 1 + totalSlides) % totalSlides;
        atualizarCarrossel(slideAtual);
    };

    const iniciarCarrossel = () => {
        // Cria indicadores
        DOM.carrosselIndicadores.innerHTML = '';
        DOM.carrosselSlides.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.className = `hero__indicador ${i === 0 ? 'hero__indicador--ativo' : ''}`;
            btn.addEventListener('click', () => { slideAtual = i; atualizarCarrossel(i); reiniciarIntervalo(); });
            DOM.carrosselIndicadores.appendChild(btn);
        });
        atualizarCarrossel(0);
        carrosselInterval = setInterval(proximoSlide, 5000);
    };

    const reiniciarIntervalo = () => {
        clearInterval(carrosselInterval);
        carrosselInterval = setInterval(proximoSlide, 5000);
    };

    /* ======================================================================
       MODAL DE VISUALIZAÇÃO RÁPIDA
       ====================================================================== */
    const abrirModalProduto = (idProduto) => {
        const produto = produtos.find(p => p.id === idProduto);
        if (!produto) return;
        DOM.modalConteudo.innerHTML = `
            <div style="background:var(--cor-fundo-alt); border-radius:12px; height:300px; display:flex; align-items:center; justify-content:center;">
                LUGAR DA IMAGEM — ${produto.nome}
            </div>
            <div>
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <p style="font-size:1.3rem; font-weight:700;">${formatarPreco(produto.preco)}</p>
                <button class="btn btn--primario" data-add-carrinho="${produto.id}" style="margin-top:12px;">Adicionar ao Carrinho</button>
            </div>
        `;
        DOM.modalProduto.classList.add('modal--ativo');
    };

    const fecharModais = () => {
        DOM.modalProduto.classList.remove('modal--ativo');
        DOM.modalCheckout.classList.remove('modal--ativo');
        DOM.modalWishlist.classList.remove('modal--ativo');
    };

    /* ======================================================================
       DELEGAÇÃO DE EVENTOS (EVENT DELEGATION — PADRÃO SÊNIOR)
       Centraliza listeners para performance e código limpo.
       ====================================================================== */
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Adicionar ao carrinho via card ou modal
        const btnAdd = target.closest('[data-add-carrinho]');
        if (btnAdd) {
            const id = parseInt(btnAdd.getAttribute('data-add-carrinho'));
            const qtdSpan = document.querySelector(`[data-qtd-valor="${id}"]`);
            const quantidade = qtdSpan ? parseInt(qtdSpan.textContent) : 1;
            adicionarAoCarrinho(id, quantidade);
            return;
        }

        // Botões de quantidade no card
        const btnQtdMenos = target.closest('[data-qtd-menos]');
        if (btnQtdMenos) {
            const id = parseInt(btnQtdMenos.getAttribute('data-qtd-menos'));
            const span = document.querySelector(`[data-qtd-valor="${id}"]`);
            if (span) { let v = parseInt(span.textContent); if (v > 1) span.textContent = v - 1; }
            return;
        }
        const btnQtdMais = target.closest('[data-qtd-mais]');
        if (btnQtdMais) {
            const id = parseInt(btnQtdMais.getAttribute('data-qtd-mais'));
            const span = document.querySelector(`[data-qtd-valor="${id}"]`);
            if (span) span.textContent = parseInt(span.textContent) + 1;
            return;
        }

        // Wishlist toggle
        const btnWishlist = target.closest('[data-wishlist-btn]');
        if (btnWishlist) {
            const id = parseInt(btnWishlist.getAttribute('data-wishlist-btn'));
            alternarWishlist(id);
            return;
        }

        // Abrir modal de visualização rápida
        const abrirModal = target.closest('[data-abrir-modal]');
        if (abrirModal) {
            const id = parseInt(abrirModal.getAttribute('data-abrir-modal'));
            abrirModalProduto(id);
            return;
        }

        // Carrinho: botões de quantidade e remover (dentro do carrinho)
        const carrinhoMenos = target.closest('[data-carrinho-menos]');
        if (carrinhoMenos) {
            alterarQuantidade(parseInt(carrinhoMenos.getAttribute('data-carrinho-menos')), -1);
            return;
        }
        const carrinhoMais = target.closest('[data-carrinho-mais]');
        if (carrinhoMais) {
            alterarQuantidade(parseInt(carrinhoMais.getAttribute('data-carrinho-mais')), 1);
            return;
        }
        const carrinhoRemover = target.closest('[data-carrinho-remover]');
        if (carrinhoRemover) {
            removerDoCarrinho(parseInt(carrinhoRemover.getAttribute('data-carrinho-remover')));
            return;
        }

        // Filtro de categoria
        const filtroBtn = target.closest('[data-filtro-categoria]');
        if (filtroBtn) {
            estado.filtroCategoria = filtroBtn.getAttribute('data-filtro-categoria');
            estado.paginaAtual = 1;
            $$('[data-filtro-categoria]').forEach(b => b.classList.remove('categorias-filtro__btn--ativo'));
            filtroBtn.classList.add('categorias-filtro__btn--ativo');
            renderizarProdutos();
            return;
        }

        // Próxima etapa do checkout
        const proximaEtapa = target.closest('[data-proxima-etapa]');
        if (proximaEtapa) {
            const etapa = proximaEtapa.getAttribute('data-proxima-etapa');
            $$('[data-etapa-form]').forEach(el => el.classList.remove('form-checkout__etapa--ativa'));
            $(`[data-etapa-form="${etapa}"]`).classList.add('form-checkout__etapa--ativa');
            $$('[data-etapa]').forEach(el => el.classList.remove('checkout-etapas__item--ativo'));
            $(`[data-etapa="${etapa}"]`).classList.add('checkout-etapas__item--ativo');
            return;
        }
    });

    /* ======================================================================
       EVENT LISTENERS DIRETOS (PARA ELEMENTOS ESPECÍFICOS)
       ====================================================================== */
    // Toggle carrinho
    DOM.carrinhoToggle.addEventListener('click', abrirCarrinho);
    DOM.carrinhoFechar.addEventListener('click', fecharCarrinho);
    DOM.overlay.addEventListener('click', fecharCarrinho);
    DOM.btnLimparCarrinho.addEventListener('click', () => { if (confirm('Limpar carrinho?')) limparCarrinho(); });
    DOM.btnCheckout.addEventListener('click', abrirCheckout);
    DOM.checkoutFechar.addEventListener('click', fecharModais);
    DOM.btnNovaCompra.addEventListener('click', () => { DOM.modalCheckout.classList.remove('modal--ativo'); });
    DOM.formCheckout.addEventListener('submit', processarCheckout);
    DOM.cupomAplicar.addEventListener('click', aplicarCupom);

    // Wishlist modal
    DOM.wishlistToggle.addEventListener('click', () => {
        renderizarWishlist();
        DOM.modalWishlist.classList.add('modal--ativo');
    });
    DOM.wishlistFechar.addEventListener('click', () => DOM.modalWishlist.classList.remove('modal--ativo'));

    // Fechar modais ao clicar no overlay
    [DOM.modalProduto, DOM.modalCheckout, DOM.modalWishlist].forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('modal--ativo'); });
    });
    DOM.modalFechar.addEventListener('click', () => DOM.modalProduto.classList.remove('modal--ativo'));

    // Busca com debounce
    DOM.buscaInput.addEventListener('input', debounce(() => {
        estado.busca = DOM.buscaInput.value;
        estado.paginaAtual = 1;
        renderizarProdutos();
    }, 350));
    DOM.buscaForm.addEventListener('submit', e => e.preventDefault());

    // Limpar busca
    document.querySelector('[data-limpar-busca]')?.addEventListener('click', () => {
        DOM.buscaInput.value = '';
        estado.busca = '';
        estado.paginaAtual = 1;
        renderizarProdutos();
    });

    // Select de ordenação
    DOM.selectTrigger.addEventListener('click', () => {
        DOM.selectOpcoes.classList.toggle('select-custom__opcoes--aberto');
    });
    DOM.selectOpcoes.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const valor = e.target.getAttribute('data-valor');
            estado.ordenacao = valor;
            estado.paginaAtual = 1;
            DOM.selectTexto.textContent = 'Ordenar: ' + e.target.textContent;
            DOM.selectOpcoes.classList.remove('select-custom__opcoes--aberto');
            // Atualiza selecionado
            $$('[data-select-opcoes] li').forEach(li => li.classList.remove('select-custom__opcao--selecionada'));
            e.target.classList.add('select-custom__opcao--selecionada');
            renderizarProdutos();
        }
    });
    // Fecha select ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-select]')) DOM.selectOpcoes.classList.remove('select-custom__opcoes--aberto');
    });

    // Paginação
    DOM.btnPaginaAnterior.addEventListener('click', () => {
        if (estado.paginaAtual > 1) { estado.paginaAtual--; renderizarProdutos(); }
    });
    DOM.btnPaginaProxima.addEventListener('click', () => {
        const total = Math.ceil(filtrarProdutos().length / CONFIG.ITENS_POR_PAGINA);
        if (estado.paginaAtual < total) { estado.paginaAtual++; renderizarProdutos(); }
    });

    // Carrossel
    document.querySelector('[data-carrossel-anterior]').addEventListener('click', () => { slideAnterior(); reiniciarIntervalo(); });
    document.querySelector('[data-carrossel-proxima]').addEventListener('click', () => { proximoSlide(); reiniciarIntervalo(); });

    // Navegação entre seções
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const secaoId = link.getAttribute('data-nav-link');
            DOM.navLinks.forEach(l => l.classList.remove('navegacao__link--ativo'));
            link.classList.add('navegacao__link--ativo');
            const secao = document.getElementById(secaoId);
            if (secao) secao.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Menu mobile
    DOM.hamburger.addEventListener('click', () => {
        DOM.navegacao.classList.toggle('navegacao--aberto');
        const expanded = DOM.hamburger.getAttribute('aria-expanded') === 'true';
        DOM.hamburger.setAttribute('aria-expanded', !expanded);
    });

    // Header: esconde top-bar ao scrollar para baixo
    let ultimoScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollAtual = window.scrollY;
        const topBar = document.querySelector('.top-bar');
        const header = document.querySelector('.header');
        if (scrollAtual > ultimoScroll && scrollAtual > 60) {
            topBar?.classList.add('top-bar--oculta');
            header?.classList.add('header--topo');
        } else {
            topBar?.classList.remove('top-bar--oculta');
            header?.classList.remove('header--topo');
        }
        header?.classList.toggle('header--sombra', scrollAtual > 10);
        ultimoScroll = scrollAtual;
    });

    // Máscara de cartão simples (simulação)
    const mascaraCartao = (input) => {
        input.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '').slice(0, 16);
            valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = valor;
        });
    };
    const mascaraValidade = (input) => {
        input.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '').slice(0, 4);
            if (valor.length > 2) valor = valor.slice(0,2) + '/' + valor.slice(2);
            e.target.value = valor;
        });
    };
    const cartaoInput = document.querySelector('[data-mask-cartao]');
    const validadeInput = document.querySelector('[data-mask-validade]');
    if (cartaoInput) mascaraCartao(cartaoInput);
    if (validadeInput) mascaraValidade(validadeInput);

    // Newsletter (apenas simula, não envia dados)
    document.querySelector('[data-newsletter-form]')?.addEventListener('submit', (e) => {
        e.preventDefault();
        mostrarToast('Inscrição simulada com sucesso!');
        e.target.reset();
    });

    // Formulário de contato (simulação)
    document.querySelector('[data-form-contato]')?.addEventListener('submit', (e) => {
        e.preventDefault();
        mostrarToast('Mensagem enviada com sucesso! (Simulação)');
        e.target.reset();
    });

    // CTA "Explorar Coleção" nos banners
    $$('[data-cta-explorar]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ======================================================================
       INICIALIZAÇÃO
       ====================================================================== */
    const init = () => {
        carregarEstado();
        iniciarCarrossel();
        renderizarProdutos();
        atualizarCarrinho();
        DOM.wishlistContador.textContent = estado.wishlist.length;
        // Atualiza dropdown de ordenação com texto inicial
        DOM.selectTexto.textContent = 'Ordenar: Relevância';
    };

    init();
})();