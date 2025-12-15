'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '../game-styles.css';

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

interface Message {
  id: string;
  author: 'dm' | 'player';
  type: 'narrative' | 'action' | 'roll';
  text: string;
  rollResult?: DiceRoll;
  timestamp: number;
}

export default function GamePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [world, setWorld] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessages([{
        id: `msg-init-${Date.now()}`,
        author: 'dm',
        type: 'narrative',
        text: data.data.narrative,
        timestamp: Date.now(),
      }]);
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

    const playerMsg: Message = {
      id: `msg-player-${Date.now()}`,
      author: 'player',
      type: 'action',
      text: `Ты ${action.toLowerCase()}`,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, playerMsg]);
    setUserInput('');
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

      setTurn(gameData.turn);

      // Бросок если есть
      if (gameData.diceRoll) {
        const rollMsg: Message = {
          id: `msg-roll-${Date.now()}`,
          author: 'player',
          type: 'roll',
          text: '',
          rollResult: gameData.diceRoll,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, rollMsg]);
      }

      // Ответ мастера
      const dmMsg: Message = {
        id: `msg-dm-${Date.now()}`,
        author: 'dm',
        type: 'narrative',
        text: gameData.narrative,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, dmMsg]);

      setCurrentActions(gameData.nextActions || []);
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
      <div className="game-page game-page--loading">
        <p>Загружаю...</p>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="game-page">
      {/* HEADER */}
      <header className="game-header">
        <div className="game-header__left">
          <h1 className="game-header__title">AI D&D</h1>
        </div>
        <div className="game-header__stats">
          <div className="stat">
            <span className="stat__label">ИМЕНА</span>
            <span className="stat__value">{character.name}</span>
          </div>
          <div className="stat">
            <span className="stat__label">ГП</span>
            <span className="stat__value">{character.hp?.current || 10}/{character.hp?.max || 10}</span>
          </div>
          <div className="stat">
            <span className="stat__label">КО</span>
            <span className="stat__value">{character.ac || 12}</span>
          </div>
          <div className="stat">
            <span className="stat__label">ХОД</span>
            <span className="stat__value">{turn}</span>
          </div>
          <div className="stat stat--active">
            <span className="stat__label">СТАТУС</span>
            <span className="stat__value">{isLoading ? 'Обработка...' : 'Активна'}</span>
          </div>
        </div>
        <div className="game-header__nav">
          <button className="btn btn--outline btn--sm" onClick={() => {
            localStorage.clear();
            router.push('/');
          }}>Дом</button>
          <button className="btn btn--outline btn--sm">Играть</button>
          <button className="btn btn--outline btn--sm">Контент</button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="game-container">
        {/* LEFT SIDEBAR - WORLD INFO */}
        <aside className="game-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card__title">Мир: {world?.name}</h3>
            <p className="sidebar-card__text">{world?.description?.substring(0, 150)}...</p>
          </div>
        </aside>

        {/* CENTER - CHAT */}
        <main className="game-main">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message chat-message--${msg.author}`}>
                {msg.type === 'roll' && msg.rollResult ? (
                  <div className="chat-message__roll">
                    <div className="roll-result">
                      <div className="roll-item">
                        <div className="roll-label">К20</div>
                        <div className="roll-value">{msg.rollResult.roll}</div>
                      </div>
                      <div className="roll-item">
                        <div className="roll-label">мод</div>
                        <div className="roll-value">+{msg.rollResult.modifier}</div>
                      </div>
                      <div className="roll-item roll-item--total">
                        <div className="roll-label">итого</div>
                        <div className="roll-value">{msg.rollResult.total}</div>
                      </div>
                    </div>
                    <div className={`roll-status roll-status--${msg.rollResult.success ? 'success' : 'failure'}`}>
                      {msg.rollResult.criticalHit
                        ? '✓ КРИТИЧЕСКИЙ УСПЕХ'
                        : msg.rollResult.criticalMiss
                          ? '✗ КРИТИЧЕСКИЙ ПРОВАЛ'
                          : msg.rollResult.success
                            ? '✓ УСПЕХ'
                            : '✗ НЕУДАЧА'}
                    </div>
                  </div>
                ) : (
                  <div className="chat-message__text">{msg.text}</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* CONTROLS */}
          <div className="game-controls">
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {currentActions && currentActions.length > 0 && (
              <div className="actions-panel">
                <p className="actions-panel__title">Как ты поступишь?</p>
                <div className="actions-buttons">
                  {currentActions.map((action, idx) => (
                    <button
                      key={idx}
                      className="btn--action"
                      onClick={() => handleAction(action)}
                      disabled={isLoading}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="action-input-panel">
              <label htmlFor="action-input" className="action-label">
                Описание действия:
              </label>
              <div className="action-input-wrapper">
                <input
                  id="action-input"
                  type="text"
                  className="action-input"
                  placeholder="Кто им я? Что я делаю?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleCustomAction();
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleCustomAction}
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? 'Обработка...' : 'ГО!'}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR - CHARACTER SHEET */}
        <aside className="game-sidebar">
          <div className="char-sheet">
            <h3 className="char-sheet__title">{character.name}</h3>
            <div className="char-sheet__row">
              <span className="char-sheet__label">Раса:</span>
              <span className="char-sheet__value">{character.race || 'Неизв'}</span>
            </div>
            <div className="char-sheet__row">
              <span className="char-sheet__label">Класс:</span>
              <span className="char-sheet__value">{character.class || 'Неизв'}</span>
            </div>
            {character.background && (
              <div className="char-sheet__row">
                <span className="char-sheet__label">Основа:</span>
                <span className="char-sheet__value">{character.background.substring(0, 20)}...</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}