const Game = window.PuffTycoonGame;
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

function loadGame() {
  try {
    return Game.createGame(JSON.parse(localStorage.getItem('puff-tycoon-save')));
  } catch {
    return Game.createGame();
  }
}

let game = loadGame();

function save() {
  localStorage.setItem('puff-tycoon-save', JSON.stringify(game));
  $('#save-note').textContent = 'Sauvegardé à l’instant ✓';
}

function renderProducts() {
  const list = $('#product-list');
  const template = $('#product-template');
  list.replaceChildren();
  Game.PRODUCTS.forEach(product => {
    const content = template.content.cloneNode(true);
    const card = content.querySelector('.product-card');
    card.style.setProperty('--product-color', product.color);
    content.querySelector('h3').textContent = product.name;
    content.querySelector('.stock-badge').textContent = `${game.stock[product.id]} en stock`;
    content.querySelector('.product-description').textContent = product.desc;
    content.querySelector('.price-value').textContent = money(game.prices[product.id]);
    content.querySelector('.unit-cost').textContent = `coût ${money(product.cost)}`;
    content.querySelector('.price-down').onclick = () => { Game.changePrice(game, product.id, -1); render(); };
    content.querySelector('.price-up').onclick = () => { Game.changePrice(game, product.id, 1); render(); };
    const restockButton = content.querySelector('.restock-button');
    restockButton.textContent = `+5 · ${money(product.cost * 5)}`;
    restockButton.disabled = game.cash < product.cost * 5;
    restockButton.onclick = () => { if (Game.restock(game, product.id)) render(); };
    list.append(content);
  });
}

function renderGoals() {
  const box = $('#goal-list');
  box.replaceChildren();
  Game.goals(game).forEach(goal => {
    const done = game.claimed.includes(goal.id);
    const complete = goal.value >= goal.target;
    const item = document.createElement('div');
    item.className = `goal ${done ? 'done' : ''}`;
    item.innerHTML = `<div><strong>${done ? '✓ ' : ''}${goal.label}</strong><br><span>${Math.min(goal.value, goal.target)} / ${goal.target}${done ? ' · récompense reçue' : complete ? ` · +${money(goal.reward)}` : ''}</span></div><button class="restock-button" ${complete && !done ? '' : 'disabled'}>${complete && !done ? 'Réclamer' : 'En cours'}</button><div class="progress"><i style="width:${Math.min(100, goal.value / goal.target * 100)}%"></i></div>`;
    item.querySelector('button').onclick = () => { if (Game.claimGoal(game, goal.id)) render(); };
    box.append(item);
  });
}

function render() {
  $('#cash').textContent = money(game.cash);
  $('#day-label').textContent = `Jour ${game.day} · Matin`;
  $('#stock-stat').textContent = Object.values(game.stock).reduce((sum, amount) => sum + amount, 0);
  $('#reputation-stat').textContent = `${game.reputation}%`;
  $('#dealer-stat').textContent = game.dealers;
  $('#daily-demand').textContent = `${game.dailyDemand} demandes`;
  $('#daily-progress').textContent = `${game.daySales} / ${game.dailyDemand}`;
  $('#daily-progress-bar').style.width = `${Math.min(100, game.dailyDemand ? game.daySales / game.dailyDemand * 100 : 0)}%`;
  $('#event-title').textContent = game.event.title;
  $('#event-text').textContent = game.event.text;
  $('#network-sales').textContent = `+${game.dealers * 2}`;
  const recruitCost = 65 + game.dealers * 45;
  $('#network-cost').textContent = money(recruitCost);
  const recruitButton = $('#recruit-button');
  recruitButton.textContent = `Recruter un revendeur · ${money(recruitCost)}`;
  recruitButton.disabled = game.cash < recruitCost || game.dealers >= 8;
  $('#level-label').textContent = `Niveau ${1 + Math.floor(game.totalSales / 30)}`;
  renderProducts();
  renderGoals();
  $('#log-list').replaceChildren(...game.logs.slice(0, 4).map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  save();
}

$('#next-day-button').onclick = () => { Game.advanceDay(game); render(); };
$('#recruit-button').onclick = () => { if (Game.recruitDealer(game)) render(); };
$('#reset-button').onclick = () => {
  if (confirm('Recommencer avec une nouvelle boutique ?')) {
    game = Game.createGame();
    render();
  }
};
render();
