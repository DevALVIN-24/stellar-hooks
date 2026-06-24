import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSorobanContract } from "../hooks/useSorobanContract";
import { rpc, xdr } from "@stellar/stellar-sdk";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSignTransaction = vi.fn();
vi.mock("../hooks/useFreighter", () => ({
  useFreighter: () => ({
    publicKey: "GABC...",
    networkPassphrase: "Test Net",
    signTransaction: mockSignTransaction,
  }),
}));

vi.mock("../context", () => ({
  useStellarContext: () => ({
    config: { sorobanRpcUrl: "https://rpc.example.com", networkPassphrase: "Test Net" },
  }),
}));

const mockSimulateTransaction = vi.fn();
const mockSendTransaction = vi.fn();
const mockGetTransaction = vi.fn();
const mockGetAccount = vi.fn().mockResolvedValue({ sequenceNumber: () => "1" });

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    StrKey: {
      ...actual.StrKey,
      isValidContract: vi.fn().mockReturnValue(true),
    },
    rpc: {
      ...actual.rpc,
      Server: vi.fn().mockImplementation(() => ({
        simulateTransaction: mockSimulateTransaction,
        sendTransaction: mockSendTransaction,
        getTransaction: mockGetTransaction,
        getAccount: mockGetAccount,
      })),
      Api: {
        ...actual.rpc.Api,
        isSimulationError: () => false,
        GetTransactionStatus: { SUCCESS: "SUCCESS", FAILED: "FAILED" },
      },
      assembleTransaction: (tx: any) => ({ build: () => tx }),
    },
    Contract: vi.fn().mockImplementation(() => ({
      call: vi.fn().mockReturnValue({}),
    })),
  };
});

describe("useSorobanContract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with idle status", () => {
    const { result } = renderHook(() => useSorobanContract("C123", { method: "hello" }));
    expect(result.current.status).toBe("idle");
    expect(result.current.isLoading).toBe(false);
  });

  it("executes a full call lifecycle successfully", async () => {
    // Mocking the sequence of RPC responses
    mockSimulateTransaction.mockResolvedValue({ results: [{ retval: {} }] });
    mockSignTransaction.mockResolvedValue("signed-xdr");
    mockSendTransaction.mockResolvedValue({ status: "PENDING", hash: "tx-123" });
    mockGetTransaction.mockResolvedValue({
      status: "SUCCESS",
      resultMetaXdr: { toXDR: () => Buffer.from([]) } // simplified
    });

    const { result } = renderHook(() => useSorobanContract("C123", { method: "hello" }));

    let callResult;
    await act(async () => {
      callResult = await result.current.call();
    });

    expect(result.current.status).toBe("success");
    expect(result.current.hash).toBe("tx-123");
    expect(mockSignTransaction).toHaveBeenCalled();
    expect(mockSendTransaction).toHaveBeenCalled();
  });

  it("performs a query (simulation) without signing", async () => {
    mockSimulateTransaction.mockResolvedValue({
      result: { retval: xdr.ScVal.scvSymbol("query_ok") }
    });

    const { result } = renderHook(() => useSorobanContract("C123", { 
      method: "get_val",
      parseResult: (val: any) => "parsed_val"
    }));

    await act(async () => {
      const queryRes = await result.current.query();
      expect(queryRes).toBe("parsed_val");
    });

    expect(result.current.status).toBe("success");
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("resets state correctly", async () => {
    const { result } = renderHook(() => useSorobanContract("C123", { method: "hello" }));
    
    act(() => { result.current.reset(); });

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
  });
});