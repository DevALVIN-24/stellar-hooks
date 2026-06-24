[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / PathPaymentAsset

# Type Alias: PathPaymentAsset

> **PathPaymentAsset** = \{ `type`: `"native"`; \} \| \{ `code`: `string`; `issuer`: `string`; `type`: `"credit"`; \}

Describes an asset for path payment.
Use `{ type: "native" }` for XLM.
Use `{ type: "credit", code: "USDC", issuer: "G..." }` for any other asset.
