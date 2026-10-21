'use strict';

const books = window.LUME_BOOKS;
const main = document.querySelector('#conteudo');
const filterDialog = document.querySelector('#filter-dialog');
const reviewDialog = document.querySelector('#review-dialog');
const storageKey = 'lume-livraria-v1';
const genres = ['Romance', 'Fantasia', 'Suspense', 'Ficção', 'Clássicos'];
const genreIcons = ['heart', 'sparkles', 'moon', 'book', 'more'];
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const icon = name => `<svg aria-hidden="true"><use href="imagens/icons.svg#${name}"></use></svg>`;
const getBook = id => books.find(book => book.id === id);
const defaultState = { cart: [], favorites: [], orders: [], reading: [], reviews: [], profile: { name: 'Ana', email: '' }, goal: 24, address: {}, payment: 'Pix', coupon: '' };
let state = loadState();
let toastTimer;
let reviewBookId;
let currentStep = 1;
let filters = { genres: [], price: 200, rating: false, format: 'Todos' };
let sort = 'featured';
let storageAvailable = true;

function loadState(){
    try{
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if(!saved || typeof saved !== 'object') return structuredClone(defaultState);
        const restored = { ...structuredClone(defaultState), ...saved };
        restored.cart = Array.isArray(saved.cart) ? saved.cart.filter(item => item && getBook(item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99) : [];
        restored.favorites = Array.isArray(saved.favorites) ? [...new Set(saved.favorites.filter(id => getBook(id)))] : [];
        restored.orders = Array.isArray(saved.orders) ? saved.orders.filter(order => order && Array.isArray(order.items) && order.items.every(item => item && getBook(item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99) && Number.isFinite(order.total) && Number.isFinite(order.subtotal) && Number.isFinite(order.shipping) && Number.isFinite(order.discount) && !Number.isNaN(Date.parse(order.date))) : [];
        restored.reading = Array.isArray(saved.reading) ? saved.reading.filter(item => item && getBook(item.id) && Number.isInteger(item.page) && item.page >= 0 && item.page <= getBook(item.id).pages) : [];
        restored.reviews = Array.isArray(saved.reviews) ? saved.reviews.filter(review => review && getBook(review.bookId) && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 && typeof review.comment === 'string') : [];
        restored.profile = { name: typeof saved.profile?.name === 'string' ? saved.profile.name.slice(0, 60) : 'Ana', email: typeof saved.profile?.email === 'string' ? saved.profile.email.slice(0, 120) : '' };
        restored.address = saved.address && typeof saved.address === 'object' && !Array.isArray(saved.address) ? saved.address : {};
        restored.payment = ['Pix', 'Cartão de crédito', 'Boleto bancário'].includes(saved.payment) ? saved.payment : 'Pix';
        restored.goal = Number.isInteger(saved.goal) && saved.goal >= 1 && saved.goal <= 365 ? saved.goal : 24;
        restored.coupon = ['BEMVINDO', 'LIVRO10'].includes(saved.coupon) ? saved.coupon : '';
        return restored;
    }catch{
        return structuredClone(defaultState);
    }
}

function saveState(){
    try{
        localStorage.setItem(storageKey, JSON.stringify(state));
    }catch{
        storageAvailable = false;
    }
    updateShell();
}

function toast(message){
    const element = document.querySelector('#toast');
    element.textContent = message;
    element.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove('visible'), 3300);
}

function getRoute(){
    const hash = location.hash.slice(1) || 'inicio';
    const [path, query = ''] = hash.split('?');
    return { path, parts: path.split('/'), params: new URLSearchParams(query) };
}

function navigate(hash){
    if(location.hash === '#' + hash){
        render();
    }else{
        location.hash = hash;
    }
}

function updateShell(){
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.querySelector('#cart-count');
    badge.textContent = count;
    badge.hidden = !count;
    document.querySelector('.mobile-cart-dot').hidden = !count;
    document.querySelector('.avatar-small').textContent = state.profile.name.charAt(0).toUpperCase() || 'L';
    const route = getRoute().parts[0];
    const profileRoutes = ['perfil', 'pedidos', 'cupons', 'suporte', 'notificacoes', 'leitura', 'enderecos', 'configuracoes'];
    document.querySelectorAll('[data-nav]').forEach(link => {
        const selected = link.dataset.nav === route || link.dataset.nav === 'catalogo' && route === 'livro';
        if(selected) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-mobile-nav]').forEach(link => {
        const selected = link.dataset.mobileNav === route || link.dataset.mobileNav === 'perfil' && profileRoutes.includes(route) || link.dataset.mobileNav === 'catalogo' && route === 'livro' || link.dataset.mobileNav === 'carrinho' && ['checkout', 'confirmado'].includes(route);
        if(selected) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function pageHeading(title, subtitle = '', action = ''){
    return `<header class="page-heading"><div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ''}</div>${action}</header>`;
}

function searchForm(query = ''){
    return `<form class="search-form" data-form="search" role="search"><label class="visually-hidden" for="book-search">Buscar por título, autor ou gênero</label>${icon('search')}<input type="search" id="book-search" name="q" placeholder="Buscar livros, autores, gêneros..." value="${escapeHtml(query)}" maxlength="100" autocomplete="off"><button type="submit" aria-label="Buscar">${icon('arrow')}</button></form>`;
}

function favoriteButton(book, extra = ''){
    const selected = state.favorites.includes(book.id);
    return `<button class="icon-button ${extra}" type="button" data-action="favorite" data-id="${book.id}" aria-pressed="${selected}" aria-label="${selected ? 'Remover' : 'Adicionar'} ${escapeHtml(book.title)} ${selected ? 'dos' : 'aos'} favoritos">${icon('heart')}</button>`;
}

function rating(book){
    return `<span class="book-rating" title="Nota ilustrativa da referência, não uma avaliação verificada" aria-label="Nota ilustrativa: ${book.rating}">${icon('star')}${book.rating.toFixed(1)}</span>`;
}

function bookCard(book){
    return `<li><article class="book-card">${favoriteButton(book, 'favorite-button')}<a class="book-image-link" href="#livro/${book.id}" aria-label="Ver ${escapeHtml(book.title)}"><img src="imagens/${book.id}.webp" alt="Capa de ${escapeHtml(book.title)}, de ${escapeHtml(book.author)}" width="160" height="220" loading="lazy"></a><h3><a href="#livro/${book.id}">${book.title}</a></h3><p class="book-author">${book.author}</p><div class="book-price-row"><span class="book-price">${money(book.price)}</span>${rating(book)}</div><button class="quick-add" type="button" data-action="add" data-id="${book.id}">${book.available === false ? 'Indisponível na fonte' : 'Adicionar ao carrinho'}</button></article></li>`;
}

function bookGrid(items, extra = ''){
    return `<ul class="book-grid ${extra}">${items.map(bookCard).join('')}</ul>`;
}

function priceCaption(){
    return `<p class="price-caption">Preços de referência pesquisados em 16/10/2026. <a href="#fontes">Consultar fontes e edições.</a></p>`;
}

function emptyState(title, message, symbol = 'book', button = 'Explorar livros', route = 'catalogo'){
    return `<section class="empty-state">${icon(symbol)}<h2>${title}</h2><p>${message}</p><a class="button button-primary" href="#${route}">${button}${icon('arrow')}</a></section>`;
}

function homeView(){
    return `<div class="welcome-row"><div class="welcome-copy"><p>Olá, ${escapeHtml(state.profile.name.split(' ')[0])}!</p><p>O que você quer ler hoje?</p></div>${searchForm()}</div>
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><span class="eyebrow">${icon('sparkles')} Seu próximo capítulo</span><h1 id="hero-title">Livros que te acompanham em <em>todas as histórias.</em></h1><p>O lugar perfeito para encontrar seus próximos livros favoritos.</p><a class="button button-primary" href="#catalogo">Encontre sua próxima leitura${icon('arrow')}</a></div><figure class="hero-art"><img src="imagens/livros-ilustracao-v2-960.webp" srcset="imagens/livros-ilustracao-v2-480.webp 480w, imagens/livros-ilustracao-v2-960.webp 960w, imagens/livros-ilustracao-v2.webp 1162w" sizes="(max-width: 640px) 42vw, 320px" alt="Ilustração delicada de uma pilha de livros e ramos de flores" width="1162" height="1353" fetchpriority="high"><figcaption class="hero-note">Só mais um capítulo...</figcaption></figure></section>
    <section class="genre-section" aria-label="Explore por gênero"><p>Qual história<br>combina com você?</p><ul class="genre-list">${genres.map((genre, index) => `<li><a href="#catalogo?genero=${encodeURIComponent(genre)}"><span class="genre-icon">${icon(genreIcons[index])}</span>${genre}</a></li>`).join('')}</ul></section>
    <section aria-labelledby="featured-title"><header class="section-heading"><div><h2 id="featured-title">Histórias em destaque</h2><p>Seu próximo livro favorito pode estar aqui.</p></div><a class="text-link" href="#catalogo">Ver todos${icon('chevron')}</a></header>${bookGrid(books.slice(0, 5), 'home-book-grid')}${priceCaption()}</section>
    <aside class="editorial-banner" aria-label="Cupons de desconto">${icon('ticket')}<div><span class="eyebrow">Uma boa história, um bom começo</span><h2>Tem um presente para você.</h2><p>Conheça os cupons da Lume e simule sua próxima compra.</p></div><a class="button button-ghost" href="#cupons">Descobrir meus cupons${icon('arrow')}</a></aside>
    <section class="reading-picks" aria-labelledby="picks-title"><header class="section-heading"><div><span class="eyebrow">Para se perder nas páginas</span><h2 id="picks-title">Uma estante de possibilidades</h2></div><a class="text-link" href="#catalogo">Explorar${icon('chevron')}</a></header>${bookGrid(books.slice(5), 'home-book-grid')}</section>
    <ul class="service-strip" aria-label="Serviços da Lume"><li>${icon('truck')}<p>Frete grátis<span>Nas simulações a partir de R$ 99</span></p></li><li>${icon('heart')}<p>Sua lista de desejos<span>Guarde os livros para depois</span></p></li><li>${icon('book')}<p>Uma página por vez<span>Acompanhe sua leitura</span></p></li></ul>`;
}

function catalogView(params){
    const query = (params.get('q') || '').slice(0, 100);
    const genre = params.get('genero') || '';
    let items = books.filter(book => {
        const matchesQuery = !query || normalize(`${book.title} ${book.author} ${book.genres.join(' ')}`).includes(normalize(query));
        const matchesGenre = !genre || book.genres.includes(genre);
        const matchesFilters = (!filters.genres.length || filters.genres.some(value => book.genres.includes(value))) && book.price <= filters.price * 100 && (!filters.rating || book.rating >= 4.8) && (filters.format === 'Todos' || filters.format === 'Físico');
        return matchesQuery && matchesGenre && matchesFilters;
    });
    if(sort === 'price-asc') items.sort((a, b) => a.price - b.price);
    if(sort === 'price-desc') items.sort((a, b) => b.price - a.price);
    if(sort === 'title') items.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    const filterCount = filters.genres.length + Number(filters.price < 200) + Number(filters.rating) + Number(filters.format !== 'Todos');
    return `${pageHeading(query ? `Resultados para “${escapeHtml(query)}”` : 'Sua próxima história', 'Explore livros para todos os seus momentos.')}
    <div class="catalog-toolbar">${searchForm(query)}<button class="button button-ghost filter-button" type="button" data-action="filters" aria-haspopup="dialog">${icon('filter')}<span>Filtros${filterCount ? ` (${filterCount})` : ''}</span></button><label class="sort-label" for="book-sort">Ordenar por <select id="book-sort" data-action="sort"><option value="featured" ${sort === 'featured' ? 'selected' : ''}>Destaques</option><option value="price-asc" ${sort === 'price-asc' ? 'selected' : ''}>Menor preço</option><option value="price-desc" ${sort === 'price-desc' ? 'selected' : ''}>Maior preço</option><option value="title" ${sort === 'title' ? 'selected' : ''}>Título A–Z</option></select></label></div>
    <nav class="chip-row" aria-label="Filtrar catálogo por gênero"><a class="chip ${!genre ? 'active' : ''}" href="#catalogo${query ? '?q=' + encodeURIComponent(query) : ''}" ${!genre ? 'aria-current="true"' : ''}>Todos</a>${genres.map(value => `<a class="chip ${genre === value ? 'active' : ''}" href="#catalogo?genero=${encodeURIComponent(value)}${query ? '&q=' + encodeURIComponent(query) : ''}" ${genre === value ? 'aria-current="true"' : ''}>${value}</a>`).join('')}</nav>
    <p class="results-count">${items.length} ${items.length === 1 ? 'livro encontrado' : 'livros encontrados'}${filters.format !== 'Todos' && filters.format !== 'Físico' ? ' · Este catálogo utiliza edições físicas.' : ''}</p>
    ${items.length ? bookGrid(items, 'catalog-grid') : emptyState('Nenhum livro por aqui', 'Tente outro título, autor ou limpe os filtros para encontrar uma nova história.', 'search', 'Limpar busca e filtros', 'catalogo?limpar=1')}${priceCaption()}`;
}

function productView(id){
    const book = getBook(id);
    if(!book) return notFoundView();
    const savedReviews = state.reviews.filter(review => review.bookId === id);
    return `<nav class="breadcrumb" aria-label="Caminho da página"><a href="#inicio">Início</a>${icon('chevron')}<a href="#catalogo">Livros</a>${icon('chevron')}<span>${escapeHtml(book.title)}</span></nav>
    <article class="product-layout"><div class="product-visual"><img src="imagens/${id}.webp" alt="Capa de ${escapeHtml(book.title)}" width="265" height="380">${favoriteButton(book, 'favorite-button')}</div><div class="product-information"><span class="eyebrow">Uma história para sua estante</span><h1>${book.title}</h1><p class="product-author">${book.author}</p>${rating(book)}<div class="chip-row">${book.genres.map(value => `<a class="tag" href="#catalogo?genero=${encodeURIComponent(value)}">${value}</a>`).join('')}</div><p class="product-price">${money(book.price)}</p><p class="source-note">Preço de referência · <a href="${book.source}" target="_blank" rel="noopener noreferrer">${book.sourceName}</a> · 16/10/2026</p><p class="source-note">${book.edition}${book.available === false ? ' · Esgotado na fonte consultada' : ''}</p><div class="product-buttons"><button class="button button-primary" type="button" data-action="add" data-id="${id}">${icon('bag')}${book.available === false ? 'Indisponível na fonte' : 'Adicionar ao carrinho'}</button><button class="button button-secondary" type="button" data-action="buy" data-id="${id}" ${book.available === false ? 'disabled' : ''}>Comprar agora${icon('arrow')}</button></div><a class="text-link" href="#leitura" data-action="start-reading" data-id="${id}">${icon('book')}Adicionar à minha leitura</a><section class="description"><h2>Sobre esta história</h2><p>${book.description}</p></section><dl class="book-details"><div><dt>Editora</dt><dd>${book.publisher}</dd></div><div><dt>Páginas</dt><dd>${book.pages}</dd></div><div><dt>Formato</dt><dd>${book.edition}</dd></div><div><dt>ISBN</dt><dd>${book.isbn}</dd></div></dl></div></article>
    <section class="reviews-section"><header class="section-heading"><div><h2>Entre leitores</h2><p>Suas impressões ficam salvas neste navegador.</p></div><button class="button button-ghost" type="button" data-action="review" data-id="${id}">Avaliar livro</button></header>${savedReviews.length ? savedReviews.map(review => `<article class="review-card"><span class="stars" aria-label="${review.rating} de 5 estrelas">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span><p>${escapeHtml(review.comment)}</p><small>Sua avaliação · ${escapeHtml(state.profile.name)}</small></article>`).join('') : '<p>Termine a leitura e conte o que achou. Toda história merece uma boa conversa.</p>'}</section>`;
}

function cartTotals(){
    const subtotal = state.cart.reduce((total, item) => total + getBook(item.id).price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 9900 ? 0 : 1290;
    const discount = state.coupon ? Math.round(subtotal * .1) : 0;
    return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}

function orderSummary(checkout = false){
    const totals = cartTotals();
    return `<aside class="panel order-summary" aria-label="Resumo dos valores"><h2>Resumo do pedido</h2><p class="free-shipping">${icon('truck')}${totals.shipping === 0 ? 'Sua história vai com frete grátis!' : `Faltam ${money(9900 - totals.subtotal)} para ganhar frete grátis.`}</p><p class="summary-row"><span>Subtotal</span><span>${money(totals.subtotal)}</span></p><p class="summary-row"><span>Frete simulado</span><span>${totals.shipping ? money(totals.shipping) : 'Grátis'}</span></p>${totals.discount ? `<p class="summary-row"><span>Cupom ${state.coupon}</span><span>− ${money(totals.discount)}</span></p>` : ''}<form class="coupon-form" data-form="coupon"><label class="visually-hidden" for="coupon-code">Código do cupom</label><input id="coupon-code" name="coupon" placeholder="Seu cupom de desconto" value="${state.coupon}" maxlength="20" required><button class="button button-secondary" type="submit">Aplicar</button></form><p class="summary-row total"><strong>Total</strong><strong>${money(totals.total)}</strong></p>${checkout ? '' : '<a class="button button-primary full-width" href="#checkout">Finalizar compra</a>'}<p class="secure-note">${icon('shield')}Compra demonstrativa · sem cobrança</p></aside>`;
}

function cartView(){
    return `${pageHeading('Seu carrinho', state.cart.length ? 'Boas histórias estão esperando por você.' : 'Um espaço para suas próximas leituras.', state.cart.length ? '<button class="text-link" type="button" data-action="clear-cart">Limpar carrinho</button>' : '')}${!state.cart.length ? emptyState('Sua próxima história espera por você', 'Explore o catálogo e adicione os livros que você quer levar para casa.', 'bag') : `<div class="two-column"><section class="panel" aria-label="Livros no carrinho"><ul class="cart-list">${state.cart.map(item => { const book = getBook(item.id); return `<li class="cart-item"><a href="#livro/${item.id}"><img src="imagens/${item.id}.webp" alt="Capa de ${escapeHtml(book.title)}" width="68" height="98"></a><div><h2><a href="#livro/${item.id}">${book.title}</a></h2><p class="book-author">${book.author}</p><p class="book-price">${money(book.price)}</p><div class="quantity-control" aria-label="Quantidade de ${escapeHtml(book.title)}"><button type="button" data-action="quantity" data-id="${item.id}" data-delta="-1" aria-label="Diminuir quantidade de ${escapeHtml(book.title)}">−</button><span aria-live="polite">${item.quantity}</span><button type="button" data-action="quantity" data-id="${item.id}" data-delta="1" aria-label="Aumentar quantidade de ${escapeHtml(book.title)}" ${item.quantity >= 99 ? 'disabled' : ''}>+</button></div></div><div class="cart-item-actions">${favoriteButton(book)}<button class="icon-button" type="button" data-action="remove" data-id="${item.id}" aria-label="Remover ${escapeHtml(book.title)} do carrinho">${icon('trash')}</button><strong class="book-price">${money(book.price * item.quantity)}</strong></div></li>`; }).join('')}</ul></section>${orderSummary()}</div>`}`;
}

function checkoutView(){
    if(!state.cart.length) return `${pageHeading('Checkout')}${emptyState('Seu carrinho está vazio', 'Adicione uma história ao carrinho antes de continuar.', 'bag')}`;
    const a = state.address;
    const addressFields = `<section class="panel"><h2>Endereço de entrega</h2><p class="field-hint">Use dados de exemplo. Nada será enviado.</p><form data-form="address"><div class="form-grid"><div class="span-two"><label for="address-name">Nome de quem recebe</label><input id="address-name" name="name" autocomplete="name" value="${escapeHtml(a.name || state.profile.name)}" required maxlength="80"></div><div><label for="address-zip">CEP</label><input id="address-zip" name="zip" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" pattern="[0-9]{5}-?[0-9]{3}" value="${escapeHtml(a.zip || '')}" required maxlength="9"></div><div><label for="address-number">Número</label><input id="address-number" name="number" autocomplete="off" value="${escapeHtml(a.number || '')}" required maxlength="12"></div><div class="span-two"><label for="address-street">Rua ou avenida</label><input id="address-street" name="street" autocomplete="address-line1" value="${escapeHtml(a.street || '')}" required maxlength="120"></div><div><label for="address-city">Cidade</label><input id="address-city" name="city" autocomplete="address-level2" value="${escapeHtml(a.city || '')}" required maxlength="60"></div><div><label for="address-state">Estado (UF)</label><input id="address-state" name="region" autocomplete="address-level1" placeholder="RS" pattern="[A-Za-z]{2}" value="${escapeHtml(a.region || '')}" required maxlength="2"></div></div><div class="form-actions"><a class="button button-ghost" href="#carrinho">Voltar</a><button class="button button-primary" type="submit">Continuar${icon('arrow')}</button></div></form></section>`;
    const payments = `<section class="panel"><h2>Forma de pagamento</h2><form data-form="payment"><fieldset class="payment-options"><legend class="visually-hidden">Escolha a forma de pagamento da simulação</legend>${[['Pix', 'sparkles', 'Prático para o seu dia a dia'], ['Cartão de crédito', 'card', 'Sem informar dados de cartão'], ['Boleto bancário', 'book', 'Nenhum boleto será emitido']].map(([name, symbol, text]) => `<label><input type="radio" name="payment" value="${name}" ${state.payment === name ? 'checked' : ''}>${icon(symbol)}<span>${name}<small>${text}</small></span></label>`).join('')}</fieldset><p class="field-hint">Não há integração com pagamentos neste protótipo.</p><div class="form-actions"><button class="button button-ghost" type="button" data-action="checkout-back">Voltar</button><button class="button button-primary" type="submit">Revisar pedido${icon('arrow')}</button></div></form></section>`;
    const review = `<section class="panel"><h2>Confira sua história</h2><ul class="review-items">${state.cart.map(item => { const book = getBook(item.id); return `<li class="cart-item"><img src="imagens/${item.id}.webp" alt="Capa de ${escapeHtml(book.title)}" width="48" height="70"><div><h2>${book.title}</h2><p class="book-author">Quantidade: ${item.quantity}</p></div><span class="book-price">${money(book.price * item.quantity)}</span></li>`; }).join('')}</ul><section class="address-summary"><h3>Endereço de entrega</h3><p>${escapeHtml(a.name)}<br>${escapeHtml(a.street)}, ${escapeHtml(a.number)}<br>${escapeHtml(a.city)} · ${escapeHtml(a.region)} · CEP ${escapeHtml(a.zip)}</p></section><p class="summary-row"><span>Forma de pagamento</span><strong>${escapeHtml(state.payment)}</strong></p><div class="form-actions"><button class="button button-ghost" type="button" data-action="checkout-back">Voltar</button><button class="button button-primary" type="button" data-action="confirm-order">Confirmar simulação${icon('check')}</button></div></section>`;
    return `${pageHeading('Quase na sua estante', 'Só mais alguns passos para finalizar.')}
    <ol class="steps" aria-label="Etapas do checkout">${['Endereço', 'Pagamento', 'Revisão'].map((name, index) => `<li class="${currentStep >= index + 1 ? 'active' : ''}" ${currentStep === index + 1 ? 'aria-current="step"' : ''}><span>${index + 1}</span>${name}</li>`).join('')}</ol><p class="demo-notice">Esta é uma simulação: nenhum pagamento, compra ou envio será realizado.</p><div class="two-column">${currentStep === 1 ? addressFields : currentStep === 2 ? payments : review}${orderSummary(true)}</div>`;
}

function confirmOrder(){
    if(!state.cart.length || currentStep !== 3) return;
    const totals = cartTotals();
    const order = { id: 'LM' + Date.now().toString().slice(-8), date: new Date().toISOString(), items: structuredClone(state.cart), ...totals, payment: state.payment };
    state.orders.unshift(order);
    state.cart = [];
    state.coupon = '';
    currentStep = 1;
    saveState();
    navigate('confirmado/' + order.id);
}

function confirmationView(id){
    const order = state.orders.find(item => item.id === id);
    if(!order) return notFoundView();
    return `<section class="confirmation"><div class="confirmation-mark">${icon('check')}</div><span class="eyebrow">Um novo capítulo começa</span><h1>Pedido confirmado!</h1><p>Sua simulação <strong>#${escapeHtml(order.id)}</strong> foi concluída.<br>Seus livros ficaram salvos em “Meus pedidos”.</p><p class="field-hint">Pedido demonstrativo. Não haverá cobrança, envio de e-mail ou entrega.</p><a class="button button-primary full-width" href="#pedidos">Ver meus pedidos${icon('arrow')}</a><a class="text-link" href="#inicio">Voltar para a home</a><img src="imagens/livros-ilustracao-v2-960.webp" srcset="imagens/livros-ilustracao-v2-480.webp 480w, imagens/livros-ilustracao-v2-960.webp 960w, imagens/livros-ilustracao-v2.webp 1162w" sizes="220px" alt="Pilha de livros com flores" width="1162" height="1353"></section>`;
}

function favoritesView(){
    const items = state.favorites.map(getBook);
    return `${pageHeading('Minha lista de desejos', 'Salve os livros que você quer ler depois.', `<span class="tag">${items.length} ${items.length === 1 ? 'livro' : 'livros'}</span>`)}${items.length ? bookGrid(items) : emptyState('Guarde uma história para depois', 'Toque no coração de um livro para criar sua lista de favoritos.', 'heart')}`;
}

function profileMenu(){
    const links = [['bag', 'Meus pedidos', 'pedidos'], ['heart', 'Favoritos', 'favoritos'], ['book', 'Meu progresso', 'leitura'], ['pin', 'Endereços', 'enderecos'], ['ticket', 'Cupons e descontos', 'cupons'], ['bell', 'Notificações', 'notificacoes'], ['help', 'Ajuda e suporte', 'suporte'], ['settings', 'Configurações', 'configuracoes']];
    return `<aside class="panel"><header class="profile-card"><span class="avatar" aria-hidden="true">${escapeHtml(state.profile.name.charAt(0).toUpperCase())}</span><div><h2>${escapeHtml(state.profile.name)}</h2><p>${escapeHtml(state.profile.email || 'Seu cantinho na Lume')}</p></div></header><nav class="account-menu" aria-label="Minha conta">${links.map(([symbol, label, path]) => `<a href="#${path}">${icon(symbol)}${label}${icon('chevron')}</a>`).join('')}</nav></aside>`;
}

function profileView(settings = false){
    return `${pageHeading(settings ? 'Configurações' : 'Meu perfil', 'Cada leitor tem a sua própria história.')}<div class="account-layout">${profileMenu()}<div class="account-details"><section class="panel account-form"><h2>Sobre você</h2><p>Personalize sua experiência. Seus dados ficam apenas neste navegador.</p><form data-form="profile"><div class="form-grid"><div class="span-two"><label for="profile-name">Como podemos te chamar?</label><input id="profile-name" name="name" value="${escapeHtml(state.profile.name)}" maxlength="60" required autocomplete="given-name"></div><div class="span-two"><label for="profile-email">E-mail (opcional)</label><input type="email" id="profile-email" name="email" value="${escapeHtml(state.profile.email)}" maxlength="120" autocomplete="email"></div></div><button class="button button-primary" type="submit">Salvar alterações${icon('check')}</button></form></section><div class="stat-grid"><a href="#favoritos"><strong>${state.favorites.length}</strong>livros nos favoritos</a><a href="#pedidos"><strong>${state.orders.length}</strong>pedidos simulados</a></div>${settings ? '<section class="panel description"><h2>Dados do navegador</h2><p>Você pode apagar o perfil, as leituras e as simulações salvas aqui.</p><button class="button button-ghost" type="button" data-action="reset-data">Apagar dados locais</button><p class="field-hint">A exclusão pode ser desfeita enquanto a mensagem de confirmação estiver visível.</p></section>' : ''}</div></div>`;
}

function addressView(){
    const a = state.address;
    return `${pageHeading('Meus endereços', 'Endereço utilizado nas suas simulações.')}${a.street ? `<section class="panel"><h2>Endereço salvo</h2><div class="address-summary"><p>${escapeHtml(a.name)}<br>${escapeHtml(a.street)}, ${escapeHtml(a.number)}<br>${escapeHtml(a.city)} · ${escapeHtml(a.region)}<br>CEP ${escapeHtml(a.zip)}</p></div><button class="button button-ghost" type="button" data-action="delete-address">Remover endereço</button><p class="field-hint">Você pode informar outro endereço durante o checkout.</p></section>` : emptyState('Uma casa para suas histórias', 'Você poderá cadastrar um endereço de exemplo ao simular uma compra.', 'pin')}`;
}

function ordersView(params){
    const filter = params.get('status') || 'todos';
    const orders = filter === 'entregues' ? [] : state.orders;
    return `${pageHeading('Meus pedidos', 'Todas as histórias que passaram por aqui.')}<nav class="chip-row" aria-label="Situação dos pedidos"><a class="chip ${filter === 'todos' ? 'active' : ''}" href="#pedidos">Todos</a><a class="chip ${filter === 'andamento' ? 'active' : ''}" href="#pedidos?status=andamento">Em andamento</a><a class="chip ${filter === 'entregues' ? 'active' : ''}" href="#pedidos?status=entregues">Entregues</a></nav>${orders.length ? orders.map(order => `<article class="panel order-card"><header><div><strong>#${escapeHtml(order.id)}</strong><time datetime="${escapeHtml(order.date)}">${new Date(order.date).toLocaleDateString('pt-BR')}</time></div><span class="tag">Simulação confirmada</span></header><ul class="order-books">${order.items.map(item => `<li><a href="#livro/${item.id}"><img src="imagens/${item.id}.webp" alt="${escapeHtml(getBook(item.id).title)} · ${item.quantity} exemplar(es)" width="45" height="65"></a></li>`).join('')}</ul><p class="field-hint">Pedido demonstrativo. Sem cobrança ou envio real.</p><footer><span>${escapeHtml(order.payment)}</span><strong>${money(order.total)}</strong></footer></article>`).join('') : emptyState(filter === 'entregues' ? 'Nenhuma entrega por aqui' : 'Sua estante está só começando', filter === 'entregues' ? 'Os pedidos deste protótipo são simulações e não geram entregas.' : 'Seus pedidos simulados aparecerão aqui depois de finalizar o carrinho.', 'bag')}`;
}

function notificationsView(params){
    const filter = params.get('tipo') || 'todas';
    const notices = [{ type: 'promocoes', symbol: 'ticket', title: 'Um presente para sua próxima leitura', text: 'Use BEMVINDO para simular 10% de desconto no catálogo.', route: 'cupons', date: '2026-10-16' }, { type: 'todas', symbol: 'book', title: 'Bem-vindo à Lume!', text: 'Explore os livros, salve seus favoritos e acompanhe seu progresso de leitura.', route: 'catalogo', date: '2026-10-16' }, ...state.orders.map(order => ({ type: 'pedidos', symbol: 'bag', title: `Simulação #${order.id} confirmada`, text: 'Você pode consultar os livros e os valores em Meus pedidos.', route: 'pedidos', date: order.date }))];
    const selected = notices.filter(notice => filter === 'todas' || notice.type === filter);
    return `${pageHeading('Notificações', 'As novidades do seu universo de leitura.')}<nav class="chip-row" aria-label="Tipos de notificação">${[['todas', 'Todas'], ['promocoes', 'Promoções'], ['pedidos', 'Pedidos']].map(([value, label]) => `<a class="chip ${filter === value ? 'active' : ''}" href="#notificacoes?tipo=${value}">${label}</a>`).join('')}</nav>${selected.length ? `<ul class="notification-list">${selected.map(notice => `<li><a class="notification-item" href="#${notice.route}"><span class="genre-icon">${icon(notice.symbol)}</span><div><h2>${escapeHtml(notice.title)}</h2><p>${escapeHtml(notice.text)}</p><time datetime="${notice.date}">${new Date(notice.date.length === 10 ? notice.date + 'T12:00:00' : notice.date).toLocaleDateString('pt-BR')}</time></div></a></li>`).join('')}</ul>` : emptyState('Tudo tranquilo por aqui', 'As confirmações das suas simulações aparecerão nesta aba.', 'bell')}`;
}

function couponsView(){
    return `<header class="center-heading">${icon('ticket')}<span class="eyebrow">Mais histórias na sua estante</span><h1>Você tem cupons!</h1><p>Aproveite para ler ainda mais.</p></header><section class="coupon-grid" aria-label="Seus cupons"><article class="coupon"><div><h2>BEMVINDO</h2><strong>10% OFF</strong><p>Para sua próxima simulação.</p></div><button class="button button-primary" type="button" data-action="copy-coupon" data-code="BEMVINDO">Copiar</button></article><article class="coupon"><div><h2>LIVRO10</h2><strong>10% OFF</strong><p>Em todos os livros do catálogo.</p></div><button class="button button-primary" type="button" data-action="copy-coupon" data-code="LIVRO10">Copiar</button></article></section><p class="intro-note center-heading">Cupons demonstrativos, exclusivos deste protótipo. Não são válidos nas lojas pesquisadas e não são cumulativos.</p><div class="center-heading"><a class="button button-primary" href="#catalogo">Encontrar minha próxima leitura${icon('arrow')}</a></div>`;
}

function readingView(){
    const completed = state.reading.filter(item => item.page >= getBook(item.id).pages).length;
    return `${pageHeading('Meu progresso', 'De página em página, você vai mais longe.')}<div class="reading-dashboard"><section class="panel reading-stats"><h2>Seu ano em histórias</h2><div class="progress-ring" role="img" aria-label="${completed} livros concluídos de uma meta de ${state.goal}"><strong>${completed}</strong><span>livros concluídos</span></div><p class="field-hint">Meta de leitura: ${state.goal} livros</p><form data-form="goal"><div class="form-grid"><div class="span-two"><label for="reading-goal">Quantos livros você quer ler?</label><input id="reading-goal" name="goal" type="number" min="1" max="365" value="${state.goal}" required></div></div><button class="button button-secondary full-width" type="submit">Atualizar meta</button></form></section><section class="panel reading-list"><h2>Livros em andamento</h2>${state.reading.length ? state.reading.map(item => { const book = getBook(item.id); return `<article class="reading-item"><a href="#livro/${item.id}"><img src="imagens/${item.id}.webp" alt="Capa de ${escapeHtml(book.title)}" width="55" height="80"></a><div><h3>${book.title}</h3><p class="book-author">${book.author}</p><progress value="${item.page}" max="${book.pages}" aria-label="Progresso de ${escapeHtml(book.title)}"></progress><form data-form="reading" data-id="${item.id}"><label for="page-${item.id}">Pág.</label><input id="page-${item.id}" name="page" type="number" min="0" max="${book.pages}" value="${item.page}" required><span>de ${book.pages}</span><button class="button button-secondary" type="submit">Salvar</button></form></div></article>`; }).join('') : '<p class="intro-note">Abra um livro no catálogo e toque em “Adicionar à minha leitura” para começar a acompanhar suas páginas.</p>'}<a class="text-link" href="#catalogo">Escolher uma nova leitura${icon('arrow')}</a></section></div>`;
}

function supportView(){
    const faqs = [['help', 'Perguntas frequentes', 'Este é um protótipo navegável da livraria Lume. Você pode pesquisar, filtrar, favoritar livros, simular compras e acompanhar leituras. As informações ficam salvas somente neste navegador.'], ['book', 'Política de trocas e devoluções', 'As compras aqui são simulações e não geram produtos ou entregas. Para uma compra real, consulte as regras da loja de origem indicada na página do livro.'], ['card', 'Formas de pagamento', 'O checkout apresenta Pix, cartão de crédito e boleto para demonstrar a navegação. Não há cobrança e não solicitamos números de cartão.'], ['bag', 'Rastreamento de pedidos', 'As simulações ficam em Meus pedidos. Como não há expedição real, não existe código de rastreio.'], ['mail', 'Fale conosco', 'A Lume é uma interface demonstrativa e não possui atendimento comercial. As fontes dos livros estão disponíveis em “Fontes e preços”, no rodapé.'], ['pin', 'Como funciona o frete?', 'Para demonstrar o layout, usamos frete de R$ 12,90 e gratuidade a partir de R$ 99. Os valores não são cotações das lojas pesquisadas.']];
    return `${pageHeading('Ajuda e suporte', 'Estamos aqui para ajudar a sua próxima história.')}<div class="support-layout"><section class="faq-list" aria-label="Dúvidas frequentes">${faqs.map(([symbol, question, answer]) => `<details><summary>${icon(symbol)}${question}</summary><p>${answer}</p></details>`).join('')}</section><aside class="support-aside"><img src="imagens/livros-ilustracao-v2-960.webp" srcset="imagens/livros-ilustracao-v2-480.webp 480w, imagens/livros-ilustracao-v2-960.webp 960w, imagens/livros-ilustracao-v2.webp 1162w" sizes="(max-width: 640px) 180px, 230px" alt="Livros e ramos de flores" width="1162" height="1353"><h2>Conte com a Lume.</h2><p>Seu próximo capítulo começa com uma boa conversa.</p><a class="text-link" href="#fontes">Ver fontes e preços${icon('arrow')}</a></aside></div>`;
}

function sourcesView(){
    return `${pageHeading('Fontes e preços', 'Capas reais e valores pesquisados para o catálogo.')}<p class="intro-note">Pesquisa realizada em <strong>16 de outubro de 2026</strong> em páginas oficiais de editoras. Os preços são referências das edições físicas indicadas, sem frete, e podem mudar. As capas correspondem às edições pesquisadas e podem diferir das ilustrações do desenho. As notas com estrelas são ilustrativas da referência, não avaliações verificadas.</p><div class="source-table-wrapper"><table class="source-table"><caption>Livros identificados na imagem do designer</caption><thead><tr><th scope="col">Livro</th><th scope="col">Preço consultado</th><th scope="col">Edição e ISBN</th><th scope="col">Fonte do preço e da capa</th></tr></thead><tbody>${books.map(book => `<tr><td><a href="#livro/${book.id}"><img src="imagens/${book.id}.webp" alt="" width="28" height="40">${book.title}<br><small>${book.author}</small></a></td><td class="source-price">${money(book.price)}${book.available === false ? '<br><small>Esgotado na fonte</small>' : ''}</td><td>${book.edition}<br><small>${book.isbn}</small></td><td><a href="${book.source}" target="_blank" rel="noopener noreferrer">${book.sourceName} ↗</a></td></tr>`).join('')}</tbody></table></div><p class="price-caption">Os dados foram incorporados ao site na data da pesquisa; não há atualização automática. Cupons, frete e pedidos da Lume são demonstrativos.</p>`;
}

function notFoundView(){
    return `${pageHeading('Esta página virou...')}${emptyState('Vamos encontrar outra história?', 'O endereço não corresponde a uma página da Lume.', 'book', 'Voltar ao início', 'inicio')}`;
}

function render(options = {}){
    const { parts, params } = getRoute();
    if(params.has('limpar')){
        filters = { genres: [], price: 200, rating: false, format: 'Todos' };
        history.replaceState(null, '', '#catalogo');
    }
    const route = parts[0];
    const views = { inicio: homeView, catalogo: () => catalogView(params.has('limpar') ? new URLSearchParams() : params), livro: () => productView(parts[1]), carrinho: cartView, checkout: checkoutView, confirmado: () => confirmationView(parts[1]), favoritos: favoritesView, perfil: profileView, pedidos: () => ordersView(params), notificacoes: () => notificationsView(params), cupons: couponsView, leitura: readingView, suporte: supportView, fontes: sourcesView, enderecos: addressView, configuracoes: () => profileView(true) };
    main.innerHTML = (views[route] || notFoundView)();
    document.title = `${main.querySelector('h1')?.textContent || 'Livros e boas histórias'} · Lume`;
    updateShell();
    if(!options.keepScroll){
        window.scrollTo({ top: 0, behavior: 'instant' });
        if(options.focus) main.focus({ preventScroll: true });
    }
}

function addToCart(id){
    const book = getBook(id);
    if(!book) return false;
    if(book.available === false){
        toast('Esta edição está esgotada na fonte consultada.');
        return false;
    }
    const existing = state.cart.find(item => item.id === id);
    if(existing && existing.quantity >= 99){
        toast('Você já atingiu o limite de 99 exemplares.');
        return false;
    }
    if(existing) existing.quantity++;
    else state.cart.push({ id, quantity: 1 });
    saveState();
    toast(`${book.title} adicionado ao carrinho.`);
    return true;
}

function openDialog(dialog){
    dialog.showModal();
    document.body.classList.add('dialog-open');
}

function closeDialog(dialog){
    dialog.close();
    document.body.classList.remove('dialog-open');
}

function openFilters(){
    const form = document.querySelector('#filter-form');
    document.querySelector('#filter-genres').innerHTML = genres.map(genre => `<label><input type="checkbox" name="genre" value="${genre}" ${filters.genres.includes(genre) ? 'checked' : ''}><span>${genre}</span></label>`).join('');
    form.elements.price.value = filters.price;
    form.elements.rating.checked = filters.rating;
    form.elements.format.value = filters.format;
    document.querySelector('#price-output').textContent = money(filters.price * 100);
    openDialog(filterDialog);
}

let undoState = null;
let undoTimer;

document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]');
    if(!button || button.disabled) return;
    const { action, id } = button.dataset;
    if(action === 'favorite'){
        const selected = state.favorites.includes(id);
        if(selected) state.favorites = state.favorites.filter(value => value !== id);
        else state.favorites.push(id);
        saveState();
        if(getRoute().parts[0] === 'favoritos') render({ keepScroll: true });
        else document.querySelectorAll(`[data-action="favorite"][data-id="${id}"]`).forEach(element => {
            element.setAttribute('aria-pressed', String(!selected));
            element.setAttribute('aria-label', `${selected ? 'Adicionar' : 'Remover'} ${getBook(id).title} ${selected ? 'aos' : 'dos'} favoritos`);
        });
        toast(selected ? 'Livro removido dos favoritos.' : 'Uma história guardada para depois.');
    }
    if(action === 'add') addToCart(id);
    if(action === 'buy' && addToCart(id)) navigate('checkout');
    if(action === 'remove'){
        state.cart = state.cart.filter(item => item.id !== id);
        saveState();
        render({ keepScroll: true });
        toast('Livro removido do carrinho.');
    }
    if(action === 'quantity'){
        const item = state.cart.find(value => value.id === id);
        if(item){
            item.quantity = Math.min(99, item.quantity + Number(button.dataset.delta));
            state.cart = state.cart.filter(value => value.quantity > 0);
            saveState();
            render({ keepScroll: true });
            const equivalentButton = document.querySelector(`[data-action="quantity"][data-id="${id}"][data-delta="${button.dataset.delta}"]`);
            equivalentButton?.focus({ preventScroll: true });
        }
    }
    if(action === 'clear-cart'){
        state.cart = [];
        state.coupon = '';
        saveState();
        render();
        toast('Carrinho limpo.');
    }
    if(action === 'filters') openFilters();
    if(action === 'close-filters') closeDialog(filterDialog);
    if(action === 'close-review') closeDialog(reviewDialog);
    if(action === 'checkout-back'){
        currentStep = Math.max(1, currentStep - 1);
        render();
    }
    if(action === 'confirm-order') confirmOrder();
    if(action === 'start-reading'){
        event.preventDefault();
        if(!state.reading.some(item => item.id === id)) state.reading.push({ id, page: 0 });
        saveState();
        navigate('leitura');
        toast('Livro adicionado à sua leitura.');
    }
    if(action === 'review'){
        reviewBookId = id;
        document.querySelector('#review-form').reset();
        document.querySelector('.star-options').innerHTML = [1, 2, 3, 4, 5].map(value => `<label><input type="radio" name="rating" value="${value}" ${value === 5 ? 'checked' : ''}><span aria-hidden="true">★</span><span class="visually-hidden">${value} ${value === 1 ? 'estrela' : 'estrelas'}</span></label>`).join('');
        openDialog(reviewDialog);
    }
    if(action === 'copy-coupon'){
        const code = button.dataset.code;
        try{
            await navigator.clipboard.writeText(code);
            button.textContent = 'Copiado!';
            toast(`Cupom ${code} copiado. Use no carrinho.`);
        }catch{
            state.coupon = code;
            saveState();
            button.textContent = 'Aplicado!';
            toast(`Cupom ${code} aplicado ao seu carrinho.`);
        }
    }
    if(action === 'delete-address'){
        state.address = {};
        saveState();
        render();
        toast('Endereço removido deste navegador.');
    }
    if(action === 'reset-data'){
        undoState = structuredClone(state);
        state = structuredClone(defaultState);
        saveState();
        render();
        const message = document.querySelector('#toast');
        message.replaceChildren(document.createTextNode('Dados apagados. '));
        const undoButton = document.createElement('button');
        undoButton.type = 'button';
        undoButton.textContent = 'Desfazer';
        undoButton.dataset.action = 'undo-reset';
        undoButton.className = 'undo-button';
        message.append(undoButton);
        message.classList.add('visible', 'interactive');
        window.clearTimeout(toastTimer);
        window.clearTimeout(undoTimer);
        undoTimer = window.setTimeout(() => { undoState = null; message.classList.remove('visible', 'interactive'); }, 12000);
    }
    if(action === 'undo-reset' && undoState){
        state = undoState;
        undoState = null;
        saveState();
        render();
        document.querySelector('#toast').classList.remove('interactive');
        window.clearTimeout(undoTimer);
        toast('Seus dados foram restaurados.');
    }
});

document.addEventListener('submit', event => {
    const form = event.target;
    const type = form.dataset.form;
    if(!type) return;
    event.preventDefault();
    const data = new FormData(form);
    if(type === 'search'){
        const query = String(data.get('q') || '').trim();
        filters = { genres: [], price: 200, rating: false, format: 'Todos' };
        navigate('catalogo' + (query ? '?q=' + encodeURIComponent(query) : ''));
    }
    if(type === 'coupon'){
        const code = String(data.get('coupon')).trim().toUpperCase();
        if(!['BEMVINDO', 'LIVRO10'].includes(code)){
            toast('Cupom não encontrado. Experimente BEMVINDO ou LIVRO10.');
            return;
        }
        state.coupon = code;
        saveState();
        render({ keepScroll: true });
        toast('Cupom aplicado: 10% de desconto na simulação.');
    }
    if(type === 'address'){
        const address = Object.fromEntries(data);
        if(Object.values(address).some(value => !String(value).trim())){
            toast('Preencha todos os campos do endereço.');
            return;
        }
        state.address = Object.fromEntries(Object.entries(address).map(([key, value]) => [key, String(value).trim()]));
        state.address.region = state.address.region.toUpperCase();
        saveState();
        currentStep = 2;
        render();
    }
    if(type === 'payment'){
        state.payment = String(data.get('payment'));
        saveState();
        currentStep = 3;
        render();
    }
    if(type === 'profile'){
        const name = String(data.get('name')).trim();
        if(!name){
            toast('Informe um nome para salvar.');
            return;
        }
        state.profile = { name, email: String(data.get('email')).trim() };
        saveState();
        render({ keepScroll: true });
        toast(storageAvailable ? 'Seu perfil foi atualizado.' : 'Perfil atualizado nesta sessão. O navegador bloqueou o armazenamento.');
    }
    if(type === 'goal'){
        state.goal = Number(data.get('goal'));
        saveState();
        render({ keepScroll: true });
        toast('Sua meta de leitura foi atualizada.');
    }
    if(type === 'reading'){
        const item = state.reading.find(value => value.id === form.dataset.id);
        if(item){
            item.page = Number(data.get('page'));
            saveState();
            render({ keepScroll: true });
            toast(item.page >= getBook(item.id).pages ? 'Mais uma história concluída. Boa leitura na próxima!' : 'Seu progresso foi salvo.');
        }
    }
});

document.querySelector('#filter-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    filters = { genres: data.getAll('genre'), price: Number(data.get('price')), rating: data.has('rating'), format: String(data.get('format')) };
    closeDialog(filterDialog);
    render({ focus: true });
});

