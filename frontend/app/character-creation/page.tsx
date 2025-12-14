// frontend/app/character-creation/page.tsx
// НОВАЯ ПОЛНАЯ СИСТЕМА СОЗДАНИЯ ПЕРСОНАЖА
// Шаг 1: Раса → Шаг 2: Черты → Шаг 3: Класс → Шаг 4: Характеристики → Шаг 5: Личность

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import rulesData from '../../data/dnd-5e-rules.json';

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  gender: string;
  name: string;
  race: string;
  traits: string[];
  class: string;
  background: string;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  personality: {
    traits: string[];
    ideals: string;
    bonds: string;
    flaws: string;
  };
  alignment: string;
}

const RACES = Object.entries(rulesData.races).map(([key, race]: any) => ({
  id: key,
  name: race.name,
  description: race.description,
}));

const TRAITS = Object.entries(rulesData.traits).map(([key, trait]: any) => ({
  id: key,
  name: trait.name,
  type: trait.type,
}));

const CLASSES = Object.entries(rulesData.classes).map(([key, cls]: any) => ({
  id: key,
  name: cls.name,
}));

const BACKGROUNDS = Object.entries(rulesData.backgrounds).map(([key, bg]: any) => ({
  id: key,
  name: bg.name,
}));

const ALIGNMENTS = [
  'Законопослушный Добрый',
  'Нейтральный Добрый',
  'Хаотичный Добрый',
  'Законопослушный Нейтральный',
  'Истинно Нейтральный',
  'Хаотичный Нейтральный',
  'Законопослушный Злой',
  'Нейтральный Злой',
  'Хаотичный Злой',
];

