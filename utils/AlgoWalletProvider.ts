import { CustomProvider, WalletAccount } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'

export class AlgoWalletProvider implements CustomProvider {
    private accounts: WalletAccount[] = []
    private baseUrl = 'http://localhost:5173' // The algo-wallet URL

    async connect(): Promise<WalletAccount[]> {
        console.log('[AlgoVault] Opening connect popup...')
        return new Promise((resolve, reject) => {
            const popup = window.open(`${this.baseUrl}/rpc?type=connect`, 'AlgoVault', 'width=450,height=700')

            const handler = (event: MessageEvent) => {
                if (event.origin !== this.baseUrl) return
                if (event.data.type === 'ALGO_WALLET_RESPONSE') {
                    console.log('[AlgoVault] Connected:', event.data.address)
                    window.removeEventListener('message', handler)
                    this.accounts = [{ name: event.data.name, address: event.data.address }]
                    resolve(this.accounts)
                }
            }

            window.addEventListener('message', handler)

            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed)
                    window.removeEventListener('message', handler)
                    reject(new Error('Window closed by user'))
                }
            }, 1000)
        })
    }

    async disconnect(): Promise<void> {
        console.log('[AlgoVault] Disconnecting...')
        this.accounts = []
    }

    async resumeSession(): Promise<WalletAccount[] | void> {
        console.log('[AlgoVault] Resuming session...')
        // For simplicity, we'll return nothing, meaning they need to reconnect.
        return undefined
    }

    async signTransactions(
        txnGroup: algosdk.Transaction[] | Uint8Array[],
        indexesToSign?: number[]
    ): Promise<(Uint8Array | null)[]> {
        console.log('[AlgoVault] Signing transactions:', txnGroup)

        // Properly serialize Transactions to Base64 msgpack for the popup
        const txnsToSign = txnGroup.map(t => {
            const bytes = t instanceof Uint8Array ? t : algosdk.encodeUnsignedTransaction(t)
            return Buffer.from(bytes).toString('base64')
        })

        const data = encodeURIComponent(JSON.stringify(txnsToSign))

        return new Promise((resolve) => {
            const popup = window.open(`${this.baseUrl}/rpc?type=sign&txns=${data}`, 'AlgoVault', 'width=450,height=700')

            const handler = (event: MessageEvent) => {
                if (event.origin !== this.baseUrl) return
                if (event.data.type === 'ALGO_WALLET_RESPONSE') {
                    console.log('[AlgoVault] Signing complete')
                    window.removeEventListener('message', handler)
                    resolve(event.data.signedTxns)
                }
            }

            window.addEventListener('message', handler)
        })
    }
}
