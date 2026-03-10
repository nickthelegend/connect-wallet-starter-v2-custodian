import { CustomProvider, WalletAccount } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'

export class AlgoWalletProvider implements CustomProvider {
    private accounts: WalletAccount[] = []
    // Update this URL to YOUR Vercel URL once you deploy the algo-wallet frontend!
    private baseUrl = 'https://algovault-wallet.vercel.app' 

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

    async signTransactions<T extends algosdk.Transaction[] | Uint8Array[]>(
        txnGroup: T | T[],
        indexesToSign?: number[]
    ): Promise<(Uint8Array | null)[]> {
        console.log('[AlgoVault] Signing transactions:', txnGroup)

        // Ensure we're working with a single group of transactions
        const firstGroup = Array.isArray(txnGroup[0]) ? (txnGroup[0] as unknown as (algosdk.Transaction | Uint8Array)[]) : (txnGroup as unknown as (algosdk.Transaction | Uint8Array)[])

        // Properly serialize Transactions to Base64 msgpack for the popup
        const txnsToSign = firstGroup.map(t => {
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

                    // Decode base64 strings back to Uint8Arrays
                    const signedTxns = event.data.signedTxns.map((s: string | null) =>
                        s ? new Uint8Array(Buffer.from(s, 'base64')) : null
                    )
                    resolve(signedTxns)
                }
            }

            window.addEventListener('message', handler)
        })
    }
}
