'use client'

import { LayoutGrid, ShieldCheck, Zap, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'

const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '')

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

  const handleSignTxn = async (type: 'payment' | 'appCall' | 'assetCreate' | 'atomic' | 'rekey') => {
    if (!activeAccount) {
      setStatus('Please connect wallet first')
      return
    }

    setStatus(`Fetching Params...`)
    try {
      const params = await algodClient.getTransactionParams().do()
      let txns: algosdk.Transaction[] = [];

      if (type === 'payment') {
        txns = [algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAccount.address,
          receiver: 'BEXSSCKJRHVY6YDRTGDK4HDUEQTHWZ2FI3SF2GYFI6VCSIA36QWMHCI4UE',
          amount: 1000000,
          suggestedParams: params,
          note: new Uint8Array(Buffer.from('Real SDK Payment'))
        })]
      } else if (type === 'assetCreate') {
        // Detailed asset creation from Intermezzo tests
        txns = [algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          sender: activeAccount.address,
          total: 1000000,
          decimals: 6,
          unitName: 'AVT',
          assetName: 'AlgoVault Token',
          assetURL: 'https://algovault.io',
          manager: activeAccount.address,
          reserve: activeAccount.address,
          freeze: activeAccount.address,
          clawback: activeAccount.address,
          suggestedParams: params
        })]
      } else if (type === 'atomic') {
        // Atomic Group: Payment + App Call with Foreign Arrays
        const pTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAccount.address,
          receiver: 'BEXSSCKJRHVY6YDRTGDK4HDUEQTHWZ2FI3SF2GYFI6VCSIA36QWMHCI4UE',
          amount: 500000,
          suggestedParams: params
        })
        const aTxn = algosdk.makeApplicationNoOpTxnFromObject({
          sender: activeAccount.address,
          appIndex: 754755349,
          appArgs: [new Uint8Array(Buffer.from('debug'))],
          accounts: ['CHIJEK5EF3DD6EHCM23CV6IXO7JI4YIOHGN6755G6X3NQVYVKJV3WM7M2A'],
          foreignAssets: [723769800],
          suggestedParams: params
        })
        algosdk.assignGroupID([pTxn, aTxn])
        txns = [pTxn, aTxn]
      } else if (type === 'appCall') {
        txns = [algosdk.makeApplicationNoOpTxnFromObject({
          sender: activeAccount.address,
          appIndex: 1001,
          suggestedParams: params,
          note: new Uint8Array(Buffer.from('Simple App Call'))
        })]
      } else if (type === 'rekey') {
        txns = [algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAccount.address,
          receiver: activeAccount.address,
          amount: 0,
          rekeyTo: activeAccount.address, // Security demo: rekey to self
          suggestedParams: params,
          note: new Uint8Array(Buffer.from('Rekey Demo'))
        })]
      }

      setStatus(`Signing Group...`)
      const result = await signTransactions(txns)
      console.log(`[SDK] Result for ${type}:`, result)
      setStatus(`${type} processed successfully!`)
    } catch (err: any) {
      console.error(err)
      setStatus(`Error: ${err.message || 'Check Console'}`)
    }
  }

  return (
    <div className="mt-12 p-8 glass rounded-2xl border border-zinc-800 w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6 text-teal-500">
        <ShieldCheck size={18} />
        <h3 className="text-xs font-bold uppercase tracking-widest">Advanced Transaction Lab</h3>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleSignTxn('payment')}
          disabled={!activeAccount}
          className={`w-full py-4 rounded-xl flex items-center justify-between px-6 group transition-all ${activeAccount ? 'bg-teal-500 text-black hover:bg-teal-400' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
        >
          <span className="font-bold text-xs uppercase tracking-tighter">1. Simple Payment</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => handleSignTxn('assetCreate')}
          disabled={!activeAccount}
          className={`w-full py-4 rounded-xl flex items-center justify-between px-6 group transition-all ${activeAccount ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
        >
          <span className="font-bold text-xs uppercase tracking-tighter">2. Create Asset (ASA)</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => handleSignTxn('atomic')}
          disabled={!activeAccount}
          className={`w-full py-4 rounded-xl flex items-center justify-between px-6 group transition-all ${activeAccount ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
        >
          <span className="font-bold text-xs uppercase tracking-tighter">3. Atomic Group (Transfer + App)</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => handleSignTxn('appCall')}
          disabled={!activeAccount}
          className={`w-full py-4 rounded-xl flex items-center justify-between px-6 group transition-all ${activeAccount ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
        >
          <span className="font-bold text-xs uppercase tracking-tighter">4. Smart Contract Call</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => handleSignTxn('rekey')}
          disabled={!activeAccount}
          className={`w-full py-4 rounded-xl flex items-center justify-between px-6 group transition-all ${activeAccount ? 'bg-zinc-950 text-red-500 border border-red-900/30 hover:bg-red-900/10 hover:border-red-500/50' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
        >
          <span className="font-bold text-xs uppercase tracking-tighter">5. Rekey Account (L1 Security)</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {status && (
        <div className="mt-6 flex items-center gap-2 text-zinc-400 px-4 py-3 bg-black/40 rounded-lg border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <p className="text-[10px] uppercase font-bold tracking-widest">{status}</p>
        </div>
      )}
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
