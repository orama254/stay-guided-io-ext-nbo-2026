import { useQuery } from '@tanstack/react-query'
import type { PairSymbol } from '../types/forex'
import { fetchCandles, fetchQuotes } from '../server/functions'

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: () => fetchQuotes(),
    refetchInterval: 1_000,
  })
}

export function useCandles(pair: PairSymbol) {
  return useQuery({
    queryKey: ['candles', pair],
    queryFn: () => fetchCandles({ data: pair }),
    refetchInterval: 1_000,
  })
}
