import type { Transaction } from '@/types';
import { apiSlice } from './apiSlice';

const transactionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], string>({
      query: (poolId) => `/pools/${poolId}/transactions`,
      providesTags: (_result, _error, poolId) => [{ type: 'Transaction', id: poolId }],
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionsApi;
