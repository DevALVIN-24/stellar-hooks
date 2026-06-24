import { describe, it, expect, vi } from "vitest";
import { useFreighterQuery } from "../hooks/useFreighterQuery";

const mockConnect = vi.fn();
const mockWallet = {
  isInstalled: true,
  isConnected: false,
  publicKey: null,
  network: null,
  networkPassphrase: null,
  isLoading: false,
  error: null,
  disconnect: vi.fn(),
  signTransaction: vi.fn(),
  signAuthEntry: vi.fn(),
  signBlob: vi.fn(),
};

vi.mock("stellar-hooks", () => ({
  useFreighter: () => ({ connect: mockConnect, ...mockWallet }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(({ mutationFn: _ }) => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  })),
}));

describe("useFreighterQuery", () => {
  it("returns connect, mutation flags, and wallet state", () => {
    const result = useFreighterQuery();

    expect(typeof result.connect).toBe("function");
    expect(result.isPending).toBe(false);
    expect(result.isError).toBe(false);
    expect(result.isSuccess).toBe(false);
    expect(result.error).toBeNull();
    expect(result.wallet).toMatchObject({
      isInstalled: true,
      isConnected: false,
      publicKey: null,
    });
  });

  it("exposes sign helpers on wallet", () => {
    const result = useFreighterQuery();

    expect(typeof result.wallet.signTransaction).toBe("function");
    expect(typeof result.wallet.signAuthEntry).toBe("function");
    expect(typeof result.wallet.signBlob).toBe("function");
    expect(typeof result.wallet.disconnect).toBe("function");
  });
});
