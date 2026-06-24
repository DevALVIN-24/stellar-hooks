# Pull Request

## Summary
- Added stricter typing for Soroban contract call arguments in `ContractCallOptions`.
- `args` now accepts `xdr.ScVal[]` instead of `unknown[]`.
- `parseResult` now receives `xdr.ScVal` instead of `any`.

## Files Changed
- `src/types/index.ts`

## Testing
- Run `npm run typecheck`
- Run `npm test`

## Notes
- The hook implementation still supports runtime conversion of plain JS values via `nativeToScVal`.
- This change improves compile-time type safety for contract call arguments and result parsing.
