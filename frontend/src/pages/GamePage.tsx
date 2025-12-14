import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GamePage.css';

interface Message {
  id: string;
  author: 'dm' | 'player';
  type: 'narrative' | 'action' | 'roll';
  text: string;
  rollResult?: {
    d20: number;
    mod: number;
    total: number;
    success: boolean;
  };
  timestamp: number;
}

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  hp: number;
  maxHp: number;
  ac: number;
  turn: number;
  background?: string;
}

interface GameState {
  sessionId: string;
  character: Character;
  world: {
    name: string;
    description: string;
  };
  currentActions: string[];
  isProcessing: boolean;
}

const GamePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customAction, setCustomAction] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка сессии
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/game/session/${sessionId}`);
        
        setGameState(response.data);
        
        // Инициальное сообщение от мастера
        setMessages([{
          id: `msg-init`,
          author: 'dm',
          type: 'narrative',
          text: response.data.initialNarrative || `Добро пожаловать в ${response.data.world.name}, ${response.data.character.name}!`,
          timestamp: Date.now(),
        }]);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки сессии');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) loadSession();
  }, [sessionId]);

  // Обработка действия
  const handleAction = async (actionText: string) => {
    if (!gameState || !actionText.trim()) return;

    const actionMessage: Message = {
      id: `msg-player-${Date.now()}`,
      author: 'player',
      type: 'action',
      text: `Ты ${actionText.toLowerCase()}`,
      timestamp: Date.now(),
    };

    // Сразу добавляем действие игрока в чат
    setMessages(prev => [...prev, actionMessage]);
    setCustomAction('');
    
    try {
      setGameState(prev => prev ? { ...prev, isProcessing: true } : null);

      const response = await api.post('/game/action', {
        sessionId,
        action: actionText,
        characterId: gameState.character.id,
      });

      // Сообщение о броске если был
      if (response.data.roll) {
        const rollMessage: Message = {
          id: `msg-roll-${Date.now()}`,
          author: 'player',
          type: 'roll',
          text: ``,
          rollResult: response.data.roll,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, rollMessage]);
      }

      // Ответ мастера
      if (response.data.narrative) {
        const dmMessage: Message = {
          id: `msg-dm-${Date.now()}`,
          author: 'dm',
          type: 'narrative',
          text: response.data.narrative,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, dmMessage]);
      }

      // Обновляем стейт
      setGameState({
        ...gameState,
        currentActions: response.data.nextActions || [],
        character: {
          ...gameState.character,
          turn: gameState.character.turn + 1,
        },
        isProcessing: false,
      });
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-error-${Date.now()}`,
        author: 'dm',
        type: 'narrative',
        text: `⚠️  Ошибка: ${err.response?.data?.message || 'Не удалось обработать действие'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setGameState(prev => prev ? { ...prev, isProcessing: false } : null);
    }
  };

  const handleQuickAction = (action: string) => {
    handleAction(action);
  };

  if (isLoading) {
    return <div className="game-page game-page--loading">Загрузка игры...</div>;
  }

  if (error) {
    return (
      <div className="game-page game-page--error">
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn--primary">
          Вернуться на главную
        </button>
      </div>
    );
  }

  if (!gameState) {
    return <div className="game-page">Ошибка загрузки</div>;
  }

  const { character, world, currentActions } = gameState;

  return (
    <div className="game-page">
      {/* Шапка со статом персонажа */}
      <header className="game-header">
        <div className="game-header__left">
          <h1 className="game-header__title">AI D&D</h1>
        </div>
        <div className="game-header__character">
          <div className="char-stat">
            <span className="char-stat__label">ИМЕНА</span>
            <span className="char-stat__value char-stat__value--name">{character.name}</span>
          </div>
          <div className="char-stat">
            <span className="char-stat__label">ГП</span>
            <span className="char-stat__value">{character.hp}/{character.maxHp}</span>
          </div>
          <div className="char-stat">
            <span className="char-stat__label">КО</span>
            <span className="char-stat__value">{character.ac}</span>
          </div>
          <div className="char-stat">
            <span className="char-stat__label">ХОД</span>
            <span className="char-stat__value">{character.turn}</span>
          </div>
          <div className="char-stat">
            <span className="char-stat__label">СТАТУС</span>
            <span className="char-stat__value char-stat__value--active">Активна</span>
          </div>
        </div>
        <div className="game-header__nav">
          <button className="btn btn--outline btn--sm">Дом</button>
          <button className="btn btn--outline btn--sm">Играть</button>
          <button className="btn btn--outline btn--sm">Контент</button>
        </div>
      </header>

      {/* Основной контент */}
      <div className="game-container">
        {/* Левая панель - Инфо */}
        <aside className="game-sidebar game-sidebar--left">
          <div className="sidebar-card">
            <h3 className="sidebar-card__title">Мир: {world.name}</h3>
            <p className="sidebar-card__text">{world.description.substring(0, 200)}...</p>
          </div>
        </aside>

        {/* Центр - Нарратив как чат */}
        <main className="game-main">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message chat-message--${msg.author}`}
              >
                {msg.type === 'roll' && msg.rollResult ? (
                  <div className="chat-message__roll">
                    <div className="roll-result">
                      <div className="roll-item">
                        <div className="roll-label">К20</div>
                        <div className="roll-value">{msg.rollResult.d20}</div>
                      </div>
                      <div className="roll-item">
                        <div className="roll-label">мод</div>
                        <div className="roll-value">+{msg.rollResult.mod}</div>
                      </div>
                      <div className="roll-item roll-item--total">
                        <div className="roll-label">итого</div>
                        <div className="roll-value">{msg.rollResult.total}</div>
                      </div>
                    </div>
                    <div className={`roll-status roll-status--${msg.rollResult.success ? 'success' : 'failure'}`}>
                      {msg.rollResult.success ? '✓ УСПЕХ' : '✗ НЕУДАЧА'}
                    </div>
                  </div>
                ) : (
                  <div className="chat-message__text">{msg.text}</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Экшены и ввод */}
          <div className="game-controls">
            {/* Кнопки действий */}
            {currentActions && currentActions.length > 0 && (
              <div className="actions-panel">
                <p className="actions-panel__title">Как ты поступишь?</p>
                <div className="actions-buttons">
                  {currentActions.map((action, idx) => (
                    <button
                      key={idx}
                      className="btn btn--action"
                      onClick={() => handleQuickAction(action)}
                      disabled={gameState.isProcessing}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ввод действия */}
            <div className="action-input-panel">
              <label htmlFor="action-input" className="action-label">
                Что ты делаешь?
              </label>
              <div className="action-input-wrapper">
                <input
                  id="action-input"
                  type="text"
                  className="action-input"
                  placeholder="Опиши своё действие..."
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !gameState.isProcessing) {
                      handleAction(customAction);
                    }
                  }}
                  disabled={gameState.isProcessing}
                />
                <button
                  className="btn btn--primary"
                  onClick={() => handleAction(customAction)}
                  disabled={gameState.isProcessing || !customAction.trim()}
                >
                  {gameState.isProcessing ? 'Обработка...' : 'Старт'}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Правая панель - Характеристики */}
        <aside className="game-sidebar game-sidebar--right">
          <div className="char-sheet">
            <h3 className="char-sheet__title">{character.name}</h3>
            <div className="char-sheet__row">
              <span className="char-sheet__label">Раса:</span>
              <span className="char-sheet__value">{character.race}</span>
            </div>
            <div className="char-sheet__row">
              <span className="char-sheet__label">Класс:</span>
              <span className="char-sheet__value">{character.class}</span>
            </div>
            {character.background && (
              <div className="char-sheet__row">
                <span className="char-sheet__label">Предыстория:</span>
                <span className="char-sheet__value">{character.background}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GamePage;