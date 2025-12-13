import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Dungeon Master - D&D 5e Game',
  description: 'Play D&D 5e with an AI Dungeon Master powered by GPT-4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-slate-900 border-b border-slate-700 px-4 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-teal-500">⚔️ AI D&D Game</h1>
            <ul className="flex gap-4">
              <li><a href="/" className="text-slate-300 hover:text-teal-400">Home</a></li>
              <li><a href="/world-select" className="text-slate-300 hover:text-teal-400">Play</a></li>
              <li><a href="/custom-content" className="text-slate-300 hover:text-teal-400">Custom Content</a></li>
            </ul>
          </div>
        </nav>
        <main className="min-h-screen bg-slate-900">
          {children}
        </main>
        <footer className="bg-slate-900 border-t border-slate-700 py-4 mt-12 text-center text-slate-400">
          <p>AI Dungeon Master ❤️ | D&D 5e Game | Powered by GPT-4</p>
        </footer>
      </body>
    </html>
  );
}
