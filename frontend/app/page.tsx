'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-4 text-teal-400">
          AI Мастер Подземелья
        </h2>
        <p className="text-xl text-slate-300 mb-8">
          Погрузись в D&D 5e как никогда раньше с AI-повествованием
        </p>
        <Link href="/world-select" className="btn btn-primary text-lg px-6 py-3">
          Начнём приключение
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card">
          <h3 className="text-xl font-bold text-teal-400 mb-2">Полные правила D&D 5e</h3>
          <p className="text-slate-300">Создание персонажа со всеми официальными расами, классами и особенностями</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold text-teal-400 mb-2">AI Повествование</h3>
          <p className="text-slate-300">GPT-4 создаёт динамические сюжеты и встречи подгоняю под твои выборы</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold text-teal-400 mb-2">Пользовательский Контент</h3>
          <p className="text-slate-300">Создавай свои расы, классы и особенности и используй их в играх</p>
        </div>
      </div>

      <div className="card bg-slate-800 border-teal-600 mb-8">
        <h3 className="text-2xl font-bold text-teal-400 mb-4">Как Играть</h3>
        <ol className="text-slate-300 space-y-2 list-decimal list-inside">
          <li>Выбери мир или создай свой сценарий</li>
          <li>Создай своего персонажа (раса, класс, особенности)</li>
          <li>Начни своё приключение с AI Мастером Подземелья</li>
          <li>Делай выборы, бросай кости и формируй историю</li>
          <li>Сражайся с монстрами, решай загадки, становись легендой</li>
        </ol>
      </div>
    </div>
  );
}
