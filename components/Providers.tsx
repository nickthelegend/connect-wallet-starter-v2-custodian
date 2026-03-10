'use client'

import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import { AlgoWalletProvider } from '../utils/AlgoWalletProvider'
import '@txnlab/use-wallet-ui-react/dist/style.css'

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    {
      id: WalletId.CUSTOM,
      options: {
        provider: new AlgoWalletProvider()
      },
      metadata: {
        name: 'Kyra Wallet',
        icon: '/logo.png'
      }
    }
  ],
  defaultNetwork: NetworkId.TESTNET,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider>
        {children}
      </WalletUIProvider>
    </WalletProvider>
  )
}
