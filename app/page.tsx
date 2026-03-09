'use client'

import { LayoutGrid, ShieldCheck, Zap } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white relative overflow-hidden">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0f1f1d,transparent_70%)] pointer-events-none" />

      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col gap-12 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[10px] font-bold uppercase tracking-widest">
            <Zap size={10} fill="currentColor" />
            V2 Migration Complete
          </div>
          <h1 className="text-6xl font-black tracking-tighter sm:text-7xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Algorand Wallet<br />Development Kit
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed font-sans">
            The next generation of wallet connectivity. Seamlessly integrate Pera, Defly, and Lute into your decentralized applications with optimized UI components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <FeatureCard
            icon={<ShieldCheck className="text-teal-500" size={20} />}
            title="Secure Connect"
            desc="Encrypted sessions with industry-standard wallet protocols."
          />
          <FeatureCard
            icon={<Zap className="text-teal-500" size={20} />}
            title="Ultra Fast"
            desc="Optimized for zero-latency interactions and real-time state sync."
          />
          <FeatureCard
            icon={<LayoutGrid className="text-teal-500" size={20} />}
            title="UI Library"
            desc="Pre-built components with full dark mode support out of the box."
          />
        </div>

        <SignTransactionDebug />
      </div>
    </main>
  )
}

function SignTransactionDebug() {
  const { activeAccount, signTransactions } = useWallet()
  const [status, setStatus] = useState<string>('')

  const handleSignTxn = async () => {
    if (!activeAccount) {
      setStatus('Please connect wallet first')
      return
    }

    setStatus('Requesting signature...')
    try {
      // Mock transaction object
      const mockTxn = {
        from: activeAccount.address,
        to: 'ALGO_RECEIVER_ADDRESS',
        amount: 1000000,
        note: 'Debug transaction'
      }

      // @ts-ignore - passing mock object for demo
      const result = await signTransactions([mockTxn])
      console.log('[Debug] Sign Result:', result)
      setStatus('Transaction Signed Successfully! (Check Console)')
    } catch (err) {
      console.error(err)
      setStatus('Signing Failed')
    }
  }

  return (
    <div className="mt-12 p-8 glass rounded-2xl border border-zinc-800 w-full max-w-md mx-auto">
      <h3 className="text-sm font-bold uppercase mb-4 tracking-widest text-teal-500">Debug Console</h3>
      <button
        onClick={handleSignTxn}
        disabled={!activeAccount}
        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${activeAccount ? 'bg-teal-500 text-black hover:scale-105' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
      >
        Sign Random Txn
      </button>
      {status && <p className="mt-4 text-[10px] uppercase text-zinc-500">{status}</p>}
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 border border-zinc-800 bg-zinc-900/30 rounded-2xl hover:bg-zinc-900/50 hover:border-teal-500/30 transition-all group text-left backdrop-blur-sm">
      <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-white mb-2 uppercase text-xs tracking-widest">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed font-sans">{desc}</p>
    </div>
  )
}
