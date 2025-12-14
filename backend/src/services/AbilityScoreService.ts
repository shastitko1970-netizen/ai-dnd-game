// backend/src/services/AbilityScoreService.ts
// Сложная система расчёта чарактеристик: Base (10) + Race Mod + Class Mod + Trait Mods + Player Assignment

import { rules } from '../data/dnd-5e-rules.js';
import type { Character, AbilityScores, AbilityScoringMethod } from '../types/index.js';

export interface AbilityCalculation {
  base: number; // 10
  raceBonus: number;
  classBonus: number;
  traitBonuses: number;
  playerAssignment: number;
  final: number;
}

export class AbilityScoreService {
  /**
   * Основной метод: рассчитать чарактеристики для нового персонажа
   */
  static calculateAbilityScores(
    race: string,
    traits: string[] = [],
    classType: string,
    method: AbilityScoringMethod = 'StandardArray',
    playerAssignments?: { [key: string]: number } // {STR: 15, DEX: 14, ...}
  ): {
    abilities: AbilityScores;
    calculations: { [key: string]: AbilityCalculation };
  } {
    const baseAbilities: AbilityScores = {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    };

    // Гет модификаторы из данных
    const raceData = rules.races[race as keyof typeof rules.races];
    const classData = rules.classes[classType as keyof typeof rules.classes];
    const traitDataList = traits.map(t => rules.traits[t as keyof typeof rules.traits]);

    // Метод расчёта
    let baseScores = this.getBaseScoresForMethod(method);
    if (playerAssignments) {
      baseScores = playerAssignments as AbilityScores;
    }

    const calculations: { [key: string]: AbilityCalculation } = {};
    const finalAbilities: AbilityScores = { ...baseScores };

    // Рассчитаем для каждой способности
    for (const ability of ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const) {
      const raceBonus = raceData?.abilityBonus[ability] || 0;
      const classBonus = classData?.abilityBonus?.[ability] || 0;

      let traitBonus = 0;
      for (const traitData of traitDataList) {
        if (traitData?.abilityBonus[ability]) {
          traitBonus += traitData.abilityBonus[ability];
        }
      }

      const base = baseScores[ability] || 10;
      const final = base + raceBonus + classBonus + traitBonus;

      calculations[ability] = {
        base,
        raceBonus,
        classBonus,
        traitBonuses: traitBonus,
        playerAssignment: 0,
        final,
      };

      finalAbilities[ability] = final;
    }

    return { abilities: finalAbilities, calculations };
  }

  /**
   * Получить базовые счёты для выбранного метода
   */
  private static getBaseScoresForMethod(method: AbilityScoringMethod): AbilityScores {
    switch (method) {
      case 'StandardArray':
        // 15, 14, 13, 12, 10, 8 - игрок распределяет
        return {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        }; // TEMP - актуально игрок выбирает
      case 'Random':
        return this.rollRandom4d6();
      case 'PointBuy':
        return {
          STR: 8,
          DEX: 8,
          CON: 8,
          INT: 8,
          WIS: 8,
          CHA: 8,
        }; // Начинаем с 8, игрок распределяет 27 очков
      case 'Fixed':
        return {
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        };
      default:
        return {
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        };
    }
  }

  /**
   * 4d6 drop lowest - классический D&D метод
   */
  private static rollRandom4d6(): AbilityScores {
    const roll = (times: number = 6) => {
      const rolls = [];
      for (let i = 0; i < times; i++) {
        const scores = [];
        for (let j = 0; j < 4; j++) {
          scores.push(Math.floor(Math.random() * 6) + 1); // d6: 1-6
        }
        // Отбросить наименьшие
        const sorted = scores.sort((a, b) => b - a).slice(0, 3);
        const sum = sorted.reduce((a, b) => a + b, 0);
        rolls.push(sum);
      }
      return rolls.sort((a, b) => b - a); // От высших к нижним
    };

    const scores = roll();
    return {
      STR: scores[0],
      DEX: scores[1],
      CON: scores[2],
      INT: scores[3],
      WIS: scores[4],
      CHA: scores[5],
    };
  }

  /**
   * Калькулятор модификатора
   * Модификатор = (Score - 10) / 2, но роундим
   */
  static calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Все модификаторы
   */
  static getAllModifiers(abilities: AbilityScores): { [key: string]: number } {
    return {
      STR: this.calculateModifier(abilities.STR),
      DEX: this.calculateModifier(abilities.DEX),
      CON: this.calculateModifier(abilities.CON),
      INT: this.calculateModifier(abilities.INT),
      WIS: this.calculateModifier(abilities.WIS),
      CHA: this.calculateModifier(abilities.CHA),
    };
  }

  /**
   * Point Buy - валидатор и рассчётчик
   */
  static pointBuyCost(score: number): number {
    const costs: { [key: number]: number } = {
      8: 0,
      9: 1,
      10: 2,
      11: 3,
      12: 4,
      13: 5,
      14: 7,
      15: 9,
    };
    return costs[score] || 0;
  }

  static isValidPointBuy(abilities: AbilityScores): { valid: boolean; spent: number; remaining: number } {
    const spent = Object.values(abilities).reduce((sum, score) => sum + this.pointBuyCost(score), 0);
    const remaining = 27 - spent;
    return {
      valid: spent <= 27 && Object.values(abilities).every(s => s >= 8 && s <= 15),
      spent,
      remaining,
    };
  }

  /**
   * Проверка: можно ли комбинировать от trait с race?
   */
  static canCombineTraitWithRace(race: string, trait: string): boolean {
    const traitData = rules.traits[trait as keyof typeof rules.traits];
    if (!traitData) return false;
    if (traitData.canCombineWith === 'All') return true;
    if (Array.isArray(traitData.canCombineWith)) {
      return traitData.canCombineWith.includes(race);
    }
    return false;
  }
}

export default AbilityScoreService;
