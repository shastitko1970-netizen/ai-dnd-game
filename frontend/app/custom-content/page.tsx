'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CustomContent() {
  const [tab, setTab] = useState('races');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-teal-400 mb-8">Хаб Пользовательского Контента</h2>

      <div className="flex gap-4 mb-8">
        {(['races', 'classes', 'feats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded font-bold transition ${
              tab === t ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t === 'races' && 'Расы'}
            {t === 'classes' && 'Классы'}
            {t === 'feats' && 'Особенности'}
          </button>
        ))}
      </div>

      {tab === 'races' && (
        <div>
          <Link href="#">
            <button className="btn btn-primary mb-6">Посмотри/Создай пользовательские расы</button>
          </Link>
        </div>
      )}

      {tab === 'classes' && (
        <div>
          <Link href="#">
            <button className="btn btn-primary mb-6">Посмотри/Создай пользовательские классы</button>
          </Link>
        </div>
      )}

      {tab === 'feats' && (
        <div>
          <Link href="#">
            <button className="btn btn-primary mb-6">Посмотри/Создай пользовательские особенности</button>
          </Link>
        </div>
      )}

      <div className="card bg-slate-800">
        <h3 className="text-xl font-bold text-teal-400 mb-4">О пользовательском контенте</h3>
        <p className="text-slate-300 mb-4">
          Создавай свои расы, классы и особенности для использования в приключениях!
        </p>
        <ul className="text-slate-300 list-disc list-inside space-y-2">
          <li>Пользовательские расы могут менять показатели характера и добавлять способности</li>
          <li>Пользовательские классы определяют кубики здоровья и способности уровня</li>
          <li>Пользовательские особенности дают специальные способности и бонусы</li>
          <li>Весь пользовательский контент проверяется и объединяется с официальными правилами</li>
          <li>Используй свой пользовательский контент при создании персонажа</li>
        </ul>
      </div>
    </div>
  );
}
