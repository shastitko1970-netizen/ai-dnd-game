'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomRace } from '@/lib/api';

export default function EditRace({ params }: { params: { name: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    speed: 30,
    abilityBonus: {
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateCustomRace(decodeURIComponent(params.name), formData);
      router.push('/custom-content/races');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update race');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-teal-400 mb-8">Edit Race: {decodeURIComponent(params.name)}</h2>

      {error && <div className="card bg-red-900 text-red-200 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-6">
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
