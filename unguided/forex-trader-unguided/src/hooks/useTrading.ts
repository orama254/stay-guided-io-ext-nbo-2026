import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { OrderSide, PairSymbol } from '../types/forex'
import { fetchPositions, fetchTrades, submitOrder } from '../server/functions'

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => fetchPositions(),
    refetchInterval: 2_000,
  })
}

export function useTradeHistory() {
  return useQuery({
    queryKey: ['trades'],
    queryFn: () => fetchTrades(),
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { pair: PairSymbol; side: OrderSide; units: number }) =>
      submitOrder({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}
