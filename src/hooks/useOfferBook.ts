import { useState, useEffect } from "react";
import { Horizon, Asset } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";

export interface UseOfferBookOptions {
  selling: Asset;
  buying: Asset;
  limit?: number;
  refetchInterval?: number;
}

export function useOfferBook(options: UseOfferBookOptions) {
  const { config } = useStellarContext();
  const [data, setData] = useState<Horizon.ServerApi.OrderbookRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    async function fetchOrderbook() {
      try {
        if (!data) setIsLoading(true);
        
        const server = new Horizon.Server(config.horizonUrl);
        const ob = await server.orderbook(options.selling, options.buying).limit(options.limit || 20).call();
        
        if (isMounted) {
          setData(ob);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (isMounted) setIsLoading(false);
        if (options.refetchInterval && isMounted) {
          timeoutId = setTimeout(fetchOrderbook, options.refetchInterval);
        }
      }
    }

    fetchOrderbook();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [config.horizonUrl, options.selling.toString(), options.buying.toString(), options.limit, options.refetchInterval]);

  return { data, isLoading, error };
}