// Менеджер игрового состояния и нарратива

export interface GameState {
  sessionId: string;
  character: any;
  world: any;
  narrative: string;
  narrativeHistory: string[];
  currentActions: string[];
  isLoadingResponse: boolean;
  gameLog: GameLogEntry[];
}

export interface GameLogEntry {
  type: 'narrative' | 'action' | 'result' | 'system';
  content: string;
  timestamp: Date;
}

export interface ActionResult {
  success: boolean;
  narrative: string;
  nextActions: string[];
  effects?: Record<string, any>;
}

// Генерируем случайные акции в зависимости от контекста
export function generateDynamicActions(context: string): string[] {
  const baseActions = [
    'Атаковать',
    'Уклониться',
    'Осмотреть',
    'Поговорить',
    'Пютнять
  ];

  // Сыффлируем акции в зависимости от контекста
  const contextLower = context.toLowerCase();
  const contextActions: Record<string, string[]> = {
    'бой': ['Атаковать', 'Отступить', 'Парировать'],
    'отворот': ['Открыть', 'Повалить', 'Осмотреть'],
    'стана': ['Осмотреть', 'Взать', 'Уйти'],
    'нпс': ['Поговорить', 'Прыжнуть', 'Угрожать'],
  };

  for (const [key, actions] of Object.entries(contextActions)) {
    if (contextLower.includes(key)) {
      return actions;
    }
  }

  // По умолчанию вернуть мешано-перемешанные
  return baseActions.sort(() => Math.random() - 0.5).slice(0, 4);
}

// Как исследуются типы действий
export function categorizeAction(action: string): 'combat' | 'social' | 'exploration' | 'magic' | 'custom' {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('ата') || actionLower.includes('ору')) return 'combat';
  if (actionLower.includes('гов') || actionLower.includes('убе')) return 'social';
  if (actionLower.includes('осм') || actionLower.includes('иссл')) return 'exploration';
  if (actionLower.includes('закл') || actionLower.includes('маг')) return 'magic';
  return 'custom';
}
