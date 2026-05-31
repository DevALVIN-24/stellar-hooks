import React, { useEffect } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useStellarAccount } from "../hooks/useStellarAccount";

vi.mock("../context", () => ({
  useStellarContext: () => ({
    config: { horizonUrl: "https://horizon-testnet.stellar.org" },
    network: "testnet",
  }),
}));

const loadAccountMock = vi.fn(async () => ({
  account_id: "GTEST",
  sequence: "1",
  balances: [],
}));

vi.mock("@stellar/stellar-sdk", () => ({
  Horizon: {
    Server: vi.fn().mockImplementation(() => ({
      loadAccount: loadAccountMock,
    })),
  },
}));

function HookHarness({
  publicKey,
  refetchInterval,
}: {
  publicKey: string;
  refetchInterval: number;
}) {
  const { refetch } = useStellarAccount(publicKey, { refetchInterval });

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return null;
}

describe("useStellarAccount polling cleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    loadAccountMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears polling interval on unmount when refetchInterval > 0", async () => {
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <HookHarness publicKey="GABC" refetchInterval={10} />
      );
    });

    const callsBeforeUnmount = loadAccountMock.mock.calls.length;

    await act(async () => {
      renderer!.unmount();
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(loadAccountMock.mock.calls.length).toBe(callsBeforeUnmount);
  });
});

