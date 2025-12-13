import { Session, Character, CombatState, GameAction } from '../types/index.js';
import { RulesEngine } from './RulesEngine.js';

export class GameManager {
  private sessions: Map<string, Session> = new Map();
  private rulesEngine: RulesEngine;

  constructor(rulesEngine: RulesEngine) {
    this.rulesEngine = rulesEngine;
  }

  createSession(sessionId: string, character: Character, world: any): Session {
    const session: Session = {
      id: sessionId,
      character,
      world,
      startTime: new Date(),
      turn: 0,
      combatActive: false,
      combatState: null,
      narrative: this.generateInitialNarrative(world),
      actions: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | null {
    return this.sessions.get(sessionId) || null;
  }

  async processAction(sessionId: string, action: GameAction): Promise<any> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    let result: any = { success: true };

    if (action.type === 'attack') {
      const abilityMod = this.rulesEngine.calculateModifier(session.character.abilities.STR);
      const { roll, total, isCrit } = this.rulesEngine.rollAttack(abilityMod + 2);
      result.text = isCrit ? 'Critical hit! ' : `Attack roll: ${roll} + modifiers`;
      result.isCrit = isCrit;
    } else if (action.type === 'dodge') {
      result.text = 'You take the Dodge action';
    }

    session.actions.push(action);
    session.turn++;

    return result;
  }

  private generateInitialNarrative(world: any): string {
    const narratives: { [key: string]: string } = {
      'Great Fantasy': 'You awaken in a grand hall, sunlight streaming through tall windows. Adventure awaits...',
      'Dark Fantasy': 'Darkness surrounds you. The air is cold and oppressive. Danger lurks in every shadow...',
      'Sci-Fi': 'The hum of machinery fills your ears. Glowing panels line the walls.'
    };
    return narratives[world.name] || 'Your adventure begins...';
  }
}

export default GameManager;
