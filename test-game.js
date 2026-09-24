const assert = require('node:assert/strict');
const Game = require('./game.js');

const game = Game.createGame();
assert.equal(game.dailyDemand, Game.totalDemand(game));
assert.equal(Game.restock(game, 'brise'), true);
assert.equal(game.stock.brise, 13);
assert.equal(game.cash, 85);
assert.equal(Game.changePrice(game, 'brise', -100), true);
assert.equal(game.prices.brise, 9);
assert.equal(Game.changePrice(game, 'missing', 1), false);

const noStock = Game.createGame({ cash: 999, stock: { brise: 0, lune: 0, soleil: 0 }, dealers: 4 });
const emptyDay = Game.advanceDay(noStock, () => 0);
assert.deepEqual(emptyDay, { sold: 0, revenue: 0 });
assert.deepEqual(noStock.stock, { brise: 0, lune: 0, soleil: 0 });

const dealerGame = Game.createGame({ cash: 999, stock: { brise: 0, lune: 1, soleil: 3 }, dealers: 3 });
const result = Game.advanceDay(dealerGame, () => 0.5);
assert.equal(result.sold, 4);
assert.equal(result.revenue, 114);
assert.deepEqual(dealerGame.stock, { brise: 0, lune: 0, soleil: 0 });

const rewards = Game.createGame({ totalSales: 25 });
assert.equal(Game.claimGoal(rewards, 'sales'), true);
assert.equal(rewards.cash, 195);
assert.equal(Game.claimGoal(rewards, 'sales'), false);
console.log('Game engine checks passed');
