// Shop currency: how many coins the player earns and when

export const COIN_WIN = 10; // for winning a game
export const COIN_LOSS = 3; // for losing a game (you still tried)
export const COIN_SEASON = 50; // for finishing a season
export const COIN_TITLE = 100; // for winning the championship

// Coins for one game
export function gameCoins(won: boolean): number {
  return won ? COIN_WIN : COIN_LOSS;
}
