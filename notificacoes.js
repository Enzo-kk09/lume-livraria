'use strict';

// Comportamento da página notificacoes.html.


const books = [
    {
        "id": "e-assim-que-comeca",
        "title": "É assim que começa",
        "author": "Colleen Hoover",
        "genres": [
            "Romance",
            "Ficção"
        ],
        "rating": 4.8,
        "publisher": "Galera",
        "pages": 336,
        "edition": "Brochura · vol. 2",
        "isbn": "9786559811397",
        "sourceName": "Grupo Editorial Record",
        "description": "Lily tenta reconstruir sua vida e reencontra Atlas, seu amor da adolescência. Entre os desafios da separação e uma nova chance de amar, os dois precisam encontrar espaço para um recomeço.",
        "price": 6490,
        "source": "https://www.record.com.br/products/e-assim-que-comeca-vol-2-e-assim-que-acaba",
        "available": true,
        "imageSource": "https://cdn.shopify.com/s/files/1/0722/9197/5420/files/8460a33af8c7e3205d51b011d5c9a61d_8ff3f3cd-4890-4889-928b-f1fc3487bb92.jpg?v=1792166831",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "hipotese-do-amor",
        "title": "A hipótese do amor",
        "author": "Ali Hazelwood",
        "genres": [
            "Romance",
            "Ficção"
        ],
        "rating": 4.7,
        "publisher": "Arqueiro",
        "pages": 336,
        "edition": "Impresso · edição da fonte",
        "isbn": "9786555653304",
        "price": 5900,
        "source": "https://new.editoraarqueiro.com.br/livro/a-hipotese-do-amor/",
        "sourceName": "Editora Arqueiro",
        "description": "Olive, uma jovem cientista, entra em um namoro de mentira com o professor Adam Carlsen. O experimento que parecia simples começa a desafiar suas certezas quando os sentimentos deixam de ser apenas uma hipótese.",
        "available": true,
        "imageSource": "https://new.editoraarqueiro.com.br/wp-content/uploads/2024/03/9786555653304.jpg",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "verity",
        "title": "Verity",
        "author": "Colleen Hoover",
        "genres": [
            "Suspense",
            "Ficção"
        ],
        "rating": 4.9,
        "publisher": "Galera",
        "pages": 320,
        "edition": "Brochura",
        "isbn": "9788501117847",
        "sourceName": "Grupo Editorial Record",
        "description": "A escritora Lowen aceita concluir os livros de uma autora incapacitada e se instala na casa da família. Um manuscrito escondido transforma o trabalho em uma trama de segredos, atração e dúvidas. Classificação indicativa da editora: 18 anos.",
        "price": 6490,
        "source": "https://www.record.com.br/products/verity",
        "available": true,
        "imageSource": "https://cdn.shopify.com/s/files/1/0722/9197/5420/files/d714a333a0c7d64404774020856088c2_bbea839c-b70b-4021-adf3-2003cf9f8fc3.jpg?v=1792166841",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "amor-nos-tempos-do-colera",
        "title": "O amor nos tempos do cólera",
        "author": "Gabriel García Márquez",
        "genres": [
            "Romance",
            "Clássicos",
            "Ficção"
        ],
        "rating": 4.6,
        "publisher": "Record",
        "pages": 432,
        "edition": "Brochura",
        "isbn": "9788501028723",
        "sourceName": "Grupo Editorial Record",
        "description": "Florentino Ariza e Fermina Daza atravessam décadas de desencontros. Entre cartas, memórias e transformações, Gabriel García Márquez acompanha um amor que resiste ao tempo e às diferentes fases da vida.",
        "price": 7990,
        "source": "https://www.record.com.br/products/o-amor-nos-tempos-do-colera",
        "available": true,
        "imageSource": "https://cdn.shopify.com/s/files/1/0722/9197/5420/files/88ba8739c94036b413cf5f3db94c38b4_f632cda5-ad14-4ce6-bbfe-8fab132a6d65.jpg?v=1790989188",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "teto-para-dois",
        "title": "Teto para dois",
        "author": "Beth O’Leary",
        "genres": [
            "Romance",
            "Ficção"
        ],
        "rating": 4.8,
        "publisher": "Intrínseca",
        "pages": 400,
        "edition": "Brochura · capa da série",
        "isbn": "9788551005415",
        "price": 6990,
        "source": "https://loja.intrinseca.com.br/teto-para-dois-livro-que-deu-origem-a-serie-da-paramount/",
        "sourceName": "Editora Intrínseca",
        "description": "Tiffy e Leon dividem um apartamento, mas seus horários não se cruzam. Um acordo incomum e a troca de bilhetes aproximam duas pessoas que ainda não se conhecem pessoalmente.",
        "available": true,
        "imageSource": "https://loja.intrinseca.com.br/media/catalog/product/cache/46f7fe62f8e952714854cf0107867196/9/7/9788551005415_20230426134015.jpg",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "pequeno-principe",
        "title": "O pequeno príncipe",
        "author": "Antoine de Saint-Exupéry",
        "genres": [
            "Fantasia",
            "Clássicos",
            "Ficção"
        ],
        "rating": 4.9,
        "publisher": "HarperCollins Brasil",
        "pages": 96,
        "edition": "Brochura · 16 × 23 cm",
        "isbn": "9788595081512",
        "price": 2190,
        "sourceName": "HarperCollins Brasil",
        "description": "Um piloto encontra um pequeno viajante no deserto. As lembranças de seus planetas, de sua rosa e de seus encontros revelam uma história poética sobre amizade, afeto e aquilo que dá sentido à vida.",
        "source": "https://harpercollins.com.br/products/o-pequeno-principe-antoine-de-saint-exupery",
        "available": true,
        "imageSource": "https://cdn.shopify.com/s/files/1/0529/5125/3158/files/9788595081512.jpg?v=1781713504",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "evelyn-hugo",
        "title": "Os sete maridos de Evelyn Hugo",
        "author": "Taylor Jenkins Reid",
        "genres": [
            "Romance",
            "Ficção"
        ],
        "rating": 4.9,
        "publisher": "Paralela",
        "pages": 360,
        "edition": "Brochura",
        "isbn": "9788584391509",
        "price": 6990,
        "source": "https://www.companhiadasletras.com.br/9788584391509-os-sete-maridos-de-evelyn-hugo-3202/p",
        "sourceName": "Companhia das Letras",
        "description": "A estrela de cinema Evelyn Hugo escolhe uma jornalista pouco conhecida para revelar sua trajetória. A entrevista expõe o que permaneceu escondido por trás da fama, dos casamentos e das escolhas da atriz.",
        "available": true,
        "imageSource": "https://ciadasletras.vtexassets.com/arquivos/ids/217859/capa-recolor2-9788584391509.jpg?v=639238600856900000",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "duna",
        "title": "Duna",
        "author": "Frank Herbert",
        "genres": [
            "Fantasia",
            "Ficção"
        ],
        "rating": 4.8,
        "publisher": "Aleph",
        "pages": 680,
        "edition": "Capa dura · livro 1",
        "isbn": "9788576573135",
        "sourceName": "Editora Aleph",
        "description": "No planeta desértico Arrakis, Paul Atreides se vê no centro de uma disputa por poder e por um recurso precioso. Política, ecologia e misticismo se entrelaçam nesta aventura de ficção científica.",
        "price": 10990,
        "source": "https://aleph.com.br/products/duna-1",
        "available": true,
        "imageSource": "https://cdn.shopify.com/s/files/1/0733/2167/7083/files/alp_testecapas_700x1000_Duna.png?v=1713784200",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "divina-comedia",
        "title": "A divina comédia",
        "author": "Dante Alighieri",
        "genres": [
            "Clássicos",
            "Ficção"
        ],
        "rating": 4.7,
        "publisher": "Martin Claret",
        "pages": 1016,
        "edition": "Capa dura · 12 × 19 cm",
        "isbn": "9786559102303",
        "price": 8990,
        "available": false,
        "source": "https://www.martinclaret.com.br/produtos/a-divina-comedia/",
        "sourceName": "Editora Martin Claret",
        "description": "Dante percorre o Inferno, o Purgatório e o Paraíso em uma jornada poética sobre as escolhas humanas. Virgílio e Beatriz o acompanham em diferentes etapas desse clássico da literatura.",
        "imageSource": "https://acdn-us.mitiendanube.com/stores/005/277/283/products/divina-comedia-7d94596be1d402884817332526683901-640-0.webp",
        "checkedAt": "2026-10-16"
    },
    {
        "id": "biblioteca-da-meia-noite",
        "title": "A biblioteca da meia-noite",
        "author": "Matt Haig",
        "genres": [
            "Fantasia",
            "Ficção"
        ],
        "rating": 4.8,
        "publisher": "Bertrand Brasil",
        "pages": 308,
        "edition": "Brochura",
        "isbn": "9786558380542",
        "sourceName": "Grupo Editorial Record",
        "description": "Em uma biblioteca entre diferentes possibilidades de existência, Nora Seed pode conhecer as vidas que teria vivido com outras escolhas. Cada livro abre uma oportunidade de repensar arrependimentos e descobrir o valor da própria história.",
        "price": 6490,
        "source": "https://www.record.com.br/products/a-biblioteca-da-meia-noite",
        "available": true,
        "imageSource": "https://cdn.shopify.com/s/files/1/0722/9197/5420/files/733997948113191ffc5f855acdfe3e6f.jpg?v=1791938462",
        "checkedAt": "2026-10-16"
    }
];

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


