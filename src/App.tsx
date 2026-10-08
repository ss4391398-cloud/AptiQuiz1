import { useState } from 'react';
import { HomePage } from '@/components/HomePage';
import { HostPanel } from '@/components/HostPanel';
import { PlayerPanel } from '@/components/PlayerPanel';
import { CollegeLeagueTable } from '@/components/CollegeLeagueTable';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type View = 'home' | 'host' | 'join' | 'league';

function App() {
  const [view, setView] = useState<View>('home');

  if (view === 'home') {
    return (
      <HomePage
        onHost={() => setView('host')}
        onJoin={() => setView('join')}
        onLeague={() => setView('league')}
      />
    );
  }

  if (view === 'host') {
    return <HostPanel onBack={() => setView('home')} />;
  }

  if (view === 'join') {
    return <PlayerPanel onBack={() => setView('home')} />;
  }

  if (view === 'league') {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={() => setView('home')}>
              <ArrowLeft size={16} /> Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <BarChart3 size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-slate-900">College League</span>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <CollegeLeagueTable />
        </div>
      </div>
    );
  }

  return null;
}

export default App;
