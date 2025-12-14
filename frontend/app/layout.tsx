import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Мастер Подземелья - D&D 5e Игра',
  description: 'Играй в D&D 5e с AI Мастером Подземелья работающим на GPT-4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <nav className="bg-slate-900 border-b border-slate-700 px-4 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-teal-500">⚔️ AI D&D</h1>
            <ul className="flex gap-4">
              <li><a href="/" className="text-slate-300 hover:text-teal-400">Дом</a></li>
              <li><a href="/world-select" className="text-slate-300 hover:text-teal-400">Играть</a></li>
              <li><a href="/custom-content" className="text-slate-300 hover:text-teal-400">Контент</a></li>
            </ul>
          </div>
        </nav>
        <main className="min-h-screen bg-slate-900">
          {children}
        </main>
        <footer className="bg-slate-900 border-t border-slate-700 py-4 mt-12 text-center text-slate-400">
          <p>AI Мастер Подземелья ❤️ | D&D 5e | Powered by GPT-4</p>
        </footer>
      </body>
    </html>
  );
}
