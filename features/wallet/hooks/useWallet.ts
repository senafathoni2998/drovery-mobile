import { useCallback, useEffect, useState } from 'react';
import { walletApi } from '@/features/wallet/services/walletApi';
import type { WalletTransaction } from '@/features/wallet/services/walletApi';

const PAGE_SIZE = 20;

export function useWallet() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('usd');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Append the next page's rows, deduping by id (the ledger is append-only, but a
  // new credit/debit between page fetches can shift the offset window).
  const mergeById = useCallback(
    (prev: WalletTransaction[], next: WalletTransaction[]) => {
      const seen = new Set(prev.map((t) => t.id));
      return [...prev, ...next.filter((t) => !seen.has(t.id))];
    },
    [],
  );

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await walletApi.getWallet(1, PAGE_SIZE);
      setBalance(result.balance);
      setCurrency(result.currency);
      setTransactions(result.transactions);
      setTotal(result.total);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const hasMore = transactions.length < total;

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      const result = await walletApi.getWallet(nextPage, PAGE_SIZE);
      setTransactions((prev) => mergeById(prev, result.transactions));
      setTotal(result.total);
      setBalance(result.balance);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, hasMore, page, mergeById]);

  return {
    balance,
    currency,
    transactions,
    loading,
    loadingMore,
    error,
    refetch: fetch,
    loadMore,
    hasMore,
  };
}