const pageName = 'notificacoes';

function pageUrl(route){
 const [path, query = ''] = route.replace(/^#/, '').split('?');
 const [name, id] = path.split('/');
 const file = name === 'inicio' ? 'index' : name;
 const params = new URLSearchParams(query);
 if(id) params.set('id', id);
 const search = params.toString();
 return file + '.html' + (search ? '?' + search : '');
}
function pageLinks(markup){
 return markup.replace(/href="#(inicio|catalogo|livro|carrinho|checkout|pagamento|revisao|confirmado|favoritos|perfil|pedidos|notificacoes|cupons|leitura|suporte|fontes|enderecos|configuracoes)([^"\s]*)"/g, (_, name, rest) => 'href="' + pageUrl(name + rest) + '"');
}
function getRoute(){
 const params = new URLSearchParams(location.search);
 return {path: pageName, parts: [pageName, params.get('id')], params};
}


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



function toast(message){
    const element = document.querySelector('#toast');
    element.textContent = message;
    element.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove('visible'), 3300);
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
        const selected = link.dataset.mobileNav === route || link.dataset.mobileNav === 'perfil' && profileRoutes.includes(route) || link.dataset.mobileNav === 'catalogo' && route === 'livro' || link.dataset.mobileNav === 'carrinho' && ['checkout', 'pagamento', 'revisao', 'confirmado'].includes(route);
        if(selected) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function pageHeading(title, subtitle = '', action = ''){
    return `<header class="page-heading"><div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ''}</div>${action}</header>`;
}