export default function CharacterCreationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    gender: 'male',
    name: '',
    race: '',
    traits: [],
    class: '',
    background: '',
    abilities: {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    },
    personality: {
      traits: [],
      ideals: '',
      bonds: '',
      flaws: '',
    },
    alignment: 'Истинно Нейтральный',
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      createCharacter();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const createCharacter = () => {
    localStorage.setItem('character', JSON.stringify(formData));
    router.push('/world-select');
  };

  const toggleTrait = (traitId: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.includes(traitId)
        ? prev.traits.filter(t => t !== traitId)
        : [...prev.traits, traitId],
    }));
  };

  const updateAbility = (ability: keyof FormData['abilities'], value: number) => {
    setFormData(prev => ({
      ...prev,
      abilities: { ...prev.abilities, [ability]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">
            ⚔️ Создание Персонажа
          </h1>
          <p className="text-slate-400">
            Шаг {currentStep} из 5
          </p>
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold transition-colors ${
                  currentStep === step
                    ? 'bg-teal-500 text-white'
                    : currentStep > step
                    ? 'bg-teal-700 text-teal-200'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: RACE & GENDER */}
        {currentStep === 1 && (
          <div className="card border border-slate-600 space-y-6">
            <h2 className="text-2xl font-bold text-teal-400">1️⃣ Выберите Расу и Пол</h2>

            {/* GENDER */}
            <div>
              <label className="block text-slate-300 font-semibold mb-3">🧬 Пол</label>
              <div className="flex gap-4">
                {['Мужской', 'Женский', 'Другое'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setFormData(prev => ({ ...prev, gender }))}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                      formData.gender === gender
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* RACE SELECTION */}
            <div>
              <label className="block text-slate-300 font-semibold mb-3">🧝 Раса</label>
              <div className="grid grid-cols-2 gap-3">
                {RACES.map(race => (
                  <button
                    key={race.id}
                    onClick={() => setFormData(prev => ({ ...prev, race: race.id }))}
                    className={`p-4 rounded-lg text-left transition-colors border ${
                      formData.race === race.id
                        ? 'border-teal-500 bg-teal-900 text-teal-100'
                        : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-semibold">{race.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{race.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TRAITS */}
        {currentStep === 2 && (
          <div className="card border border-slate-600 space-y-6">
            <h2 className="text-2xl font-bold text-teal-400">
              2️⃣ Выберите Черты (Опционально)
            </h2>
            <p className="text-slate-400 text-sm">
              Черты - это опциональные архетипы, которые можно добавить к вашей расе.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {TRAITS.map(trait => (
                <button
                  key={trait.id}
                  onClick={() => toggleTrait(trait.id)}
                  className={`p-4 rounded-lg text-left transition-colors border ${
                    formData.traits.includes(trait.id)
                      ? 'border-teal-500 bg-teal-900 text-teal-100'
                      : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold">{trait.name}</div>
                  <div className="text-xs text-slate-400 mt-1">({trait.type})</div>
                  {formData.traits.includes(trait.id) && (
                    <div className="text-teal-400 mt-2">✓ Выбрано</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CLASS & NAME */}
        {currentStep === 3 && (
          <div className="card border border-slate-600 space-y-6">
            <h2 className="text-2xl font-bold text-teal-400">3️⃣ Класс и Имя</h2>

            {/* CLASS */}
            <div>
              <label className="block text-slate-300 font-semibold mb-3">⚔️ Класс</label>
              <div className="grid grid-cols-3 gap-3">
                {CLASSES.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setFormData(prev => ({ ...prev, class: cls.id }))}
                    className={`p-4 rounded-lg font-semibold transition-colors border ${
                      formData.class === cls.id
                        ? 'border-teal-500 bg-teal-900 text-teal-100'
                        : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            </div>

            {/* NAME */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">📝 Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите имя вашего персонажа"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: ABILITIES */}
        {currentStep === 4 && (
          <div className="card border border-slate-600 space-y-6">
            <h2 className="text-2xl font-bold text-teal-400">4️⃣ Характеристики</h2>
            <p className="text-slate-400 text-sm">
              Распределите ваши характеристики. Стандартный массив: 15, 14, 13, 12, 10, 8
            </p>

            <div className="grid grid-cols-2 gap-6">
              {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map(ability => {
                const modifier = Math.floor((formData.abilities[ability] - 10) / 2);
                const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                return (
                  <div key={ability} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-teal-400">{ability}</span>
                      <span className="text-slate-400 text-sm">({modStr})</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="15"
                      value={formData.abilities[ability]}
                      onChange={e => updateAbility(ability, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-2xl font-bold text-teal-400 mt-2">
                      {formData.abilities[ability]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: PERSONALITY */}
        {currentStep === 5 && (
          <div className="card border border-slate-600 space-y-6">
            <h2 className="text-2xl font-bold text-teal-400">5️⃣ Личность и Фон</h2>

            {/* BACKGROUND */}
            <div>
              <label className="block text-slate-300 font-semibold mb-3">📚 Фон</label>
              <div className="grid grid-cols-2 gap-3">
                {BACKGROUNDS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setFormData(prev => ({ ...prev, background: bg.id }))}
                    className={`p-4 rounded-lg font-semibold transition-colors border ${
                      formData.background === bg.id
                        ? 'border-teal-500 bg-teal-900 text-teal-100'
                        : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ALIGNMENT */}
            <div>
              <label className="block text-slate-300 font-semibold mb-3">⚖️ Мировоззрение</label>
              <select
                value={formData.alignment}
                onChange={e => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 focus:border-teal-500 focus:outline-none"
              >
                {ALIGNMENTS.map(alignment => (
                  <option key={alignment} value={alignment}>
                    {alignment}
                  </option>
                ))}
              </select>
            </div>

            {/* PERSONALITY TRAITS */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">🎭 Черты личности</label>
              <input
                type="text"
                placeholder="Храбрый, остроумный, скаредный..."
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* IDEALS */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">💡 Идеалы</label>
              <input
                type="text"
                placeholder="Честь, Справедливость, Свобода..."
                value={formData.personality.ideals}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  personality: { ...prev.personality, ideals: e.target.value },
                }))}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* BONDS */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">🔗 Связи</label>
              <textarea
                placeholder="Мои товарищи - моя семья..."
                value={formData.personality.bonds}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  personality: { ...prev.personality, bonds: e.target.value },
                }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* FLAWS */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">⚠️ Недостатки</label>
              <textarea
                placeholder="Слишком гордый, жаден, недоверчив..."
                value={formData.personality.flaws}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  personality: { ...prev.personality, flaws: e.target.value },
                }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex gap-4 mt-12 justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            ← Назад
          </button>

          <button
            onClick={handleNext}
            disabled={!formData.name || !formData.race || !formData.class}
            className="px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {currentStep === 5 ? '✓ Создать Персонажа' : 'Далее →'}
          </button>
        </div>
      </div>
    </div>
  );
}