document.querySelector('#filter-form').addEventListener('reset', () => {
    window.setTimeout(() => {
        document.querySelectorAll('#filter-genres input').forEach(input => input.checked = false);
        document.querySelector('#max-price').value = 200;
        document.querySelector('#price-output').textContent = 'R$ 200';
        document.querySelector('#filter-form').elements.rating.checked = false;
        document.querySelector('#filter-form').elements.format.value = 'Todos';
    }, 0);
});

document.querySelector('#max-price').addEventListener('input', event => {
    document.querySelector('#price-output').textContent = money(Number(event.target.value) * 100);
});

document.querySelector('#review-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const comment = String(data.get('comment')).trim();
    if(!comment){
        toast('Escreva seu comentário antes de enviar.');
        return;
    }
    state.reviews = state.reviews.filter(review => review.bookId !== reviewBookId);
    state.reviews.push({ bookId: reviewBookId, rating: Number(data.get('rating')), comment: comment.slice(0, 500) });
    saveState();
    closeDialog(reviewDialog);
    render({ keepScroll: true });
    toast('Sua avaliação foi salva. Obrigado por compartilhar!');
});

document.addEventListener('change', event => {
    if(event.target.id === 'book-sort'){
        sort = event.target.value;
        render({ keepScroll: true });
        document.querySelector('#book-sort')?.focus({ preventScroll: true });
    }
});

for(const dialog of [filterDialog, reviewDialog]){
    dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    dialog.addEventListener('click', event => {
        const bounds = dialog.getBoundingClientRect();
        if(event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog);
    });
}

window.addEventListener('hashchange', () => {
    currentStep = 1;
    for(const dialog of [filterDialog, reviewDialog]) if(dialog.open) closeDialog(dialog);
    render({ focus: true });
});

render();
