// Общие помощные функции

/**
 * Пытка 2d6
 */
export function rollDice(sides: number = 6, count: number = 1): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

/**
 * Парсинг формата костей "2d6+3"
 */
export function parseDiceString(diceStr: string): { count: number; sides: number; bonus: number } {
  const match = diceStr.match(/(\d+)d(\d+)(?:\+(-?\d+))?/);
  if (!match) return { count: 1, sides: 6, bonus: 0 };

  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    bonus: parseInt(match[3] || '0', 10),
  };
}

/**
 * Рындирует квантитет модификатора
 */
export function getAbilityModifier(ability: number): number {
  return Math.floor((ability - 10) / 2);
}

/**
 * Отключит класс CSS на основе условия
 */
export function classNames(...args: (string | boolean | undefined | null)[]): string {
  return args.filter((x) => typeof x === 'string').join(' ');
}

/**
 * Используется для сохранения в localStorage и потом сравнения
 */
export function storageKey(key: string): string {
  return `dnd-game-${key}`;
}

/**
 * Форматирует дату для отображения
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ru-RU');
}
