/**
 * Roll a d20
 */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Roll dX (d4, d6, d8, d10, d12, d20, etc.)
 */
export function rollDX(sides: number): number {
  if (sides < 1) throw new Error('Dice sides must be at least 1');
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice (e.g., "2d8", "3d6")
 */
export function rollDice(notation: string): number {
  const match = notation.match(/(\d+)d(\d+)/);
  if (!match) throw new Error(`Invalid dice notation: ${notation}`);

  const [, numDiceStr, sidesStr] = match;
  const numDice = parseInt(numDiceStr);
  const sides = parseInt(sidesStr);

  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += rollDX(sides);
  }
  return total;
}

/**
 * Roll damage (e.g., "2d8+3")
 */
export function rollDamage(notation: string): number {
  const match = notation.match(/(\d+)d(\d+)(?:\+(\d+))?/);
  if (!match) throw new Error(`Invalid damage notation: ${notation}`);

  const [, numDiceStr, sidesStr, bonusStr] = match;
  const numDice = parseInt(numDiceStr);
  const sides = parseInt(sidesStr);
  const bonus = bonusStr ? parseInt(bonusStr) : 0;

  let total = bonus;
  for (let i = 0; i < numDice; i++) {
    total += rollDX(sides);
  }
  return total;
}
