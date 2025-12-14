'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CharacterCreate() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedWorld, setSelectedWorld] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Мужской',
    race: 'Human',
    class: 'Fighter',
    feats: [] as string[]
  });

  useEffect(() => {
    const world = localStorage.getItem('selectedWorld');
    if (world) {
      setSelectedWorld(JSON.parse(world));
    }
  }, []);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/character/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      const character = await response.json();
      localStorage.setItem('character', JSON.stringify(character.data));
      router.push('/game');
    } catch (error) {
      console.error('Ошибка создания персонажа:', error);
      alert('Не удалось создать персонажа');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card">
        <h2 className="text-3xl font-bold text-teal-400 mb-6">Создай персонажа</h2>
        <p className="text-slate-300 mb-6">Шаг {step} из 3</p>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Имя твоего персонажа"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Пол</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full"
              >
                <option>Мужской</option>
                <option>Женский</option>
                <option>Другое</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Раса</label>
              <select
                value={formData.race}
                onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                className="w-full"
              >
                <option value="Human">Человек</option>
                <option value="Elf">Эльф</option>
                <option value="Dwarf">Дворф</option>
                <option value="Halfling">Полурослик</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Класс</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full"
              >
                <option value="Barbarian">Варвар</option>
                <option value="Bard">Бард</option>
                <option value="Cleric">Жрец</option>
                <option value="Fighter">Боец</option>
                <option value="Rogue">Плут</option>
                <option value="Wizard">Волшебник</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card bg-slate-800">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Проверь персонажа</h3>
            <p className="text-slate-300"><strong>Имя:</strong> {formData.name}</p>
            <p className="text-slate-300"><strong>Раса:</strong> {formData.race}</p>
            <p className="text-slate-300"><strong>Класс:</strong> {formData.class}</p>
            <p className="text-slate-300 mt-4 text-sm">Готов начать приключение?</p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={handleBack} className="btn btn-secondary flex-1" disabled={step === 1}>
            Назад
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="btn btn-primary flex-1">
              Дальше
            </button>
          ) : (
            <button onClick={handleCreate} className="btn btn-primary flex-1">
              Создать персонажа
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
