const PRODUCTS = [
  { id: 'brise', name: 'Brise Fruitée', desc: 'Pastilles aromatiques pétillantes', cost: 7, price: 15, color: '#fa9a7e' },
  { id: 'lune', name: 'Lune Mentholée', desc: 'Bonbons frais, goût intense', cost: 10, price: 21, color: '#6fc8c8' },
  { id: 'soleil', name: 'Soleil Tropical', desc: 'Gommes aux fruits du soleil', cost: 15, price: 31, color: '#f4c466' }
];

const EVENTS = [
  { title: 'Marché animé', text: 'Une foule passe devant l’atelier.', multiplier: 1.25 },
  { title: 'Journée calme', text: 'Tes habitués restent au rendez-vous.', multiplier: 0.8 },
  { title: 'Tendance fruitée', text: 'Les saveurs colorées attirent les regards.', multiplier: 1.15 },
  { title: 'Bouche-à-oreille', text: 'Ta réputation fait son chemin.', multiplier: 1.35 }
];

const DEFAULT = {
  cash: 120, day: 1, stock: { brise: 8, lune: 3, soleil: 0 },
  prices: { brise: 15, lune: 21, soleil: 31 }, reputation: 42, dealers: 0,
  totalSales: 0, daySales: 0, dailyDemand: 0, claimed: [],
  logs: ['Bienvenue dans ton atelier de nuages aromatiques !'],
  event: { title: 'Première ouverture', text: 'Les curieux découvrent tes produits.', multiplier: 1 }
};

const copy = value => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function demandFor(state, product) {
  const reference = product.price;
  const priceFactor = Math.max(0.15, 1 - (state.prices[product.id] - reference) / (reference * 0.75));
  return Math.max(0, Math.round((3 + state.reputation / 22 + state.dealers * 1.7) * priceFactor * state.event.multiplier));
}

function totalDemand(state) {
  return PRODUCTS.reduce((total, product) => total + demandFor(state, product), 0);
}

function addLog(state, text) {
  state.logs.unshift(`Jour ${state.day} · ${text}`);
  state.logs = state.logs.slice(0, 10);
}

function createGame(saved) {
  const candidate = saved && typeof saved === 'object' ? saved : {};
  const state = {
    ...copy(DEFAULT), ...candidate,
    stock: { ...DEFAULT.stock, ...(candidate.stock || {}) },
    prices: { ...DEFAULT.prices, ...(candidate.prices || {}) },
    claimed: Array.isArray(candidate.claimed) ? candidate.claimed : [],
    logs: Array.isArray(candidate.logs) ? candidate.logs : copy(DEFAULT.logs),
    event: { ...DEFAULT.event, ...(candidate.event || {}) }
  };
  state.dailyDemand = Number.isFinite(state.dailyDemand) && state.dailyDemand > 0 ? state.dailyDemand : totalDemand(state);
  return state;
}

function restock(state, productId) {
  const product = PRODUCTS.find(item => item.id === productId);
  if (!product || state.cash < product.cost * 5) return false;
  state.cash -= product.cost * 5;
  state.stock[product.id] += 5;
  addLog(state, `Production : 5 ${product.name} ajoutés au stock.`);
  return true;
}

function changePrice(state, productId, amount) {
  const product = PRODUCTS.find(item => item.id === productId);
  if (!product || !Number.isFinite(amount)) return false;
  state.prices[product.id] = Math.max(product.cost + 2, state.prices[product.id] + amount);
  return true;
}

function recruitDealer(state) {
  const cost = 65 + state.dealers * 45;
  if (state.cash < cost || state.dealers >= 8) return false;
  state.cash -= cost;
  state.dealers += 1;
  state.reputation = clamp(state.reputation + 3, 0, 100);
  addLog(state, 'Un nouveau revendeur rejoint ton réseau !');
  return true;
}

function goals(state) {
  return [
    { id: 'sales', label: 'Vendre 25 produits', value: state.totalSales, target: 25, reward: 75 },
    { id: 'rep', label: 'Atteindre 65 % de réputation', value: state.reputation, target: 65, reward: 100 },
    { id: 'network', label: 'Signer 3 revendeurs', value: state.dealers, target: 3, reward: 150 }
  ];
}

function claimGoal(state, goalId) {
  const goal = goals(state).find(item => item.id === goalId);
  if (!goal || goal.value < goal.target || state.claimed.includes(goalId)) return false;
  state.cash += goal.reward;
  state.claimed.push(goalId);
  addLog(state, `Objectif accompli : +${goal.reward} € !`);
  return true;
}

function advanceDay(state, random = Math.random) {
  let sold = 0;
  let revenue = 0;
  PRODUCTS.forEach(product => {
    const quantity = Math.min(state.stock[product.id], demandFor(state, product));
    state.stock[product.id] -= quantity;
    sold += quantity;
    revenue += quantity * state.prices[product.id];
  });

  let dealerDemand = state.dealers * 2;
  for (const product of PRODUCTS) {
    const quantity = Math.min(state.stock[product.id], dealerDemand);
    state.stock[product.id] -= quantity;
    dealerDemand -= quantity;
    sold += quantity;
    revenue += quantity * state.prices[product.id];
  }

  state.cash += revenue;
  state.totalSales += sold;
  state.daySales = sold;
  state.reputation = clamp(state.reputation + (sold ? 2 : -3) + (state.dealers ? 1 : 0), 15, 100);
  addLog(state, sold ? `${sold} produits vendus pour ${revenue} €.` : 'Aucune vente : pense à produire ou ajuster les prix.');
  state.day += 1;
  state.event = EVENTS[Math.floor(clamp(random(), 0, 0.999999) * EVENTS.length)];
  state.dailyDemand = totalDemand(state);
  return { sold, revenue };
}

const PuffTycoonGame = { PRODUCTS, DEFAULT, createGame, demandFor, totalDemand, restock, changePrice, recruitDealer, goals, claimGoal, advanceDay };
if (typeof window !== 'undefined') window.PuffTycoonGame = PuffTycoonGame;
if (typeof module !== 'undefined') module.exports = PuffTycoonGame;
