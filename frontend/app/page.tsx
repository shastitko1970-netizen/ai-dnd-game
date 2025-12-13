'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-4 text-teal-400">
          AI Dungeon Master
        </h2>
        <p className="text-xl text-slate-300 mb-8">
          Experience D&D 5e like never before with AI-powered storytelling
        </p>
        <Link href="/world-select" className="btn btn-primary text-lg px-6 py-3">
          Start Your Adventure
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card">
          <h3 className="text-xl font-bold text-teal-400 mb-2">Full D&D 5e Rules</h3>
          <p className="text-slate-300">Complete character creation with all official races, classes, and feats</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold text-teal-400 mb-2">AI Storytelling</h3>
          <p className="text-slate-300">GPT-4 generates dynamic narratives and encounters tailored to your choices</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold text-teal-400 mb-2">Custom Content</h3>
          <p className="text-slate-300">Create your own races, classes, and feats and use them in games</p>
        </div>
      </div>

      <div className="card bg-slate-800 border-teal-600 mb-8">
        <h3 className="text-2xl font-bold text-teal-400 mb-4">How to Play</h3>
        <ol className="text-slate-300 space-y-2 list-decimal list-inside">
          <li>Select a world or create your own campaign</li>
          <li>Create your character (race, class, feats)</li>
          <li>Begin your adventure with an AI Dungeon Master</li>
          <li>Make choices, roll dice, and shape the story</li>
          <li>Fight monsters, solve puzzles, and become a legend</li>
        </ol>
      </div>
    </div>
  );
}
