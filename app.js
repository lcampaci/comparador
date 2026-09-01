// ======================
// Armazenamento dos dados
// ======================
const markets = {
    m1: { name: 'Mercado 1', items: [] },
    m2: { name: 'Mercado 2', items: [] },
    m3: { name: 'Mercado 3', items: [] }
};

// ======================
// Elementos da tela
// ======================
const el = {
    nameInputs: document.querySelectorAll('.market-name'),
    itemName: document.querySelectorAll('.item-name'),
    itemPrice: document.querySelectorAll('.item-price'),
    addBtns: document.querySelectorAll('.add-btn'),
    list1: document.getElementById('list1'),
    list2: document.getElementById('list2'),
    list3: document.getElementById('list3'),
    finalList: document.getElementById('finalList'),
    compareBtn: document.getElementById('compareBtn'),
    clearBtn: document.getElementById('clearBtn'),
    totalValue: document.getElementById('totalValue')
};

// Mapear botões aos mercados
const marketKeys = ['m1', 'm2', 'm3'];

// ======================
// Carregar dados salvos
// ======================
function loadData() {
    const saved = localStorage.getItem('shoppingAppData');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(markets, parsed);
        renderAllLists();
        updateNameInputs();
    }
}

function saveData() {
    localStorage.setItem('shoppingAppData', JSON.stringify(markets));
}

function updateNameInputs() {
    el.nameInputs[0].value = markets.m1.name;
    el.nameInputs[1].value = markets.m2.name;
    el.nameInputs[2].value = markets.m3.name;
}

// ======================
// Adicionar item
// ======================
function addItem(marketKey, idx) {
    const name = el.itemName[idx].value.trim().toLowerCase();
    const price = parseFloat(el.itemPrice[idx].value);

    if (!name || isNaN(price) || price < 0) {
        alert('Preencha o nome e o preço corretamente!');
        return;
    }

    markets[marketKey].items.push({ nome: name, preco: price });
    el.itemName[idx].value = '';
    el.itemPrice[idx].value = '';

    saveData();
    renderAllLists();
}

// ======================
// Remover item
// ======================
function removeItem(marketKey, index) {
    markets[marketKey].items.splice(index, 1);
    saveData();
    renderAllLists();
}

// ======================
// Renderizar listas
// ======================
function renderList(marketKey, ulElement) {
    ulElement.innerHTML = '';
    markets[marketKey].items.forEach((item, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${capitalize(item.nome)}</strong></span>
            <span>R$ ${item.preco.toFixed(2).replace('.', ',')}
                <button class="del-btn" data-market="${marketKey}" data-index="${idx}">×</button>
            </span>
        `;
        ulElement.appendChild(li);
    });
}

function renderAllLists() {
    renderList('m1', el.list1);
    renderList('m2', el.list2);
    renderList('m3', el.list3);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ======================
// Comparar e gerar lista final
// ======================
function compareAndGenerateFinal() {
    const allItems = {};

    // Juntar todos os preços por produto
    marketKeys.forEach(key => {
        markets[key].items.forEach(item => {
            if (!allItems[item.nome]) allItems[item.nome] = [];
            allItems[item.nome].push({
                preco: item.preco,
                mercado: markets[key].name
            });
        });
    });

    // Selecionar o mais barato de cada produto
    el.finalList.innerHTML = '';
    let total = 0;

    if (Object.keys(allItems).length === 0) {
        el.finalList.innerHTML = '<li style="justify-content:center;color:#64748b;">Adicione itens nas listas acima primeiro!</li>';
        el.totalValue.textContent = 'R$ 0,00';
        return;
    }

    Object.entries(allItems).forEach(([nome, precos]) => {
        precos.sort((a, b) => a.preco - b.preco);
        const maisBarato = precos[0];
        total += maisBarato.preco;

        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${capitalize(nome)}</strong></span>
            <span>
                R$ ${maisBarato.preco.toFixed(2).replace('.', ',')}
                <span class="market-tag">${maisBarato.mercado}</span>
            </span>
        `;
        el.finalList.appendChild(li);
    });

    el.totalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// ======================
// Limpar tudo
// ======================
function clearAll() {
    if (confirm('Tem certeza que deseja apagar todos os itens?')) {
        markets.m1.items = [];
        markets.m2.items = [];
        markets.m3.items = [];
        el.finalList.innerHTML = '';
        el.totalValue.textContent = 'R$ 0,00';
        localStorage.removeItem('shoppingAppData');
        renderAllLists();
    }
}

// ======================
// Eventos
// ======================
el.nameInputs.forEach((input, i) => {
    input.addEventListener('change', () => {
        markets[marketKeys[i]].name = input.value.trim() || `Mercado ${i+1}`;
        saveData();
    });
});

el.addBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => addItem(marketKeys[idx], idx));
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('del-btn')) {
        const marketKey = e.target.dataset.market;
        const index = parseInt(e.target.dataset.index);
        removeItem(marketKey, index);
    }
});

el.compareBtn.addEventListener('click', compareAndGenerateFinal);
el.clearBtn.addEventListener('click', clearAll);

// ======================
// PWA — Instalação
// ======================
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installBtn.style.display = 'none';
    deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrado ✅'));
    });
}

// ======================
// Inicializar
// ======================
loadData();