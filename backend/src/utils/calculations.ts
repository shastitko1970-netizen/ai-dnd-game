/**
 * Calculate ability modifier from ability score
 * Formula: (score - 10) / 2, rounded down
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus based on character level
 */
export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Calculate AC from armor and DEX modifier
 */
export function calculateAC(baseAC: number, dexMod: number, hasArmor: boolean): number {
  if (!hasArmor) {
    return 10 + dexMod;
  }
  return baseAC + dexMod;
}

/**
 * Calculate HP based on hit die and CON modifier
 */
export function calculateHP(hitDie: number, level: number, conMod: number): number {
  let hp = hitDie + conMod;
  const perLevelHP = Math.max(1, Math.ceil(hitDie / 2) + conMod);
  for (let i = 2; i <= level; i++) {
    hp += perLevelHP;
  }
  return Math.max(1, hp);
}
