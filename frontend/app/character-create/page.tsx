'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { fetchMergedRules, createCharacter, startGame } from '@/lib/api';

export default function CharacterCreate() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mergedRules, setMergedRules] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    race: '',
    class: '',
    feats: [] as string[]
  });

  const { setCharacter, setSessionId, selectedWorld } = useGameStore();

  useEffect(() => {
    const loadRules = async () => {
      try {
        const data = await fetchMergedRules();
        setMergedRules(data.data);
        if (Object.keys(data.data.races || {}).length > 0) {
          setFormData(prev => ({ ...prev, race: Object.keys(data.data.races)[0] }));
        }
        if (Object.keys(data.data.classes || {}).length > 0) {
          setFormData(prev => ({ ...prev, class: Object.keys(data.data.classes)[0] }));
        }
      } catch (error) {
        console.error('Failed to load rules:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRules();
  }, []);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    try {
      const charResponse = await createCharacter(formData);
      const character = charResponse.data;
      setCharacter(character);

      const gameResponse = await startGame(character, selectedWorld);
      setSessionId(gameResponse.data.sessionId);

      router.push('/game');
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card">
        <h2 className="text-3xl font-bold text-teal-400 mb-6">Create Your Character</h2>
        <p className="text-slate-300 mb-6">Step {step} of 3</p>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your character's name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && mergedRules && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Race</label>
              <select
                value={formData.race}
                onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                className="w-full"
              >
                {Object.keys(mergedRules.races || {}).map(race => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Class</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full"
              >
                {Object.keys(mergedRules.classes || {}).map(clazz => (
                  <option key={clazz} value={clazz}>{clazz}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card bg-slate-800">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Review Character</h3>
            <p className="text-slate-300"><strong>Name:</strong> {formData.name}</p>
            <p className="text-slate-300"><strong>Race:</strong> {formData.race}</p>
            <p className="text-slate-300"><strong>Class:</strong> {formData.class}</p>
            <p className="text-slate-300 mt-4 text-sm">Ready to begin your adventure?</p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={handleBack} className="btn btn-secondary flex-1" disabled={step === 1}>
            Back
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="btn btn-primary flex-1">
              Next
            </button>
          ) : (
            <button onClick={handleCreate} className="btn btn-primary flex-1">
              Create Character
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
