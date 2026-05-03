import { motion } from 'framer-motion'

export default function WaxMeter({ wax, feathers, tokensUsed, provider }) {
  const waxPct     = Math.min((wax / 10) * 100, 100)
  const featherPct = Math.min((feathers / 9) * 100, 100)

  return (
    <div className="border border-smoke bg-ash p-4 space-y-4">

      {/* Wax */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-mist tracking-widest uppercase">Wax Risk</span>
          <span className={`font-mono text-xs font-medium ${wax >= 7 ? 'text-wax' : wax >= 4 ? 'text-ember' : 'text-mist'}`}>
            {wax}/10
          </span>
        </div>
        <div className="h-1 bg-smoke w-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: wax >= 7 ? 'var(--wax)' : wax >= 4 ? 'var(--ember)' : 'var(--mist)' }}
            initial={{ width: 0 }}
            animate={{ width: `${waxPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Feathers */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-mist tracking-widest uppercase">🪶 Feathers</span>
          <span className="font-mono text-xs text-feather font-medium">{feathers}</span>
        </div>
        <div className="h-1 bg-smoke w-full overflow-hidden">
          <motion.div
            className="h-full bg-feather"
            initial={{ width: 0 }}
            animate={{ width: `${featherPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Token usage */}
      {tokensUsed && (
        <div className="pt-2 border-t border-smoke">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-mist tracking-widest uppercase">Tokens Used</span>
            <span className="font-mono text-xs text-mist">{tokensUsed.total?.toLocaleString() ?? 0}</span>
          </div>
          {provider && (
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-xs text-mist tracking-widest uppercase">Provider</span>
              <span className={`font-mono text-xs ${provider.includes('gemini') ? 'text-amber-400' : 'text-feather'}`}>
                {provider}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}