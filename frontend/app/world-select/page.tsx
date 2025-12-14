'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const WORLDS = [
  {
    id: '1',
    name: 'Великая Фантазия',
    description: 'Классический мир магии и чудес. Дружелюбный рейм для начинающих.',
    difficulty: 'Средняя' as const,
    playerCount: 5,
    features: ['🏰 Замки и города', '🧙 Маги', '⚔️ Приключения'],
  },
  {
    id: '2',
    name: 'Тёмная Фантазия',
    description: 'Мрачный и опасный мир, где каждое решение имеет последствия.',
    difficulty: 'Сложная' as const,
    playerCount: 8,
    features: ['🌑 Темнота везде', '💀 Монстры', '⚠️ Опасный рейм'],
  },
  {
    id: '3',
    name: 'Высокая Магия',
    description: 'Мир, насыщенный магией. Волшебники и артефакты повсюду.',
    difficulty: 'Средняя' as const,
    playerCount: 4,
    features: ['✨ Магия везде', '📚 Артефакты', '🔮 Магические школы'],
  },
  {
    id: '4',
    name: 'Киберпанк Магия',
    description: 'Слияние технологии и магии. Футуристический рейм с древней силой.',
    difficulty: 'Сложная' as const,
    playerCount: 6,
    features: ['🤖 Киберы', '⚡ Энергия', '🌃 Мегаполисы'],
  },
  {
    id: '5',
    name: 'Лесной Рейм',
    description: 'Природный мир лесов и древних сил. Легендарный рейм.',
    difficulty: 'Средняя' as const,
    playerCount: 5,
    features: ['🌲 Природа', '🧝 Эльфы', '🐉 Легендарные существа'],
  },
];

export default function WorldSelect() {
  const router = useRouter();
  const [showCustom, setShowCustom] = useState(false);
  const [customWorld, setCustomWorld] = useState({
    name: '',
    description: '',
    difficulty: 'Средняя' as const,
  });

  const handleSelect = (world: typeof WORLDS[0]) => {
    localStorage.setItem('selectedWorld', JSON.stringify(world));
    router.push('/character-create');
  };

  const handleCustomWorld = () => {
    if (!customWorld.name.trim()) {
      alert('Введи название мира');
      return;
    }
    localStorage.setItem('selectedWorld', JSON.stringify(customWorld));
    router.push('/character-create');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-teal-400 mb-2">Выбери свой мир</h1>
      <p className="text-slate-400 mb-8">Каждый мир имеет свою историю и сложность</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {WORLDS.map(world => (
          <div
            key={world.id}
            className="card hover:border-teal-500 cursor-pointer transition transform hover:scale-105"
            onClick={() => handleSelect(world)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-teal-400">{world.name}</h3>
              <span className="text-xs px-2 py-1 bg-orange-900 text-orange-200 rounded">
                {world.difficulty}
              </span>
            </div>
            <p className="text-slate-300 mb-4 text-sm">{world.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {world.features.map((feature, i) => (
                <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={() => handleSelect(world)}
            >
              Выбрать мир
            </button>
          </div>
        ))}
      </div>

      {/* Custom World */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-teal-400 mb-4">Или создай свой мир</h2>
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="btn btn-secondary w-full"
          >
            + Создать кастомный мир
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Название мира</label>
              <input
                type="text"
                value={customWorld.name}
                onChange={(e) =>
                  setCustomWorld({ ...customWorld, name: e.target.value })
                }
                placeholder="Придумай название"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">
                Описание
              </label>
              <textarea
                value={customWorld.description}
                onChange={(e) =>
                  setCustomWorld({
                    ...customWorld,
                    description: e.target.value,
                  })
                }
                placeholder="Опиши свой мир"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">
                Сложность
              </label>
              <select
                value={customWorld.difficulty}
                onChange={(e) =>
                  setCustomWorld({
                    ...customWorld,
                    difficulty: e.target.value as 'Средняя' | 'Сложная',
                  })
                }
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-teal-400 focus:outline-none"
              >
                <option>Лёгкая</option>
                <option>Средняя</option>
                <option>Сложная</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCustomWorld}
                className="btn btn-primary flex-1"
              >
                Создать
              </button>
              <button
                onClick={() => setShowCustom(false)}
                className="btn btn-secondary flex-1"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}