'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Race {
  name: string;
  [key: string]: any;
}

interface Class {
  name: string;
  [key: string]: any;
}

export default function CharacterCreate() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedWorld, setSelectedWorld] = useState<any>(null);
  const [racesList, setRacesList] = useState<Race[]>([]);
  const [classesList, setClassesList] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Mode toggles for creating custom race/class
  const [useCustomRace, setUseCustomRace] = useState(false);
  const [useCustomClass, setUseCustomClass] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Мужской',
    race: '',
    class: '',
    feats: [] as string[]
  });

  const [customRace, setCustomRace] = useState({
    name: '',
    size: 'Medium',
    speed: 30,
    abilityBonus: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    features: []
  });

  const [customClass, setCustomClass] = useState({
    name: '',
    hitDice: 8,
    primaryAbility: 'STR',
    savingThrows: [],
    features: []
  });

  useEffect(() => {
    const world = localStorage.getItem('selectedWorld');
    if (world) {
      setSelectedWorld(JSON.parse(world));
    }
    loadRacesAndClasses();
  }, []);

  const loadRacesAndClasses = async () => {
    try {
      setError('');
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      console.log(`🔄 Загружаю расы...`);
      const racesRes = await fetch(`${apiUrl}/api/rules/races`, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`Ответ races:`, racesRes.status);

      if (!racesRes.ok) {
        throw new Error(`Ошибка загружки рас: ${racesRes.status}`);
      }

      const classesRes = await fetch(`${apiUrl}/api/rules/classes`, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`Ответ classes:`, classesRes.status);

      if (!classesRes.ok) {
        throw new Error(`Ошибка загружки классов: ${classesRes.status}`);
      }

      const racesData = await racesRes.json();
      const classesData = await classesRes.json();

      console.log(`✅ Получено ${racesData.data?.length || 0} рас`);
      console.log(`✅ Получено ${classesData.data?.length || 0} классов`);

      if (racesData.data && Array.isArray(racesData.data)) {
        setRacesList(racesData.data);
        if (racesData.data.length > 0) {
          setFormData(prev => ({ ...prev, race: racesData.data[0].name }));
        }
      } else {
        throw new Error('Неверные данные рас');
      }

      if (classesData.data && Array.isArray(classesData.data)) {
        setClassesList(classesData.data);
        if (classesData.data.length > 0) {
          setFormData(prev => ({ ...prev, class: classesData.data[0].name }));
        }
      } else {
        throw new Error('Неверные данные классов');
      }
    } catch (err: any) {
      console.error(`❌ Ошибка загружки:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomRace = async () => {
    if (!customRace.name.trim()) {
      alert('Назови свою расу');
      return;
    }

    try {
      setError('');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/custom-races`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customRace)
      });

      if (response.ok) {
        const data = await response.json();
        // Add to local list and select it
        setRacesList(prev => [...prev, customRace]);
        setFormData(prev => ({ ...prev, race: customRace.name }));
        setUseCustomRace(false);
        setCustomRace({
          name: '',
          size: 'Medium',
          speed: 30,
          abilityBonus: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
          features: []
        });
        alert('Раса создана!');
      } else {
        const errData = await response.json();
        setError(`Ошибка: ${errData.error || 'Ошибка создания расы'}`);
      }
    } catch (error: any) {
      console.error('Error creating custom race:', error);
      setError(error.message);
    }
  };

  const handleCreateCustomClass = async () => {
    if (!customClass.name.trim()) {
      alert('Назови свой класс');
      return;
    }

    try {
      setError('');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/custom-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customClass)
      });

      if (response.ok) {
        const data = await response.json();
        // Add to local list and select it
        setClassesList(prev => [...prev, customClass]);
        setFormData(prev => ({ ...prev, class: customClass.name }));
        setUseCustomClass(false);
        setCustomClass({
          name: '',
          hitDice: 8,
          primaryAbility: 'STR',
          savingThrows: [],
          features: []
        });
        alert('Класс создан!');
      } else {
        const errData = await response.json();
        setError(`Ошибка: ${errData.error || 'Ошибка создания класса'}`);
      }
    } catch (error: any) {
      console.error('Error creating custom class:', error);
      setError(error.message);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Придумай имя персонажу');
      return;
    }
    if (!formData.race) {
      alert('Выбери или создай расу');
      return;
    }
    if (!formData.class) {
      alert('Выбери или создай класс');
      return;
    }

    try {
      setError('');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/character/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create character');
      }

      const character = await response.json();
      localStorage.setItem('character', JSON.stringify(character.data));
      router.push('/game');
    } catch (error: any) {
      console.error('Character creation error:', error);
      setError(`Ошибка: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card">
          <h2 className="text-3xl font-bold text-teal-400 mb-6">Создай персонажа</h2>
          <p className="text-slate-300 mb-4"><span className="inline-block animate-spin mr-2">⛳</span>Загружаю расы и классы...</p>
          {error && (
            <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded">
              <p><strong>Загружка не удалась:</strong> {error}</p>
              <p className="text-sm mt-2">Проверь, что backend запущен на localhost:3001</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card">
        <h2 className="text-3xl font-bold text-teal-400 mb-6">Создай персонажа</h2>
        <p className="text-slate-300 mb-6">Шаг {step} из 3</p>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Имя твоего персонажа"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Пол</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-teal-400 focus:outline-none"
              >
                <option>Мужской</option>
                <option>Женский</option>
                <option>Другое</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Раса */}
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Раса ({racesList.length})</label>
              {!useCustomRace ? (
                <>
                  <select
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-teal-400 focus:outline-none mb-2"
                  >
                    <option value="">-- Выбери расу --</option>
                    {racesList.map(race => (
                      <option key={race.name} value={race.name}>
                        {race.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setUseCustomRace(true)}
                    className="text-teal-400 hover:text-teal-300 text-sm underline"
                  >
                    + Создать свою расу
                  </button>
                </>
              ) : (
                <div className="bg-slate-800 border border-teal-400 rounded p-4 space-y-3">
                  <input
                    type="text"
                    value={customRace.name}
                    onChange={(e) => setCustomRace({ ...customRace, name: e.target.value })}
                    placeholder="Название расы"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={customRace.size}
                      onChange={(e) => setCustomRace({ ...customRace, size: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    >
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </select>
                    <input
                      type="number"
                      value={customRace.speed}
                      onChange={(e) => setCustomRace({ ...customRace, speed: parseInt(e.target.value) })}
                      placeholder="Speed"
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateCustomRace}
                      className="flex-1 btn btn-primary btn-sm"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setUseCustomRace(false)}
                      className="flex-1 btn btn-secondary btn-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Класс */}
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Класс ({classesList.length})</label>
              {!useCustomClass ? (
                <>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-teal-400 focus:outline-none mb-2"
                  >
                    <option value="">-- Выбери класс --</option>
                    {classesList.map(clazz => (
                      <option key={clazz.name} value={clazz.name}>
                        {clazz.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setUseCustomClass(true)}
                    className="text-teal-400 hover:text-teal-300 text-sm underline"
                  >
                    + Создать свой класс
                  </button>
                </>
              ) : (
                <div className="bg-slate-800 border border-teal-400 rounded p-4 space-y-3">
                  <input
                    type="text"
                    value={customClass.name}
                    onChange={(e) => setCustomClass({ ...customClass, name: e.target.value })}
                    placeholder="Название класса"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={customClass.hitDice}
                      onChange={(e) => setCustomClass({ ...customClass, hitDice: parseInt(e.target.value) })}
                      placeholder="Hit Dice"
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                    <select
                      value={customClass.primaryAbility}
                      onChange={(e) => setCustomClass({ ...customClass, primaryAbility: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    >
                      <option>STR</option>
                      <option>DEX</option>
                      <option>CON</option>
                      <option>INT</option>
                      <option>WIS</option>
                      <option>CHA</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateCustomClass}
                      className="flex-1 btn btn-primary btn-sm"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setUseCustomClass(false)}
                      className="flex-1 btn btn-secondary btn-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card bg-slate-800">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Проверь персонажа</h3>
            <div className="space-y-2 text-slate-300">
              <p><strong>Имя:</strong> {formData.name}</p>
              <p><strong>Пол:</strong> {formData.gender}</p>
              <p><strong>Раса:</strong> {formData.race}</p>
              <p><strong>Класс:</strong> {formData.class}</p>
            </div>
            <p className="text-slate-300 mt-6 text-sm">Готов начать приключение?</p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            className="btn btn-secondary flex-1"
            disabled={step === 1}
          >
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
