'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCustomFeats } from '@/lib/api';

export default function CustomFeats() {
  const [feats, setFeats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeats();
  }, []);

  const loadFeats = async () => {
    try {
      const data = await fetchCustomFeats();
      setFeats(data.data);
    } catch (error) {
      console.error('Failed to load feats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-teal-400 mb-8">Custom Feats</h2>
      
      <Link href="/custom-content/feats/create">
        <button className="btn btn-primary mb-6">+ Create New Feat</button>
      </Link>

      {Object.keys(feats).length === 0 ? (
        <p className="text-slate-300">No custom feats yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(feats).map(([name, feat]: [string, any]) => (
            <div key={name} className="card">
              <h3 className="text-xl font-bold text-teal-400 mb-2">{name}</h3>
              <p className="text-slate-300 text-sm">{feat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
