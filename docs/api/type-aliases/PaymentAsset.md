[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / PaymentAsset

# Type Alias: PaymentAsset

> **PaymentAsset** = \{ `type`: `"native"`; \} \| \{ `code`: `string`; `issuer`: `string`; `type`: `"credit"`; \}

Describes the asset to send.
Use `{ type: "native" }` for XLM.
Use `{ type: "credit", code: "USDC", issuer: "G..." }` for any other asset.