function rating(book){
    return `<span class="book-rating" title="Nota ilustrativa da referência, não uma avaliação verificada" aria-label="Nota ilustrativa: ${book.rating}">${icon('star')}${book.rating.toFixed(1)}</span>`;
}







function emptyState(title, message, symbol = 'book', button = 'Explorar livros', route = 'catalogo'){
    return `<section class="empty-state">${icon(symbol)}<h2>${title}</h2><p>${message}</p><a class="button button-primary" href="#${route}">${button}${icon('arrow')}</a></section>`;
}











function closeDialog(dialog){
    dialog.close();
    document.body.classList.remove('dialog-open');
}


function notificationsView(params){
    const filter = params.get('tipo') || 'todas';
    const notices = [{ type: 'promocoes', symbol: 'ticket', title: 'Um presente para sua próxima leitura', text: 'Use BEMVINDO para simular 10% de desconto no catálogo.', route: 'cupons', date: '2026-10-16' }, { type: 'todas', symbol: 'book', title: 'Bem-vindo à Lume!', text: 'Explore os livros, salve seus favoritos e acompanhe seu progresso de leitura.', route: 'catalogo', date: '2026-10-16' }, ...state.orders.map(order => ({ type: 'pedidos', symbol: 'bag', title: `Simulação #${order.id} confirmada`, text: 'Você pode consultar os livros e os valores em Meus pedidos.', route: 'pedidos', date: order.date }))];
    const selected = notices.filter(notice => filter === 'todas' || notice.type === filter);
    return `${pageHeading('Notificações', 'As novidades do seu universo de leitura.')}<nav class="chip-row" aria-label="Tipos de notificação">${[['todas', 'Todas'], ['promocoes', 'Promoções'], ['pedidos', 'Pedidos']].map(([value, label]) => `<a class="chip ${filter === value ? 'active' : ''}" href="#notificacoes?tipo=${value}">${label}</a>`).join('')}</nav>${selected.length ? `<ul class="notification-list">${selected.map(notice => `<li><a class="notification-item" href="#${notice.route}"><span class="genre-icon">${icon(notice.symbol)}</span><div><h2>${escapeHtml(notice.title)}</h2><p>${escapeHtml(notice.text)}</p><time datetime="${notice.date}">${new Date(notice.date.length === 10 ? notice.date + 'T12:00:00' : notice.date).toLocaleDateString('pt-BR')}</time></div></a></li>`).join('')}</ul>` : emptyState('Tudo tranquilo por aqui', 'As confirmações das suas simulações aparecerão nesta aba.', 'bell')}`;
}


function render(options = {}){
 const {params} = getRoute();
 if(params.has('limpar')){ filters = {genres: [], price: 200, rating: false, format: 'Todos'}; history.replaceState(null, '', 'catalogo.html'); params.delete('limpar'); }
 main.innerHTML = pageLinks(notificationsView(params));
 document.title = (main.querySelector('h1')?.textContent || 'Notificações') + ' · Lume';
 updateShell();
 if(!options.keepScroll){window.scrollTo({top: 0, behavior: 'instant'}); if(options.focus)main.focus({preventScroll:true});}
}

let undoState = null;
let undoTimer;

document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]');
    if(!button || button.disabled) return;
    const { action, id } = button.dataset;

















});

document.addEventListener('submit', event => {
    const form = event.target;
    const type = form.dataset.form;
    if(!type) return;
    event.preventDefault();
    const data = new FormData(form);







});

for(const dialog of [filterDialog, reviewDialog].filter(Boolean)){
    dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    dialog.addEventListener('click', event => {
        const bounds = dialog.getBoundingClientRect();
        if(event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog);
    });
}


render();
