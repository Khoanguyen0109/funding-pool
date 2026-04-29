import type { Transaction } from '@/types';
import { apiSlice } from './apiSlice';

interface DeleteTransactionArgs {
  poolId: string;
  transactionId: string;
  type: 'income' | 'expense';
}

const transactionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], string>({
      query: (poolId) => `/pools/${poolId}/transactions`,
      providesTags: (_result, _error, poolId) => [{ type: 'Transaction', id: poolId }],
    }),
    deleteTransaction: builder.mutation<{ deleted: boolean }, DeleteTransactionArgs>({
      query: ({ poolId, transactionId, type }) => ({
        url: `/pools/${poolId}/transactions/${transactionId}?type=${encodeURIComponent(type)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Transaction', id: poolId },
        { type: 'Contribution', id: poolId },
        { type: 'Expense', id: poolId },
        { type: 'Pool', id: poolId },
        { type: 'Pool', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

export const { useGetTransactionsQuery, useDeleteTransactionMutation } = transactionsApi;
