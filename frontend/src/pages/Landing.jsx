import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const fade = (delay = 0) => ({
  initial:   { opacity: 0, y: 20 },
  animate:   { opacity: 1, y: 0 },
  transition:{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Landing() {
  const navigate  = useNavigate()
  const { isAuthed } = useAuth()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-void">

      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-5 border-b border-smoke">
        <motion.span {...fade(0)} className="font-serif text-xl text-ember tracking-widest">
          ICARUS
        </motion.span>
        <motion.div {...fade(0.1)} className="flex gap-4">
          <button
            onClick={() => navigate('/auth')}
            className="font-mono text-xs text-mist hover:text-bone transition-colors tracking-widest uppercase"
          >
            {isAuthed ? 'Dashboard' : 'Sign In'}
          </button>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto w-full">

        <motion.div {...fade(0.2)} className="mb-6">
          <span className="text-6xl select-none">🪶</span>
        </motion.div>

        <motion.h1 {...fade(0.35)}
          className="font-serif text-5xl md:text-7xl text-bone leading-[1.1] tracking-tight mb-4"
        >
          Do you understand<br />
          <em className="text-ember glow-ember">your own work?</em>
        </motion.h1>

        <motion.p {...fade(0.5)}
          className="font-mono text-sm text-mist max-w-lg leading-relaxed mb-10 tracking-wide"
        >
          Icarus is a Socratic integrity auditor. Upload your code, thesis, or pitch deck.
          Answer for every decision. Earn your wings — or watch the wax melt.
        </motion.p>

        <motion.div {...fade(0.65)} className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(isAuthed ? '/audit' : '/auth')}
            className="px-8 py-3 bg-ember text-void font-mono text-xs tracking-widest uppercase font-medium hover:bg-bone transition-all duration-300"
          >
            Begin Audit
          </button>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-3 border border-smoke text-mist font-mono text-xs tracking-widest uppercase hover:border-ember hover:text-ember transition-all duration-300"
          >
            Create Account
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div {...fade(0.8)} className="mt-20 w-full">
          <div className="h-px bg-smoke mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: '⚡', title: 'The Nest Scan', desc: 'Icarus maps your work and identifies the sections that matter most to defend.' },
              { icon: '🔒', title: 'The Gate', desc: 'Answer wrong twice and the audit locks. Fix your work before you can continue.' },
              { icon: '📜', title: 'Defense Transcript', desc: 'A verifiable record of every question, answer, and score. Proof of your mastery.' },
            ].map(({ icon, title, desc }, i) => (
              <motion.div key={title} {...fade(0.9 + i * 0.1)}>
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-serif text-bone text-lg mb-2">{title}</div>
                <div className="font-mono text-xs text-mist leading-relaxed">{desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-smoke text-center">
        <span className="font-mono text-xs text-mist tracking-widest">
          PROJECT ICARUS — Philippine Startup Challenge 11
        </span>
      </footer>
    </div>
  )
}