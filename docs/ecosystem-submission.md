# Stellar Ecosystem Directory Submission

This document contains the information submitted to the
[Stellar Ecosystem Projects directory](https://stellar.org/ecosystem) for **stellar-hooks**.

The directory uses a web form at https://stellar.org/ecosystem#section-apply.
Fill in each field below when completing the form.

---

## Submission Fields

| Field | Value |
|---|---|
| **Project Name** | stellar-hooks |
| **Tagline** | React hooks for Stellar and Soroban — the wagmi you've been waiting for |
| **Category** | Developer Tools |
| **Website / GitHub** | https://github.com/dark-princezz/stellar-hooks |
| **npm** | https://www.npmjs.com/package/stellar-hooks |
| **Logo** | *(provide a square PNG/SVG, min 200×200 px)* |
| **Description** | stellar-hooks wires the Stellar JS SDK v13 and Freighter wallet API into ergonomic React hooks so developers can build Stellar and Soroban dApps without boilerplate. Ships with useFreighter, useStellarAccount, useStellarBalance, useSorobanContract, useTransaction, useLedgerEntry, usePayment, usePathPayment, useClaimableBalance, useContractEvents, useStellarToml, useWalletConnect, and more. Optional adapters for React Query and the Stellar Wallets Kit are available as separate packages. |
| **Network** | Mainnet, Testnet, Futurenet |
| **Open Source** | Yes — MIT |
| **Contact Email** | *(maintainer email)* |

---

## Short Description (≤ 160 chars)

```
React hooks for Stellar & Soroban. Freighter, Horizon, smart contracts, payments — all in one ergonomic library.
```

## Long Description

stellar-hooks is an open-source React library that brings the full Stellar developer
experience into a set of ergonomic, type-safe hooks. Inspired by wagmi for EVM, it
removes the boilerplate of connecting wallets, fetching account data, simulating and
submitting Soroban contract calls, and polling for transaction confirmation.

**Key hooks:**
- `useFreighter` — connect and sign with the Freighter browser extension
- `useStellarAccount` / `useStellarBalance` — live Horizon account and balance data
- `useSorobanContract` — full simulate → sign → submit → poll lifecycle in one hook
- `useTransaction` — submit a pre-signed XDR and poll for confirmation
- `useLedgerEntry` — read raw Soroban contract storage without a full contract call
- `usePayment` — send XLM or any Stellar asset in one hook
- `usePathPayment` — strict-send / strict-receive path payments
- `useClaimableBalance` — list and claim claimable balances
- `useContractEvents` — subscribe to Soroban contract events
- `useStellarToml` — fetch and parse `stellar.toml`
- `useWalletConnect` — WalletConnect v2 adapter for mobile wallet support
- `useWalletsKit` — multi-wallet adapter (xBull, Albedo, Lobstr, Rabet, …)

Optional packages: `@stellar-hooks/query` (React Query adapter) and `@stellar-hooks/swr` (SWR adapter).

Works with React 18+, TypeScript, and any Stellar network (testnet, mainnet, futurenet, custom).

---

## Links

- GitHub: https://github.com/dark-princezz/stellar-hooks
- npm: https://www.npmjs.com/package/stellar-hooks
- README / Docs: https://github.com/dark-princezz/stellar-hooks#readme
- Changelog: https://github.com/dark-princezz/stellar-hooks/blob/main/CHANGELOG.md

---

## Submission Status

- [ ] Form submitted at https://stellar.org/ecosystem#section-apply
- [ ] Confirmation email received
- [ ] Listed on stellar.org/ecosystem
