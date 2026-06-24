/**
 * @file useSorobanContract.ts
 * @description Hook for interacting with Soroban smart contracts.
 * @package stellar-hooks
 * @license MIT
 */

import { useCallback, useReducer } from "react";
import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import type { Transaction } from "@stellar/stellar-sdk";
import * as rpc from "@stellar/stellar-sdk/rpc";
import { useStellarContext } from "../context";
import { useFreighter } from "./useFreighter";
import type { ContractCallOptions, UseContractCallReturn, TransactionStatus, StellarContractId, StellarXdrString } from "../types";
import { unsafeAsXdrString } from "../types";
import { sleep, backoff } from "../utils";
import type { ContractCallOptions, UseContractCallReturn, TransactionStatus } from "../types";
import { sleep, backoff, validateContractId } from "../utils";

// ─── State ─────────────────────────────────────────────────────────────────────

interface ContractState<TResult> {
  status: TransactionStatus;
  hash: string | null;
  result: TResult | null;
  error: Error | null;
}

type Action<TResult> =
  | { type: "RESET" }
  | { type: "BUILDING" }
  | { type: "SIGNING" }
  | { type: "SUBMITTING" }
  | { type: "POLLING" }
  | { type: "SUCCESS"; payload: TResult; hash: string }
  | { type: "ERROR"; payload: Error };

