'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CustomContent() {
  const [tab, setTab] = useState('races');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-teal-400 mb-8">Custom Content Hub</h2>

      <div className="flex gap-4 mb-8">
        {(['races', 'classes', 'feats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded font-bold transition ${
              tab === t ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'races' && (
        <div>
          <Link href="/custom-content/races">
            <button className="btn btn-primary mb-6">View/Create Custom Races</button>
          </Link>
        </div>
      )}

      {tab === 'classes' && (
        <div>
          <Link href="/custom-content/classes">
            <button className="btn btn-primary mb-6">View/Create Custom Classes</button>
          </Link>
        </div>
      )}

      {tab === 'feats' && (
        <div>
          <Link href="/custom-content/feats">
            <button className="btn btn-primary mb-6">View/Create Custom Feats</button>
          </Link>
        </div>
      )}

      <div className="card bg-slate-800">
        <h3 className="text-xl font-bold text-teal-400 mb-4">About Custom Content</h3>
        <p className="text-slate-300 mb-4">
          Create your own races, classes, and feats to use in your D&D adventures!
        </p>
        <ul className="text-slate-300 list-disc list-inside space-y-2">
          <li>Custom races can modify ability scores and add features</li>
          <li>Custom classes define hit dice and class features</li>
          <li>Custom feats give special abilities and bonuses</li>
          <li>All custom content is validated and merged with official rules</li>
          <li>Use your custom content in character creation</li>
        </ul>
      </div>
    </div>
  );
}
