# 💎 Algorand Connect Wallet Starter v2

A premium, production-ready starter template for building Algorand applications with **Next.js 15**, **Tailwind CSS 4**, and **@txnlab/use-wallet**.

This starter provides a seamless integration for all major Algorand wallets (Pera, Defly, Lute) and includes a custom **Kyra Custodial Wallet** implementation for onboarding users without an existing wallet.

![Kyra Logo](https://kyra.algocraft.fun/logo.png)

## ✨ Features

- ⚡ **Next.js 15 (App Router)** - The latest React framework for production.
- 🎨 **Tailwind CSS 4** - Ultra-fast, modern styling with a sleek dark-mode aesthetic.
- 🔌 **@txnlab/use-wallet** - Robust wallet management supporting Pera, Defly, Lute, and custom providers.
- 🔐 **Kyra Custodial Provider** - A custom implementation of `CustomProvider` that connects to a Vault-backed custodial infrastructure.
- ⚛️ **Advanced Transaction Lab** - Pre-built examples for Payment, ASA Creation, Atomic Groups, and Smart Contract calls.
- 📱 **Mobile Responsive** - Designed to look stunning on every device.

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/nickthelegend/connect-wallet-starter-v2-custodian
cd connect-wallet-starter-v2-custodian
npm install
```

### 2. Configure Environment

Create a `.env.local` file (or update `utils/AlgoWalletProvider.ts` directly) to point to your Kyra RPC endpoint:

```env
NEXT_PUBLIC_KYRA_BASE_URL=https://kyra.algocraft.fun
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to begin building.

## 🛠 Usage

### Wallet Connectivity

The application uses the `useWallet` hook to manage connections. Configuration is handled in `components/Providers.tsx`.

```tsx
import { useWallet } from '@txnlab/use-wallet-react'

const { activeAccount, signTransactions, sendTransactions } = useWallet()
```

### Custom Kyra Provider

The `AlgoWalletProvider` class implements the `CustomProvider` interface, allowing you to bridge traditional custodial backends into the `@txnlab` ecosystem.

It handles:
- **Connection Popup**: Authenticates via Supabase/Auth.
- **Transaction Signing**: Proxies signing requests to the Kyra Backend (Intermezzo).
- **Auto-Submission**: Supports backend-handled transaction submission to bypass Vault read restrictions.

## 📦 Project Structure

- `app/` - Next.js App Router pages and layouts.
- `components/` - Reusable UI components including the Wallet Provider wrapper.
- `utils/` - Core logic including the custom `AlgoWalletProvider`.
- `public/` - Static assets and logos.

## 🤝 Contributing

We built this at 2AM on caffeine and chaos! If you want to improve this starter, feel free to open a PR.

## 📜 License

MIT
