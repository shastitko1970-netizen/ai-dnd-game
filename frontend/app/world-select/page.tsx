'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const WORLDS = [
  { id: '1', name: 'Великая Фантазия', description: 'Мир магии и чудес', difficulty: 'Средняя' as const, playerCount: 5 },
  { id: '2', name: 'Тёмная Фантазия', description: 'Мрачный и опасный мир', difficulty: 'Сложная' as const, playerCount: 8 },
  { id: '3', name: 'Высокая Магия', description: 'Магия повсеместна', difficulty: 'Средняя' as const, playerCount: 4 },
];

export default function WorldSelect() {
  const router = useRouter();

  const handleSelect = (world: typeof WORLDS[0]) => {
    // Сохранить выбранный мир в localStorage
    localStorage.setItem('selectedWorld', JSON.stringify(world));
    router.push('/character-create');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-teal-400 mb-8">Выбери свой мир</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WORLDS.map(world => (
          <div key={world.id} className="card hover:border-teal-500 cursor-pointer transition">
            <h3 className="text-2xl font-bold text-teal-400 mb-2">{world.name}</h3>
            <p className="text-slate-300 mb-2">{world.description}</p>
            <p className="text-sm text-slate-400 mb-4">
              Сложность: <span className="font-bold text-orange-400">{world.difficulty}</span>
            </p>
            <button
              onClick={() => handleSelect(world)}
              className="btn btn-primary w-full mt-4"
            >
              Выбрать мир
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
