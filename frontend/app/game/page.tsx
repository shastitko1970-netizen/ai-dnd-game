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

export default function GamePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [world, setWorld] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [narrative, setNarrative] = useState('');
  const [narrativeHistory, setNarrativeHistory] = useState<string[]>([]);
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRoll | null>(null);
  const [lastActionIntent, setLastActionIntent] = useState<ActionIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
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
          language: 'ru'
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
      setNarrativeHistory([data.data.narrative]);
      setCurrentActions([]);
      setGameStarted(true);
      setTurn(0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown error';
      setError(`Error: ${errorMsg}`);
      console.error('Game start error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (isLoading || !character || !sessionId) {
      if (!sessionId) setError('No active session');
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
          language: 'ru'
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
        const resultText = criticalHit ? 'CRIT!' : criticalMiss ? 'FAIL!' : success ? 'Success' : 'Failure';
        diceInfo = `\nRoll: d20[${roll}] + ${modifier} = ${total} [${resultText}]`;
      }

      const fullNarrative = narrative + playerLine + diceInfo + gmLine;
      setNarrative(fullNarrative);
      setCurrentActions(gameData.nextActions || []);
      setUserInput('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown error';
      setError(`Error: ${errorMsg}`);
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
        <p>Loading...</p>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
    );
  }

  const getAbilityMod = (score: number) => Math.floor((score - 10) / 2);
  const abilityNames = { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Narrative */}
        <div className="lg:col-span-2 space-y-6">
          {error && <div className="card bg-red-900 border-red-600 border"><p className="text-red-300 text-sm">{error}</p></div>}

          <div className="card h-96 flex flex-col border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-teal-400">Story</h2>
              <span className="text-xs text-slate-400">Turn: {turn}</span>
            </div>
            <div className="flex-1 overflow-y-auto text-slate-300 mb-4 p-4 bg-slate-900 rounded whitespace-pre-wrap text-sm font-mono border border-slate-700">
              {narrative}
              <div ref={narrativeEndRef} />
            </div>
          </div>

          {lastDiceRoll && (
            <div className="card bg-gradient-to-r from-orange-900 to-red-900 border-orange-500 border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold text-yellow-300">{lastDiceRoll.roll}</p><p className="text-xs text-orange-200">d20</p></div>
                <div><p className="text-2xl font-bold text-yellow-300">+{lastDiceRoll.modifier}</p><p className="text-xs text-orange-200">mod</p></div>
                <div><p className="text-2xl font-bold text-yellow-300">{lastDiceRoll.total}</p><p className="text-xs text-orange-200">total</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-700 text-center">
                <p className="text-sm font-bold text-yellow-300">
                  {lastDiceRoll.criticalHit ? 'CRITICAL SUCCESS!' : lastDiceRoll.criticalMiss ? 'CRITICAL FAILURE!' : lastDiceRoll.success ? 'Success' : 'Failure'}
                </p>
              </div>
            </div>
          )}

          {lastActionIntent && (
            <div className="card border border-slate-600 bg-slate-800">
              <p className="text-sm text-slate-300">
                <strong>Action:</strong> <span className="text-teal-300">{lastActionIntent.type}</span>
                {lastActionIntent.skill && <span className="text-slate-400"> - {lastActionIntent.skill}</span>}
              </p>
            </div>
          )}

          <div className="card border border-slate-600">
            <p className="text-slate-300 mb-4 font-semibold">Choose action:</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {currentActions.map((action, idx) => (
                <button key={idx} onClick={() => handleAction(action)} disabled={isLoading} className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold disabled:opacity-50 text-sm transition-colors whitespace-nowrap">
                  {action}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-slate-300 text-sm font-semibold">Custom action:</label>
              <div className="flex gap-2">
                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCustomAction()} placeholder="Enter your action..." disabled={isLoading} className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-500 disabled:opacity-50 text-sm focus:border-teal-500 focus:outline-none" />
                <button onClick={handleCustomAction} disabled={isLoading || !userInput.trim()} className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold disabled:opacity-50 whitespace-nowrap transition-colors">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Character Panel */}
        <div className="space-y-6">
          <div className="card sticky top-4 border border-slate-600">
            <h3 className="text-xl font-bold text-teal-400 mb-3">Character</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>Name:</strong> {character.name}</p>
              <p><strong>Race:</strong> {character.race}</p>
              <p><strong>Class:</strong> {character.class}</p>
              <p><strong>Level:</strong> {character.level || 1}</p>
              <hr className="border-slate-700 my-2" />
              <p><strong>HP:</strong> {character.hp?.current || 10}/{character.hp?.max || 10}</p>
              <p><strong>AC:</strong> {character.ac || 12}</p>
              <p><strong>Initiative:</strong> {character.initiative || 0}</p>
            </div>
          </div>

          {/* All 6 Abilities */}
          <div className="card border border-slate-600">
            <h4 className="font-bold text-teal-400 mb-3">Abilities</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(character.abilities || {}).map(([key, value]: [string, any]) => {
                const mod = getAbilityMod(value);
                const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                return (
                  <div key={key} className="flex justify-between items-center p-2 bg-slate-800 rounded text-slate-300">
                    <span className="font-semibold">{abilityNames[key as keyof typeof abilityNames] || key}</span>
                    <div className="text-right">
                      <span className="text-teal-300 font-bold">{value}</span>
                      <span className="text-slate-500 ml-2">({modStr})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="card border border-slate-600">
            <h4 className="font-bold text-teal-400 mb-3">Skills</h4>
            <div className="space-y-1 text-sm text-slate-300">
              {character.skills && Object.entries(character.skills).map(([skillName, skill]: [string, any]) => (
                <div key={skillName} className="flex justify-between p-2 bg-slate-800 rounded">
                  <span>{skillName}</span>
                  <span className="text-teal-300 font-semibold">+{skill.bonus || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="card border border-slate-600">
            <h4 className="font-bold text-teal-400 mb-2">Personality</h4>
            <div className="space-y-2 text-xs text-slate-300">
              {character.background && <div><p className="font-semibold text-teal-300">Background:</p><p className="text-slate-400">{character.background}</p></div>}
              {character.traits && character.traits.length > 0 && (
                <div>
                  <p className="font-semibold text-teal-300">Traits:</p>
                  <ul className="list-disc list-inside text-slate-400">
                    {character.traits.map((trait: string, i: number) => <li key={i}>{trait}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* World */}
          <div className="card border border-slate-600">
            <h4 className="font-bold text-teal-300 mb-2">World</h4>
            <p className="font-semibold text-teal-200 text-sm">{world?.name}</p>
            <p className="text-xs text-slate-400 mt-1">Difficulty: <strong>{world?.difficulty || 'Normal'}</strong></p>
          </div>

          {/* Session */}
          <div className="card border border-slate-600">
            <h4 className="text-sm font-bold text-teal-400 mb-3">Session</h4>
            <div className="space-y-1 text-xs text-slate-400 font-mono">
              <p><strong>ID:</strong> {sessionId.slice(0, 20)}...</p>
              <p><strong>Turn:</strong> {turn}</p>
              <p><strong>Status:</strong> {isLoading ? 'Processing...' : 'Active'}</p>
            </div>
          </div>

          <button onClick={() => { localStorage.clear(); router.push('/world-select'); }} className="w-full px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm transition-colors">
            Return to worlds
          </button>
        </div>
      </div>
    </div>
  );
}