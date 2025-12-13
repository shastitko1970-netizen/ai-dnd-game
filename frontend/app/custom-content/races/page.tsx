'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCustomRaces, deleteCustomRace } from '@/lib/api';

export default function CustomRaces() {
  const [races, setRaces] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    try {
      const data = await fetchCustomRaces();
      setRaces(data.data);
    } catch (error) {
      console.error('Failed to load races:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteCustomRace(name);
      loadRaces();
    } catch (error) {
      console.error('Failed to delete race:', error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-teal-400 mb-8">Custom Races</h2>
      
      <Link href="/custom-content/races/create">
        <button className="btn btn-primary mb-6">+ Create New Race</button>
      </Link>

      {Object.keys(races).length === 0 ? (
        <p className="text-slate-300">No custom races yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(races).map(([name, race]: [string, any]) => (
            <div key={name} className="card">
              <h3 className="text-xl font-bold text-teal-400 mb-2">{name}</h3>
              <p className="text-slate-300 text-sm mb-4">{race.description}</p>
              <p className="text-slate-400 text-sm mb-4">Speed: {race.speed} ft</p>
              <div className="flex gap-2">
                <Link href={`/custom-content/races/${name}/edit`}>
                  <button className="btn btn-secondary text-sm">Edit</button>
                </Link>
                <button
                  onClick={() => handleDelete(name)}
                  className="btn btn-secondary text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
