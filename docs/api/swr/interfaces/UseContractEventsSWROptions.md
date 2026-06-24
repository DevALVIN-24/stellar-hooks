[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / UseContractEventsSWROptions

# Interface: UseContractEventsSWROptions

## Extends

- [`StellarProvider`](../variables/StellarProvider.md)\<[`ContractEvent`](../type-aliases/ContractEvent.md)[]\>

## Properties

### contractId

> **contractId**: `string`

Soroban contract address (C...)

***

### enabled?

> `optional` **enabled?**: `boolean`

Whether fetching is active. Default: true

***

### startLedger?

> `optional` **startLedger?**: `number`

Ledger cursor to start from.

***

### topics?

> `optional` **topics?**: `string`[][]

Optional topic filters. Each entry is an array of topic segments.
