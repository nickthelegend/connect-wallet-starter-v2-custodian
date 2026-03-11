import { CustomProvider, WalletAccount } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'

export class AlgoWalletProvider implements CustomProvider {
    private accounts: WalletAccount[] = []
    private baseUrl = 'https://kyra.algocraft.fun' 

    async connect(): Promise<WalletAccount[]> {
        console.log('[Kyra] Opening connect popup...')
        return new Promise((resolve, reject) => {
            const popup = window.open(`${this.baseUrl}/rpc?type=connect`, 'Kyra', 'width=450,height=700')

            const handler = (event: MessageEvent) => {
                if (event.origin !== this.baseUrl) return
                if (event.data.type === 'ALGO_WALLET_RESPONSE') {
                    console.log('[Kyra] Connected:', event.data.address)
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
        console.log('[Kyra] Disconnecting...')
        this.accounts = []
    }

    async resumeSession(): Promise<WalletAccount[] | void> {
        console.log('[Kyra] Resuming session...')
        // For simplicity, we'll return nothing, meaning they need to reconnect.
        return undefined
    }

    async signTransactions<T extends algosdk.Transaction[] | Uint8Array[]>(
        txnGroup: T | T[],
        indexesToSign?: number[]
    ): Promise<(Uint8Array | null)[]> {
        console.log('[Kyra] Signing transactions:', txnGroup)

        // Ensure we're working with a single group of transactions
        const firstGroup = Array.isArray(txnGroup[0]) ? (txnGroup[0] as unknown as (algosdk.Transaction | Uint8Array)[]) : (txnGroup as unknown as (algosdk.Transaction | Uint8Array)[])

        // Properly serialize Transactions to Base64 msgpack for the popup
        const txnsToSign = firstGroup.map(t => {
            const bytes = t instanceof Uint8Array ? t : algosdk.encodeUnsignedTransaction(t)
            return Buffer.from(bytes).toString('base64')
        })

        const data = encodeURIComponent(JSON.stringify(txnsToSign))

        return new Promise((resolve) => {
            const popup = window.open(`${this.baseUrl}/rpc?type=sign&txns=${data}`, 'Kyra', 'width=450,height=700')

            const handler = (event: MessageEvent) => {
                if (event.origin !== this.baseUrl) return
                if (event.data.type === 'ALGO_WALLET_RESPONSE') {
                    console.log('[Kyra] Signing complete')
                    window.removeEventListener('message', handler)

                    // Decode base64 strings back to Uint8Arrays without relying on Node.js Buffer
                    const signedTxns = event.data.signedTxns.map((s: string | null) => {
                        if (!s) return null
                        const binaryString = atob(s)
                        const bytes = new Uint8Array(binaryString.length)
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i)
                        }
                        return bytes
                    })
                    resolve(signedTxns)
                }
            }

            window.addEventListener('message', handler)
        })
    }
}
