import { motion } from 'framer-motion';
import { Zap, Shield, Trophy, Users, Clock, ArrowRight, Brain, BarChart3, Wifi, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Card';

interface HomePageProps {
  onHost: () => void;
  onJoin: () => void;
  onLeague: () => void;
}

export function HomePage({ onHost, onJoin, onLeague }: HomePageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/25">
              <Brain className="text-white" size={22} />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">AptiQuiz</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLeague}>League</Button>
            <Button variant="secondary" size="sm" onClick={onJoin}>Join Game</Button>
            <Button size="sm" onClick={onHost}>Host</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge color="primary" className="mb-4">
              <Zap size={12} /> Real-time multiplayer aptitude arena
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-slate-900 leading-tight text-balance">
              Compete. Think fast.
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Climb the ranks.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
              Host live quiz rooms, invite players with a 6-character code, and battle through timed aptitude questions. Server-authoritative scoring with speed bonuses and anti-cheat protection.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={onHost}>
                Host a Game <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="secondary" onClick={onJoin}>
                Join with Code
              </Button>
            </div>
          </motion.div>

          {/* Stats showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Users, label: 'Players per room', value: '50+', color: 'text-primary-600' },
              { icon: Clock, label: 'Speed scoring', value: '1000+500', color: 'text-accent-500' },
              { icon: Shield, label: 'Anti-cheat', value: '4 layers', color: 'text-success-600' },
              { icon: Trophy, label: 'Topics', value: 'Quant/Logic/Verbal/DI', color: 'text-warning-600' },
            ].map((stat, i) => (
              <Card key={i} className="p-5">
                <stat.icon className={stat.color} size={24} />
                <div className="mt-3 font-display font-bold text-xl text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Built for competitive aptitude</h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">Every detail engineered for fair, fast, engaging multiplayer quizzing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Server-Authoritative', desc: 'The server drives the clock and computes all scores. Clients never receive the correct answer until reveal time.', color: 'bg-success-500' },
            { icon: Zap, title: 'Speed Bonuses', desc: 'Score = 1000 + 500 × (time remaining / total time). Faster correct answers earn more — up to 1500 points.', color: 'bg-accent-500' },
            { icon: Wifi, title: 'Reconnection', desc: 'Refresh or disconnect? Players auto-rejoin with their score and current question state preserved.', color: 'bg-primary-500' },
            { icon: BarChart3, title: 'Live Analytics', desc: 'Watch rank shifts animate in real-time. End-of-game summary shows accuracy, avg speed, and topic breakdown.', color: 'bg-warning-500' },
            { icon: Gamepad2, title: 'Bot Simulation', desc: 'Test with 50 virtual players that answer with human-like delays. Verify scalability before going live.', color: 'bg-error-500' },
            { icon: Trophy, title: 'College League', desc: 'Aggregate scores across all rooms per college. Compete not just individually, but for your institution.', color: 'bg-indigo-500' },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover className="p-6 h-full">
                <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center shadow-lg`}>
                  <feat.icon className="text-white" size={24} />
                </div>
                <h3 className="mt-4 font-display font-bold text-lg text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 border-0 p-8 sm:p-12 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">Ready to host your first quiz?</h2>
            <p className="mt-3 text-primary-100 max-w-xl mx-auto">Create a question set, generate a room code, and invite your players.</p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Button size="lg" variant="secondary" onClick={onHost}>
                Start Hosting <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10" onClick={onLeague}>
                View League
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
