'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';

const WORLDS = [
  { id: '1', name: 'Great Fantasy', description: 'A world of magic and wonder', difficulty: 'Medium', playerCount: 5 },
  { id: '2', name: 'Dark Fantasy', description: 'A grim and dangerous world', difficulty: 'Hard', playerCount: 8 },
  { id: '3', name: 'High Magic', description: 'Magic is commonplace', difficulty: 'Medium', playerCount: 4 },
];

export default function WorldSelect() {
  const router = useRouter();
  const setSelectedWorld = useGameStore(s => s.setSelectedWorld);

  const handleSelect = (world: any) => {
    setSelectedWorld(world);
    router.push('/character-create');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-teal-400 mb-8">Choose Your World</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WORLDS.map(world => (
          <div key={world.id} className="card hover:border-teal-500 cursor-pointer transition">
            <h3 className="text-2xl font-bold text-teal-400 mb-2">{world.name}</h3>
            <p className="text-slate-300 mb-2">{world.description}</p>
            <p className="text-sm text-slate-400 mb-4">
              Difficulty: <span className="font-bold text-orange-400">{world.difficulty}</span>
            </p>
            <button
              onClick={() => handleSelect(world)}
              className="btn btn-primary w-full mt-4"
            >
              Choose World
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
