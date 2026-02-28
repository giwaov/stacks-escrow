# 🔒 Stacks Escrow

Secure peer-to-peer trading escrow service on Stacks blockchain.

## Features

- **Create Escrow**: Buyer deposits STX in escrow
- **Release**: Buyer releases funds to seller after receiving goods
- **Refund**: Seller can refund buyer if trade cancelled
- **On-chain Security**: All transactions secured by Stacks

## Tech Stack

- **Smart Contract**: Clarity on Stacks
- **Frontend**: Next.js 14 + TypeScript
- **Wallet**: @stacks/connect
- **Transactions**: @stacks/transactions

## Deployed Contract

**Mainnet**: `SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.escrow`

## Contract Functions

```clarity
(create-escrow (seller principal) (amount uint))
(release (escrow-id uint))
(refund (escrow-id uint))
(get-escrow (id uint))
```

## Quick Start

```bash
npm install
npm run dev
```

## License

MIT