function createReducer<TResult>() {
  return function reducer(
    state: ContractState<TResult>,
    action: Action<TResult>,
  ): ContractState<TResult> {
    switch (action.type) {
      case "RESET":
        return { status: "idle", hash: null, result: null, error: null };
      case "BUILDING":
        return { ...state, status: "building", error: null };
      case "SIGNING":
        return { ...state, status: "signing" };
      case "SUBMITTING":
        return { ...state, status: "submitting" };
      case "POLLING":
        return { ...state, status: "polling" };
      case "SUCCESS":
        return { status: "success", hash: action.hash, result: action.payload, error: null };
      case "ERROR":
        return { ...state, status: "error", error: action.payload };
      default:
        return state;
    }
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Invoke a Soroban smart-contract method. Handles simulation, auth, submission,
 * and status polling in one hook.
 *
 * @returns {UseContractCallReturn}
 * @example
 * ```tsx
 * const { call, query, status, result } = useSorobanContract(
 *   "CABC...XYZ",
 *   {
 *     method: "increment",
 *     args: [nativeToScVal(1, { type: "u32" })],
 *   }
 * );
 *
 * return (
 *   <button onClick={() => call()} disabled={status !== "idle" && status !== "error"}>
 *     {status === "success" ? `Done! Hash: ${hash}` : "Increment"}
 *   </button>
 * );
 * ```
 */
export function useSorobanContract<TResult = unknown>(
  contractId: StellarContractId,
  options: Omit<ContractCallOptions<TResult>, "contractId">
): UseContractCallReturn<TResult> {
  const { config } = useStellarContext();
  const { publicKey, networkPassphrase, signTransaction } = useFreighter();

  // Destructure options to avoid dependency on the object reference itself
  const {
    method: baseMethod,
    args: baseArgs = [],
    fee: baseFee = BASE_FEE,
    timeoutSeconds: baseTimeout = 30,
    sorobanRpcServer,
    onSuccess,
    onError,
    parseResult: baseParse,
  } = options;

  const reducer = createReducer<TResult>();
  const [state, dispatch] = useReducer(reducer, {
    status: "idle",
    hash: null,
    result: null,
    error: null,
  });

  const call = useCallback(
    async (overrides?: Partial<Omit<ContractCallOptions<TResult>, "contractId">>): Promise<TResult | null> => {
      const {
        method = baseMethod,
        args = baseArgs,
        fee = baseFee,
        timeoutSeconds = baseTimeout,
        parseResult = baseParse,
      } = overrides || {};

      if (!publicKey) {
        const err = new Error("No wallet connected. Call useFreighter().connect() first.");
        dispatch({ type: "ERROR", payload: err });
        onError?.(err);
        return null;
      }

      try {
        // ── 0. Validate inputs ───────────────────────────────────────────────
        validateContractId(contractId);

        // ── 1. Build ──────────────────────────────────────────────────────────
        dispatch({ type: "BUILDING" });

        // rpc is the correct namespace in @stellar/stellar-sdk@13 (previously SorobanRpc)
        const server = sorobanRpcServer ?? new rpc.Server(config.sorobanRpcUrl);
        const contract = new Contract(contractId);

        // Convert plain JS values to ScVals if needed
        const scArgs = args.map((a) =>
          a instanceof xdr.ScVal ? a : nativeToScVal(a),
        );

        const account = await server.getAccount(publicKey);
        const passphrase = networkPassphrase ?? config.networkPassphrase;

        const tx = new TransactionBuilder(account, {
          fee: fee.toString(),
          networkPassphrase: passphrase,
        })
          .addOperation(contract.call(method, ...scArgs))
          .setTimeout(timeoutSeconds)
          .build();

        // ── 2. Simulate ───────────────────────────────────────────────────────
        const simResult = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationError(simResult)) {
          throw new Error(`Simulation failed: ${simResult.error}`);
        }

        const preparedTx = rpc.assembleTransaction(tx, simResult).build();

        // ── 3. Sign ───────────────────────────────────────────────────────────
        dispatch({ type: "SIGNING" });

        const signedXdr = await signTransaction(unsafeAsXdrString(preparedTx.toXDR()), {
          networkPassphrase: passphrase,
        });

        const signedTx = TransactionBuilder.fromXDR(
          signedXdr,
          passphrase,
        ) as Transaction;

        // ── 4. Submit ─────────────────────────────────────────────────────────
        dispatch({ type: "SUBMITTING" });

        const sendResult = await server.sendTransaction(signedTx);

        if (sendResult.status === "ERROR") {
          throw new Error(`Submission failed: ${JSON.stringify(sendResult.errorResult)}`);
        }

        const txHash = sendResult.hash;

        // ── 5. Poll ───────────────────────────────────────────────────────────
        dispatch({ type: "POLLING" });

        let attempt = 0;
        const deadline = Date.now() + timeoutSeconds * 1000;

        while (Date.now() < deadline) {
          await sleep(backoff(attempt));
          attempt++;

          const getResult = await server.getTransaction(txHash);

          if (getResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
            // Extract the return value from the meta
            let parsed: TResult = txHash as TResult;

            if (getResult.resultMetaXdr) {
              try {
                const meta = xdr.TransactionMeta.fromXDR(getResult.resultMetaXdr.toXDR());
                const v3 = meta.v3();
                const sorobanMeta = v3.sorobanMeta();
                if (sorobanMeta) {
                  const scVal = sorobanMeta.returnValue();
                  parsed = parseResult 
                    ? parseResult(scVal) 
                    : scVal as unknown as TResult;
                }
              } catch {
                // Non-fatal: return the hash as fallback
              }
            }

            dispatch({ type: "SUCCESS", payload: parsed, hash: txHash });
            onSuccess?.(parsed);
            return parsed;
          }

          if (getResult.status === rpc.Api.GetTransactionStatus.FAILED) {
            throw new Error(`Transaction failed: ${txHash}`);
          }
        }

        throw new Error(`Transaction timed out after ${timeoutSeconds}s: ${txHash}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        dispatch({ type: "ERROR", payload: error });
        onError?.(error);
        return null;
      }
    },
    [contractId, baseMethod, baseArgs, baseFee, baseTimeout, sorobanRpcServer, onSuccess, onError, baseParse, publicKey, networkPassphrase, signTransaction, config],
  );

  const simulate = useCallback(
    async (overrides?: Partial<Omit<ContractCallOptions<TResult>, "contractId">>): Promise<rpc.Api.SimulateTransactionResponse> => {
      const {
        method = baseMethod,
        args = baseArgs,
        fee = baseFee,
        timeoutSeconds = baseTimeout,
      } = overrides || {};

      if (!publicKey) {
        throw new Error("No wallet connected. Call useFreighter().connect() first.");
      }

      try {
        validateContractId(contractId);
        const server = sorobanRpcServer ?? new rpc.Server(config.sorobanRpcUrl);
        const contract = new Contract(contractId);

        // Convert plain JS values to ScVals if needed
        const scArgs = args.map((a) =>
          a instanceof xdr.ScVal ? a : nativeToScVal(a)
        );

        const account = await server.getAccount(publicKey);
        const passphrase = networkPassphrase ?? config.networkPassphrase;

        const tx = new TransactionBuilder(account, {
          fee: String(fee),
          networkPassphrase: passphrase,
        })
          .addOperation(contract.call(method, ...scArgs))
          .setTimeout(timeoutSeconds)
          .build();

        // Forward to RPC preflight endpoint
        return await server.simulateTransaction(tx);
      } catch (err) {
        // Gracefully bubble up construction or RPC errors
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    [contractId, baseMethod, baseArgs, baseFee, baseTimeout, sorobanRpcServer, publicKey, networkPassphrase, config]
  );

  const query = useCallback(
    async (overrides?: Partial<Omit<ContractCallOptions<TResult>, "contractId">>): Promise<TResult | null> => {
      const parseResult = overrides?.parseResult ?? baseParse;
      dispatch({ type: "BUILDING" });
      try {
        const sim = await simulate(overrides);
        if (rpc.Api.isSimulationError(sim)) {
          throw new Error(`Simulation failed: ${sim.error}`);
        }
        
        let parsed: TResult | null = null;
        if (sim.result) {
          const scVal = sim.result.retval;
          parsed = parseResult ? parseResult(scVal) : scVal as unknown as TResult;
        }

        dispatch({ type: "SUCCESS", payload: parsed as TResult, hash: "simulation" });
        return parsed;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        dispatch({ type: "ERROR", payload: error });
        return null;
      }
    },
    [baseParse, simulate]
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    ...state,
    isLoading: !["idle", "success", "error"].includes(state.status),
    isSuccess: state.status === "success",
    isError: state.status === "error",
    call,
    simulate,
    query,
    reset,
  };
}