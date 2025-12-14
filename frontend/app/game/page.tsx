'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface DiceRoll {
  roll: number;
  modifier: number;
  total: number;
  success: boolean;
  criticalHit: boolean;
  criticalMiss: boolean;
}

interface ActionIntent {
  type: 'combat' | 'skill_check' | 'dialogue' | 'exploration' | 'freeform';
  skill?: string;
  difficulty?: number;
  requiresRoll: boolean;
}

interface GameResponse {
  sessionId: string;
  narrative: string;
  diceRoll: DiceRoll | null;
  actionIntent: ActionIntent;
  nextActions: string[];
  turn: number;
}

type AccordionSection = 'abilities' | 'skills' | 'personality' | 'world' | 'session' | null;

const ACTION_TYPE_NAMES: Record<string, string> = {
  combat: 'Бой',
  skill_check: 'Проверка навыка',
  dialogue: 'Диалог',
  exploration: 'Осколеждение',
  freeform: 'Свободное',
};

export default function GamePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [world, setWorld] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [narrative, setNarrative] = useState('');
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRoll | null>(null);
  const [lastActionIntent, setLastActionIntent] = useState<ActionIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<AccordionSection>(null);
  const narrativeEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (narrativeEndRef.current) {
      narrativeEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [narrative]);

  useEffect(() => {
    const char = localStorage.getItem('character');
    const w = localStorage.getItem('selectedWorld');

    if (!char || !w) {
      router.push('/world-select');
      return;
    }

    const charData = JSON.parse(char);
    const worldData = JSON.parse(w);

    setCharacter(charData);
    setWorld(worldData);
    startNewGame(charData, worldData);
  }, [router]);

  const startNewGame = async (char: any, w: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: char,
          world: w,
          language: 'ru',
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || !data.data.sessionId) {
        throw new Error('No sessionId received from backend');
      }

      setSessionId(data.data.sessionId);
      setNarrative(data.data.narrative);
      setCurrentActions(data.data.nextActions || []);
      setGameStarted(true);
      setTurn(0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown error';
      setError(`Ошибка: ${errorMsg}`);
      console.error('Game start error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (isLoading || !character || !sessionId) {
      if (!sessionId) setError('Нет активной сессии');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action,
          language: 'ru',
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json() as { data: GameResponse };

      if (!data.data) {
        throw new Error('Invalid response structure');
      }

      const gameData = data.data;

      setLastDiceRoll(gameData.diceRoll);
      setLastActionIntent(gameData.actionIntent);
      setTurn(gameData.turn);

      const playerLine = `\n[${character.name}]: ${action}`;
      const gmLine = `\n[GM]: ${gameData.narrative}`;

      let diceInfo = '';
      if (gameData.diceRoll) {
        const { roll, modifier, total, success, criticalHit, criticalMiss } = gameData.diceRoll;
        const resultText = criticalHit
          ? 'КНИТ!'
          : criticalMiss
            ? 'ПРОВАЛ!'
            : success
              ? 'Успех'
              : 'Неудача';
        diceInfo = `\n\n🎲 Кидок: к20[${roll}] + ${modifier} = ${total} [${resultText}]`;
      }

      const fullNarrative = narrative + playerLine + diceInfo + gmLine;
      setNarrative(fullNarrative);
      setCurrentActions(gameData.nextActions || []);
      setUserInput('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown error';
      setError(`Ошибка: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAction = async () => {
    if (!userInput.trim() || isLoading) return;
    await handleAction(userInput);
  };

  if (!character || !gameStarted) {
    return (
      <div className="text-center py-12 text-slate-300">
        <p>Загружаю...</p>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
    );
  }

  const getAbilityMod = (score: number) => Math.floor((score - 10) / 2);
  const abilityNames = {
    STR: 'Сила',
    DEX: 'Ловкость',
    CON: 'Выносливость',
    INT: 'Интеллект',
    WIS: 'Мудрость',
    CHA: 'Харизма',
  };

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <p className="text-slate-400 text-xs">ИМЕНА</p>
              <p className="text-teal-300 font-bold">{character.name}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">ГП</p>
              <p className="text-red-300 font-bold">
                {character.hp?.current || 10}/{character.hp?.max || 10}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">КО</p>
              <p className="text-blue-300 font-bold">{character.ac || 12}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">ХОД</p>
              <p className="text-yellow-300 font-bold">{turn}</p>
            </div>
            <div className="text-center hidden md:block">
              <p className="text-slate-400 text-xs">СТАТУС</p>
              <p className={`font-bold ${
                isLoading ? 'text-orange-300' : 'text-green-300'
              }`}>
                {isLoading ? 'Обработка...' : 'Активна'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NARRATIVE SECTION */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="card bg-red-900 border-red-600 border">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Story Box */}
            <div className="card border border-slate-600 flex flex-col h-[500px]">
              <h2 className="text-2xl font-bold text-teal-400 mb-4">Нарратив</h2>
              <div className="flex-1 overflow-y-auto text-slate-300 p-4 bg-slate-900 rounded whitespace-pre-wrap text-sm font-mono border border-slate-700">
                {narrative}
                <div ref={narrativeEndRef} />
              </div>
            </div>

            {/* Dice Roll Display */}
            {lastDiceRoll && (
              <div className="card bg-gradient-to-r from-orange-900 to-red-900 border-orange-500 border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-yellow-300">{lastDiceRoll.roll}</p>
                    <p className="text-xs text-orange-200">к20</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-300">+{lastDiceRoll.modifier}</p>
                    <p className="text-xs text-orange-200">мод</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-300">{lastDiceRoll.total}</p>
                    <p className="text-xs text-orange-200">итого</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-700 text-center">
                  <p className="text-sm font-bold text-yellow-300">
                    {lastDiceRoll.criticalHit
                      ? 'КРИТИЧЕСКИЙ УСПЕХ!'
                      : lastDiceRoll.criticalMiss
                        ? 'КРИТИЧЕСКАЯ ОШИБКА!'
                        : lastDiceRoll.success
                          ? 'Успех'
                          : 'Неудача'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Intent */}
            {lastActionIntent && (
              <div className="card border border-slate-600 bg-slate-800">
                <p className="text-sm text-slate-300">
                  <strong>Новое действие:</strong>{' '}
                  <span className="text-teal-300">
                    {ACTION_TYPE_NAMES[lastActionIntent.type] || lastActionIntent.type}
                  </span>
                  {lastActionIntent.skill && (
                    <span className="text-slate-400"> - {lastActionIntent.skill}</span>
                  )}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="card border border-slate-600">
              {currentActions && currentActions.length > 0 ? (
                <>
                  <p className="text-slate-300 mb-4 font-semibold">Как ты поступишь?</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {currentActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action)}
                        disabled={isLoading}
                        className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold disabled:opacity-50 text-sm transition-colors whitespace-nowrap"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <label className="block text-slate-300 text-sm font-semibold">
                  Описание действия:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomAction()}
                    placeholder="Кто им я? Что я делаю?"
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-500 disabled:opacity-50 text-sm focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    onClick={handleCustomAction}
                    disabled={isLoading || !userInput.trim()}
                    className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold disabled:opacity-50 whitespace-nowrap transition-colors"
                  >
                    ГО!
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR WITH ACCORDIONS */}
          <div className="space-y-3">
            {/* Abilities */}
            <div className="card border border-slate-600">
              <button
                onClick={() => toggleAccordion('abilities')}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 rounded transition"
              >
                <h3 className="text-lg font-bold text-teal-400">Умения</h3>
                <span className="text-teal-400 text-xl">
                  {openAccordion === 'abilities' ? '▲' : '▼'}
                </span>
              </button>
              {openAccordion === 'abilities' && (
                <div className="border-t border-slate-700 p-4 space-y-2">
                  {Object.entries(character.abilities || {}).map(([key, value]: [string, any]) => {
                    const mod = getAbilityMod(value);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center p-2 bg-slate-800 rounded text-slate-300"
                      >
                        <span className="font-semibold text-sm">
                          {abilityNames[key as keyof typeof abilityNames] || key}
                        </span>
                        <div className="text-right">
                          <span className="text-teal-300 font-bold text-sm">{value}</span>
                          <span className="text-slate-500 ml-2 text-xs">({modStr})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="card border border-slate-600">
              <button
                onClick={() => toggleAccordion('skills')}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 rounded transition"
              >
                <h4 className="font-bold text-teal-400">Навыки</h4>
                <span className="text-teal-400">{openAccordion === 'skills' ? '▲' : '▼'}</span>
              </button>
              {openAccordion === 'skills' && (
                <div className="border-t border-slate-700 p-4 space-y-1">
                  {character.skills && Object.entries(character.skills).map(([skillName, skill]: [string, any]) => (
                    <div key={skillName} className="flex justify-between p-2 bg-slate-800 rounded text-sm">
                      <span className="text-slate-300">{skillName}</span>
                      <span className="text-teal-300 font-semibold">+{skill.bonus || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personality */}
            <div className="card border border-slate-600">
              <button
                onClick={() => toggleAccordion('personality')}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 rounded transition"
              >
                <h4 className="font-bold text-teal-400">Личность</h4>
                <span className="text-teal-400">{openAccordion === 'personality' ? '▲' : '▼'}</span>
              </button>
              {openAccordion === 'personality' && (
                <div className="border-t border-slate-700 p-4 space-y-3 text-xs">
                  {character.background && (
                    <div>
                      <p className="font-semibold text-teal-300 mb-1">Основа персонажа:</p>
                      <p className="text-slate-400">{character.background}</p>
                    </div>
                  )}
                  {character.traits && character.traits.length > 0 && (
                    <div>
                      <p className="font-semibold text-teal-300 mb-1">Особенности:</p>
                      <ul className="list-disc list-inside text-slate-400 space-y-1">
                        {character.traits.map((trait: string, i: number) => (
                          <li key={i}>{trait}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {character.backstory && (
                    <div>
                      <p className="font-semibold text-teal-300 mb-1">Предыстория:</p>
                      <p className="text-slate-400 line-clamp-4">{character.backstory}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* World */}
            <div className="card border border-slate-600">
              <button
                onClick={() => toggleAccordion('world')}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 rounded transition"
              >
                <h4 className="font-bold text-teal-400">Мир</h4>
                <span className="text-teal-400">{openAccordion === 'world' ? '▲' : '▼'}</span>
              </button>
              {openAccordion === 'world' && (
                <div className="border-t border-slate-700 p-4 text-sm">
                  <p className="font-semibold text-teal-200 mb-2">{world?.name}</p>
                  <p className="text-slate-400 mb-2">{world?.description}</p>
                  <p className="text-xs text-slate-500">
                    Сложность: <strong>{world?.difficulty || 'Нормальная'}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Session */}
            <div className="card border border-slate-600">
              <button
                onClick={() => toggleAccordion('session')}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 rounded transition"
              >
                <h4 className="font-bold text-teal-400">Сессия</h4>
                <span className="text-teal-400">{openAccordion === 'session' ? '▲' : '▼'}</span>
              </button>
              {openAccordion === 'session' && (
                <div className="border-t border-slate-700 p-4 space-y-1 text-xs text-slate-400 font-mono">
                  <p>
                    <strong>ID:</strong> {sessionId.slice(0, 20)}...
                  </p>
                  <p>
                    <strong>Ход:</strong> {turn}
                  </p>
                  <p>
                    <strong>Статус:</strong> {isLoading ? 'Обработка...' : 'Активна'}
                  </p>
                </div>
              )}
            </div>

            {/* Return Button */}
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/world-select');
              }}
              className="w-full px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm transition-colors"
            >
              Вернуться на основною
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}