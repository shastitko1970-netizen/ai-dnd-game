'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCustomClasses } from '@/lib/api';

export default function CustomClasses() {
  const [classes, setClasses] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await fetchCustomClasses();
      setClasses(data.data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-teal-400 mb-8">Custom Classes</h2>
      
      <Link href="/custom-content/classes/create">
        <button className="btn btn-primary mb-6">+ Create New Class</button>
      </Link>

      {Object.keys(classes).length === 0 ? (
        <p className="text-slate-300">No custom classes yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(classes).map(([name, clazz]: [string, any]) => (
            <div key={name} className="card">
              <h3 className="text-xl font-bold text-teal-400 mb-2">{name}</h3>
              <p className="text-slate-400 text-sm">Hit Die: d{clazz.hitDice}</p>
              <p className="text-slate-400 text-sm">Primary Ability: {clazz.primaryAbility}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
