import React, { useState } from 'react';
import CaptionGenerator from './components/CaptionGenerator';
import HookGenerator from './components/HookGenerator';
import { SparklesIcon } from './components/ui/icons/SparklesIcon';
import { LightbulbIcon } from './components/ui/icons/LightbulbIcon';

type Page = 'caption' | 'hook';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('caption');

  const navButtonClasses = (page: Page) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
      activePage === page
        ? 'bg-indigo-600 text-white shadow-md'
        : 'bg-gray-700 hover:bg-gray-600'
    }`;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">
            AI SB <span className="text-indigo-400">Kohen</span>
          </h1>
          <nav className="flex items-center gap-2 md:gap-4 p-1 bg-gray-800 rounded-xl">
            <button
              onClick={() => setActivePage('caption')}
              className={navButtonClasses('caption')}
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Caption & Tagar</span>
              <span className="sm:hidden">Caption</span>
            </button>
            <button
              onClick={() => setActivePage('hook')}
              className={navButtonClasses('hook')}
            >
              <LightbulbIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Ide Hook</span>
               <span className="sm:hidden">Hook</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {activePage === 'caption' && <CaptionGenerator />}
        {activePage === 'hook' && <HookGenerator />}
      </main>
      
      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Dipersembahkan oleh Gemini API</p>
      </footer>
    </div>
  );
};

export default App;