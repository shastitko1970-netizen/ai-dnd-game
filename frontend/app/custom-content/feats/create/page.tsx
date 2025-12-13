'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomFeat } from '@/lib/api';

export default function CreateFeat() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prerequisite: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCustomFeat(formData);
      router.push('/custom-content/feats');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create feat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-teal-400 mb-8">Create Custom Feat</h2>

      {error && <div className="card bg-red-900 text-red-200 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-slate-300 mb-2 font-bold">Feat Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Arcane Resilience"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-bold">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this feat does..."
            required
            className="w-full h-32"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-bold">Prerequisite (optional)</label>
          <input
            type="text"
            value={formData.prerequisite}
            onChange={(e) => setFormData({ ...formData, prerequisite: e.target.value })}
            placeholder="e.g., Ability Score 13 or higher"
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
            {loading ? 'Creating...' : 'Create Feat'}
          </button>
        </div>
      </form>
    </div>
  );
}
