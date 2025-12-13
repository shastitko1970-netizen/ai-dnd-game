'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomClass } from '@/lib/api';

export default function CreateClass() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hitDice: 8,
    primaryAbility: 'STR',
    customFeatures: [] as Array<{ level: number; name: string; description: string }>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCustomClass(formData);
      router.push('/custom-content/classes');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-teal-400 mb-8">Create Custom Class</h2>

      {error && <div className="card bg-red-900 text-red-200 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-slate-300 mb-2 font-bold">Class Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Spellblade"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-bold">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your class..."
            className="w-full h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2 font-bold">Hit Die</label>
            <select
              value={formData.hitDice}
              onChange={(e) => setFormData({ ...formData, hitDice: parseInt(e.target.value) })}
              className="w-full"
            >
              <option value={6}>d6</option>
              <option value={8}>d8</option>
              <option value={10}>d10</option>
              <option value={12}>d12</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-2 font-bold">Primary Ability</label>
            <select
              value={formData.primaryAbility}
              onChange={(e) => setFormData({ ...formData, primaryAbility: e.target.value })}
              className="w-full"
            >
              <option>STR</option>
              <option>DEX</option>
              <option>CON</option>
              <option>INT</option>
              <option>WIS</option>
              <option>CHA</option>
            </select>
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
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </form>
    </div>
  );
}
