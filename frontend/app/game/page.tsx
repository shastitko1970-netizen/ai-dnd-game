'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { playerAction, getGameSession } from '@/lib/api';

export default function GamePage() {
  const router = useRouter();
  const { character, sessionId } = useGameStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      router.push('/world-select');
      return;
    }

    const loadSession = async () => {
      try {
        const data = await getGameSession(sessionId);
        setSession(data.data.session);
        setNarrative(data.data.session.narrative);
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    };

    loadSession();
  }, [sessionId, router]);

  const handleAction = async (actionType: string) => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await playerAction(sessionId, {
        type: actionType,
        timestamp: new Date(),
      });
      setNarrative(response.data.narrative || 'The adventure continues...');
    } catch (error) {
      console.error('Failed to perform action:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || !character) {
    return <div className="text-center py-12 text-slate-300">Loading game...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Narrative */}
        <div className="lg:col-span-2">
          <div className="card h-96 flex flex-col">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">Narrative</h2>
            <div className="flex-1 overflow-y-auto text-slate-300 mb-4 p-4 bg-slate-900 rounded">
              {narrative || 'Your adventure begins...'}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleAction('attack')}
                disabled={loading}
                className="btn btn-primary"
              >
                Attack
              </button>
              <button
                onClick={() => handleAction('dodge')}
                disabled={loading}
                className="btn btn-primary"
              >
                Dodge
              </button>
              <button
                onClick={() => handleAction('help')}
                disabled={loading}
                className="btn btn-secondary"
              >
                Help
              </button>
            </div>
          </div>
        </div>

        {/* Character Sheet */}
        <div>
          <div className="card">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Character</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>Name:</strong> {character.name}</p>
              <p><strong>Race:</strong> {character.race}</p>
              <p><strong>Class:</strong> {character.class}</p>
              <p><strong>Level:</strong> {character.level}</p>
              <hr className="border-slate-700 my-2" />
              <p><strong>HP:</strong> {character.hp.current}/{character.hp.max}</p>
              <p><strong>AC:</strong> {character.ac}</p>
              <p><strong>Initiative:</strong> {character.initiative}</p>
              <hr className="border-slate-700 my-2" />
              <p><strong>STR:</strong> {character.abilities.STR}</p>
              <p><strong>DEX:</strong> {character.abilities.DEX}</p>
              <p><strong>CON:</strong> {character.abilities.CON}</p>
              <p><strong>INT:</strong> {character.abilities.INT}</p>
              <p><strong>WIS:</strong> {character.abilities.WIS}</p>
              <p><strong>CHA:</strong> {character.abilities.CHA}</p>
            </div>
            <button
              onClick={() => router.push('/world-select')}
              className="btn btn-secondary w-full mt-4"
            >
              Back to Worlds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
