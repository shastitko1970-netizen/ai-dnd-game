'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomRace } from '@/lib/api';

export default function CreateRace() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: 'Medium',
    speed: 30,
    abilityBonus: {
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
    },
    features: [''],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCustomRace(formData);
      router.push('/custom-content/races');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create race');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-teal-400 mb-8">Create Custom Race</h2>

      {error && <div className="card bg-red-900 text-red-200 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-slate-300 mb-2 font-bold">Race Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Shadow Elf"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-bold">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your race..."
            className="w-full h-24"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-bold">Size</label>
          <select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full"
          >
            <option>Tiny</option>
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-bold">Speed (feet)</label>
          <input
            type="number"
            value={formData.speed}
            onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) })}
            min="20"
            max="40"
            className="w-full"
          />
        </div>

        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-bold text-teal-400 mb-4">Ability Bonuses</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(formData.abilityBonus).map(([ability, bonus]) => (
              <div key={ability}>
                <label className="block text-slate-300 mb-2">{ability}</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setFormData({
                    ...formData,
                    abilityBonus: { ...formData.abilityBonus, [ability]: parseInt(e.target.value) }
                  })}
                  min="-2"
                  max="2"
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Creating...' : 'Create Race'}
          </button>
        </div>
      </form>
    </div>
  );
}
